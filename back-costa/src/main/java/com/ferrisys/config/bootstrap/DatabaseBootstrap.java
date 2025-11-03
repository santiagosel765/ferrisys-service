package com.ferrisys.config.bootstrap;

import com.ferrisys.common.entity.user.AuthUserRole;
import com.ferrisys.common.entity.user.Role;
import com.ferrisys.common.entity.user.User;
import com.ferrisys.common.entity.user.UserStatus;
import com.ferrisys.repository.AuthUserRoleRepository;
import com.ferrisys.repository.ModuleRepository;
import com.ferrisys.repository.RoleRepository;
import com.ferrisys.repository.UserRepository;
import com.ferrisys.repository.UserStatusRepository;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseBootstrap implements CommandLineRunner {

    private static final UUID ACTIVE_STATUS_ID = UUID.fromString("6b393ccc-1eba-4075-9fb2-80091d80f87e");
    private static final UUID ADMIN_ROLE_ID = UUID.fromString("20bda0bd-c44b-4e46-af5f-d77697a2f7b2");
    private static final UUID ADMIN_USER_ID = UUID.fromString("6cde6b18-4c8b-4429-b4d5-257a0bf8c7b7");
    private static final String ADMIN_USERNAME = "admin1";
    private static final String ADMIN_EMAIL = "admin1@ferrisys.local";
    private static final String ADMIN_FULL_NAME = "Administrador General";
    private static final String ADMIN_PASSWORD_HASH = "$2b$12$NBU1TlOM1evYLGuigxDkJeiAekov5XZ1DEdMQLTRoBWQHHZyw5rEK";

    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AuthUserRoleRepository authUserRoleRepository;
    private final ModuleRepository moduleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        UserStatus activeStatus = userStatusRepository.findById(ACTIVE_STATUS_ID)
            .orElseGet(() -> userStatusRepository.save(UserStatus.builder()
                .statusId(ACTIVE_STATUS_ID)
                .name("ACTIVE")
                .description("Usuario activo")
                .build()));

        Role adminRole = roleRepository.findByName("ADMIN")
            .map(existing -> {
                existing.setDescription("Administrador del sistema");
                existing.setStatus(1);
                return existing;
            })
            .orElse(Role.builder()
                .id(ADMIN_ROLE_ID)
                .name("ADMIN")
                .description("Administrador del sistema")
                .status(1)
                .build());
        adminRole.setId(ADMIN_ROLE_ID);
        adminRole = roleRepository.save(adminRole);

        User adminUser = userRepository.findByUsername(ADMIN_USERNAME)
            .map(existing -> {
                existing.setPassword(ADMIN_PASSWORD_HASH);
                existing.setEmail(ADMIN_EMAIL);
                existing.setFullName(ADMIN_FULL_NAME);
                existing.setStatus(activeStatus);
                return existing;
            })
            .orElse(User.builder()
                .id(ADMIN_USER_ID)
                .username(ADMIN_USERNAME)
                .password(ADMIN_PASSWORD_HASH)
                .email(ADMIN_EMAIL)
                .fullName(ADMIN_FULL_NAME)
                .status(activeStatus)
                .build());
        adminUser.setId(ADMIN_USER_ID);
        adminUser = userRepository.save(adminUser);

        authUserRoleRepository.findByUserId(adminUser.getId())
            .map(existing -> {
                existing.setRole(adminRole);
                existing.setStatus(1);
                return authUserRoleRepository.save(existing);
            })
            .orElseGet(() -> authUserRoleRepository.save(AuthUserRole.builder()
                .id(UUID.nameUUIDFromBytes((adminUser.getId().toString() + ADMIN_ROLE_ID).getBytes(StandardCharsets.UTF_8)))
                .user(adminUser)
                .role(adminRole)
                .status(1)
                .build()));

        log.info("✅ Seeds aplicados correctamente. Usuario admin: admin1 / admin123");
        log.info("✅ Módulos cargados: {}", moduleRepository.count());
    }
}
