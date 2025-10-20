package com.ferrisys.service.business.impl;

import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.common.dto.ProviderDTO;
import com.ferrisys.common.entity.business.Provider;
import com.ferrisys.repository.ProviderRepository;
import com.ferrisys.service.business.ProviderService;
import java.util.UUID;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {

    private final ProviderRepository providerRepository;

    @Override
    @Transactional
    public void saveOrUpdate(ProviderDTO dto) {
        Provider provider = dto.getId() != null
                ? providerRepository.findById(dto.getId()).orElse(new Provider())
                : new Provider();
        provider.setName(dto.getName());
        provider.setContact(dto.getContact());
        provider.setPhone(dto.getPhone());
        provider.setAddress(dto.getAddress());
        provider.setRuc(dto.getRuc());
        provider.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        providerRepository.save(provider);
    }

    @Override
    @Transactional
    public void disable(UUID id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        provider.setStatus(0);
        providerRepository.save(provider);
    }

    @Override
    public PageResponse<ProviderDTO> list(int page, int size) {
        Page<Provider> result = providerRepository.findAll(PageRequest.of(page, size));
        List<ProviderDTO> content = result.getContent().stream()
                .map(p -> ProviderDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .contact(p.getContact())
                        .phone(p.getPhone())
                        .address(p.getAddress())
                        .ruc(p.getRuc())
                        .status(p.getStatus())
                        .build())
                .toList();
        return new PageResponse<>(content, result.getTotalPages(), result.getTotalElements(),
                result.getNumber(), result.getSize());
    }
}
