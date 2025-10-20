package com.ferrisys.service.business.impl;

import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.common.dto.PurchaseDTO;
import com.ferrisys.common.dto.PurchaseDetailDTO;
import com.ferrisys.common.entity.business.Provider;
import com.ferrisys.common.entity.business.Purchase;
import com.ferrisys.common.entity.business.PurchaseDetail;
import com.ferrisys.common.entity.inventory.Product;
import com.ferrisys.repository.ProviderRepository;
import com.ferrisys.repository.PurchaseRepository;
import com.ferrisys.repository.PurchaseDetailRepository;
import com.ferrisys.repository.ProductRepository;
import com.ferrisys.service.business.PurchaseService;
import java.util.UUID;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProviderRepository providerRepository;
    private final PurchaseDetailRepository detailRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void saveOrUpdate(PurchaseDTO dto) {
        Purchase purchase = dto.getId() != null
                ? purchaseRepository.findById(dto.getId()).orElse(new Purchase())
                : new Purchase();
        Provider provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        purchase.setProvider(provider);
        purchase.setDescription(dto.getDescription());
        purchase.setDate(dto.getDate());
        purchase.setTotal(dto.getTotal());
        purchase.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        purchaseRepository.save(purchase);

        // replace details
        detailRepository.deleteByPurchase(purchase);
        if (dto.getDetails() != null) {
            for (PurchaseDetailDTO d : dto.getDetails()) {
                Product product = productRepository.findById(d.getProductId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                PurchaseDetail detail = PurchaseDetail.builder()
                        .purchase(purchase)
                        .product(product)
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .build();
                detailRepository.save(detail);
            }
        }
    }

    @Override
    @Transactional
    public void disable(UUID id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));
        purchase.setStatus(0);
        purchaseRepository.save(purchase);
    }

    @Override
    public PageResponse<PurchaseDTO> list(int page, int size) {
        Page<Purchase> result = purchaseRepository.findAll(PageRequest.of(page, size));
        List<PurchaseDTO> content = result.getContent().stream()
                .map(p -> PurchaseDTO.builder()
                        .id(p.getId())
                        .providerId(p.getProvider().getId())
                        .description(p.getDescription())
                        .date(p.getDate())
                        .details(p.getDetails() == null ? null : p.getDetails().stream()
                                .map(d -> PurchaseDetailDTO.builder()
                                        .productId(d.getProduct().getId())
                                        .quantity(d.getQuantity())
                                        .unitPrice(d.getUnitPrice())
                                        .build())
                                .toList())
                        .total(p.getTotal())
                        .status(p.getStatus())
                        .build())
                .toList();
        return new PageResponse<>(content, result.getTotalPages(), result.getTotalElements(),
                result.getNumber(), result.getSize());
    }
}
