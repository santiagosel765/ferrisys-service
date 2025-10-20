package com.ferrisys.config.security;

import com.ferrisys.common.entity.user.AuthModule;
import com.ferrisys.common.entity.user.AuthUserRole;
import com.ferrisys.common.entity.user.Role;
import com.ferrisys.common.entity.user.User;
import com.ferrisys.common.exception.impl.NotFoundException;
import com.ferrisys.repository.RoleModuleRepository;
import com.ferrisys.service.UserService;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService userService;
    private final RoleModuleRepository roleModuleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            User user = userService.getAuthUser(username);
            AuthUserRole userRole = userService.getUserRole(user.getId());
            Role role = userRole.getRole();

            Set<GrantedAuthority> authorities = new HashSet<>();
            if (role != null && role.getName() != null && !role.getName().isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + normalize(role.getName())));
            }

            if (role != null && role.getId() != null) {
                roleModuleRepository.findModulesByRoleId(role.getId(), Pageable.unpaged())
                        .forEach(module -> addModuleAuthority(authorities, module));
            }

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPassword())
                    .authorities(authorities)
                    .accountLocked(false)
                    .accountExpired(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        } catch (NotFoundException ex) {
            throw new UsernameNotFoundException(ex.getMessage(), ex);
        }
    }

    private void addModuleAuthority(Set<GrantedAuthority> authorities, AuthModule module) {
        if (module != null && module.getName() != null && !module.getName().isBlank()) {
            authorities.add(new SimpleGrantedAuthority("MODULE_" + normalize(module.getName())));
        }
    }

    private String normalize(String value) {
        return value.trim().replaceAll("[^A-Za-z0-9]+", "_").toUpperCase(Locale.ROOT);
    }
}
