package com.ferrisys.service.impl;

import com.ferrisys.common.dto.ModuleDTO;
import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.common.entity.user.AuthModule;
import com.ferrisys.repository.ModuleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.UUID;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl {

    private final ModuleRepository moduleRepository;

    @Transactional
    public void saveOrUpdate(ModuleDTO dto) {
        AuthModule module;
        if (dto.getId() != null) {
            module = moduleRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
            module.setName(dto.getName());
            module.setDescription(dto.getDescription());
            module.setStatus(dto.getStatus());
        } else {
            module = AuthModule.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .status(dto.getStatus() != null ? dto.getStatus() : 1)
                    .build();
        }

        moduleRepository.save(module);
    }

    public PageResponse<ModuleDTO> getAll(int page, int size) {
        Page<AuthModule> result = moduleRepository.findAll(PageRequest.of(page, size));
        List<ModuleDTO> content = result.getContent().stream()
                .map(m -> ModuleDTO.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .description(m.getDescription())
                        .status(m.getStatus())
                        .build())
                .toList();
        return new PageResponse<>(content, result.getTotalPages(), result.getTotalElements(),
                result.getNumber(), result.getSize());
    }

    public void disableModule(UUID id) {
        AuthModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        module.setStatus(0);
        moduleRepository.save(module);
    }
}
