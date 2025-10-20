package com.ferrisys.service.impl;

import com.ferrisys.common.entity.license.ModuleLicense;
import com.ferrisys.common.entity.user.AuthModule;
import com.ferrisys.common.entity.user.User;
import com.ferrisys.config.security.JWTUtil;
import com.ferrisys.repository.ModuleLicenseRepository;
import com.ferrisys.repository.ModuleRepository;
import com.ferrisys.repository.UserRepository;
import com.ferrisys.service.FeatureFlagService;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service("featureFlagService")
public class FeatureFlagServiceImpl implements FeatureFlagService {

    private final ModuleRepository moduleRepository;
    private final ModuleLicenseRepository moduleLicenseRepository;
    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final Environment environment;

    public FeatureFlagServiceImpl(
            ModuleRepository moduleRepository,
            ModuleLicenseRepository moduleLicenseRepository,
            UserRepository userRepository,
            JWTUtil jwtUtil,
            Environment environment) {
        this.moduleRepository = moduleRepository;
        this.moduleLicenseRepository = moduleLicenseRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.environment = environment;
    }

    @Override
    public boolean enabled(UUID tenantId, String moduleSlug) {
        if (tenantId == null || moduleSlug == null || moduleSlug.isBlank()) {
            return false;
        }

        String propertySlug = normalizeForProperty(moduleSlug);
        boolean propertyEnabled = environment.getProperty(
                "modules." + propertySlug + ".enabled", Boolean.class, Boolean.TRUE);
        if (!propertyEnabled) {
            return false;
        }

        String moduleName = normalizeForModule(moduleSlug);
        Optional<AuthModule> moduleOpt = moduleRepository.findByNameIgnoreCase(moduleName);
        if (moduleOpt.isEmpty()) {
            return propertyEnabled;
        }

        AuthModule module = moduleOpt.get();
        Optional<ModuleLicense> licenseOpt = moduleLicenseRepository.findByTenantIdAndModule_Id(
                tenantId, module.getId());

        if (licenseOpt.isEmpty()) {
            return propertyEnabled;
        }

        ModuleLicense license = licenseOpt.get();
        if (Boolean.FALSE.equals(license.getEnabled())) {
            return false;
        }

        OffsetDateTime expiresAt = license.getExpiresAt();
        return expiresAt == null || expiresAt.isAfter(OffsetDateTime.now());
    }

    @Override
    public boolean enabledForCurrentUser(String moduleSlug) {
        String username = jwtUtil.getCurrentUser();
        if (username == null || username.isBlank()) {
            return false;
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.filter(user -> enabled(user.getId(), moduleSlug)).isPresent();
    }

    private String normalizeForProperty(String slug) {
        return slug.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
    }

    private String normalizeForModule(String slug) {
        return slug.trim().replaceAll("[^A-Za-z0-9]+", "_").toUpperCase(Locale.ROOT);
    }
}
