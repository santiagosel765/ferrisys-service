package com.ferrisys.repository;

import com.ferrisys.common.entity.user.AuthUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthUserRoleRepository extends JpaRepository<AuthUserRole, UUID> {

    Optional<AuthUserRole> findByUserId(UUID userId);
}
