package com.ferrisys.controller;

import com.ferrisys.common.dto.RegisterRequest;
import com.ferrisys.common.entity.license.ModuleLicense;
import com.ferrisys.common.entity.user.AuthModule;
import com.ferrisys.common.entity.user.AuthRoleModule;
import com.ferrisys.common.entity.user.AuthUserRole;
import com.ferrisys.common.entity.user.Role;
import com.ferrisys.common.entity.user.User;
import com.ferrisys.common.exception.impl.NotFoundException;
import com.ferrisys.repository.AuthUserRoleRepository;
import com.ferrisys.repository.ModuleLicenseRepository;
import com.ferrisys.repository.ModuleRepository;
import com.ferrisys.repository.RoleModuleRepository;
import com.ferrisys.repository.RoleRepository;
import com.ferrisys.repository.UserRepository;
import com.ferrisys.service.UserService;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MODULE_CORE_DE_AUTENTICACION')")
public class AuthAdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final RoleModuleRepository roleModuleRepository;
    private final AuthUserRoleRepository authUserRoleRepository;
    private final ModuleLicenseRepository moduleLicenseRepository;
    private final UserService userService;

    // --- Users ---
    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody AdminUserRequest request) {
        RegisterRequest register = new RegisterRequest();
        register.setUsername(request.username());
        register.setEmail(request.email());
        register.setFullName(request.fullName());
        register.setPassword(request.password());
        userService.registerUser(register);
        return userRepository.findByUsername(request.username()).orElseThrow(() -> new NotFoundException("User not created"));
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable UUID id, @RequestBody AdminUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setStatus(request.status());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(new BCryptPasswordEncoder().encode(request.password()));
        }
        return userRepository.save(user);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @PostMapping("/user-roles")
    @Transactional
    public void assignUserRole(@RequestBody UserRoleRequest request) {
        User user = userRepository.findById(request.userId()).orElseThrow(() -> new NotFoundException("User not found"));
        Role role = roleRepository.findById(request.roleId()).orElseThrow(() -> new NotFoundException("Role not found"));

        authUserRoleRepository.findByUserId(user.getId()).ifPresent(existing -> authUserRoleRepository.deleteById(existing.getId()));
        AuthUserRole assignment = AuthUserRole.builder()
                .user(user)
                .role(role)
                .status(1)
                .build();
        authUserRoleRepository.save(assignment);
    }

    // --- Roles ---
    @GetMapping("/roles")
    public List<Role> listRoles() {
        return roleRepository.findAll();
    }

    @GetMapping("/roles/{id}")
    public Role getRole(@PathVariable UUID id) {
        return roleRepository.findById(id).orElseThrow(() -> new NotFoundException("Role not found"));
    }

    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    public Role createRole(@RequestBody AdminRoleRequest request) {
        Role role = Role.builder()
                .name(request.name())
                .description(request.description())
                .status(request.status())
                .build();
        return roleRepository.save(role);
    }

    @PutMapping("/roles/{id}")
    public Role updateRole(@PathVariable UUID id, @RequestBody AdminRoleRequest request) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new NotFoundException("Role not found"));
        role.setName(request.name());
        role.setDescription(request.description());
        role.setStatus(request.status());
        return roleRepository.save(role);
    }

    @DeleteMapping("/roles/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRole(@PathVariable UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new NotFoundException("Role not found");
        }
        roleRepository.deleteById(id);
    }

    // --- Modules ---
    @GetMapping("/modules")
    public List<AuthModule> listModules() {
        return moduleRepository.findAll();
    }

    @GetMapping("/modules/{id}")
    public AuthModule getModule(@PathVariable UUID id) {
        return moduleRepository.findById(id).orElseThrow(() -> new NotFoundException("Module not found"));
    }

    @PostMapping("/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthModule createModule(@RequestBody AdminModuleRequest request) {
        AuthModule module = AuthModule.builder()
                .name(request.name())
                .description(request.description())
                .status(request.status())
                .build();
        return moduleRepository.save(module);
    }

    @PutMapping("/modules/{id}")
    public AuthModule updateModule(@PathVariable UUID id, @RequestBody AdminModuleRequest request) {
        AuthModule module = moduleRepository.findById(id).orElseThrow(() -> new NotFoundException("Module not found"));
        module.setName(request.name());
        module.setDescription(request.description());
        module.setStatus(request.status());
        return moduleRepository.save(module);
    }

    @DeleteMapping("/modules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteModule(@PathVariable UUID id) {
        if (!moduleRepository.existsById(id)) {
            throw new NotFoundException("Module not found");
        }
        moduleRepository.deleteById(id);
    }

    // --- Role Modules ---
    @GetMapping("/role-modules")
    public List<AuthRoleModule> listRoleModules() {
        return roleModuleRepository.findAll();
    }

    @PostMapping("/role-modules")
    @Transactional
    public void saveRoleModules(@RequestBody RoleModuleRequest request) {
        Role role = roleRepository.findById(request.roleId()).orElseThrow(() -> new NotFoundException("Role not found"));
        roleModuleRepository.deleteByRole(role);
        if (request.moduleIds() != null) {
            for (UUID moduleId : request.moduleIds()) {
                AuthModule module = moduleRepository.findById(moduleId).orElseThrow(() -> new NotFoundException("Module not found"));
                AuthRoleModule assignment = AuthRoleModule.builder()
                        .role(role)
                        .module(module)
                        .status(1)
                        .build();
                roleModuleRepository.save(assignment);
            }
        }
    }

    // --- Module Licenses ---
    @GetMapping("/module-licenses")
    public List<ModuleLicense> listLicenses() {
        return moduleLicenseRepository.findAll();
    }

    @PostMapping("/module-licenses")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleLicense createLicense(@RequestBody ModuleLicenseRequest request) {
        AuthModule module = moduleRepository.findById(request.moduleId()).orElseThrow(() -> new NotFoundException("Module not found"));
        ModuleLicense license = ModuleLicense.builder()
                .tenantId(request.tenantId())
                .module(module)
                .enabled(request.enabled())
                .expiresAt(request.expiresAt())
                .build();
        return moduleLicenseRepository.save(license);
    }

    public record AdminUserRequest(String username, String email, String fullName, String password, Integer status) {}
    public record AdminRoleRequest(String name, String description, Integer status) {}
    public record AdminModuleRequest(String name, String description, Integer status) {}
    public record RoleModuleRequest(UUID roleId, List<UUID> moduleIds) {}
    public record UserRoleRequest(UUID userId, UUID roleId) {}
    public record ModuleLicenseRequest(UUID tenantId, UUID moduleId, Boolean enabled, OffsetDateTime expiresAt) {}
}
