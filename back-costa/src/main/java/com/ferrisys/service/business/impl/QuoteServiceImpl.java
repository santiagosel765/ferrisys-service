package com.ferrisys.service.business.impl;

import com.ferrisys.common.dto.PageResponse;
import com.ferrisys.common.dto.QuoteDTO;
import com.ferrisys.common.dto.QuoteDetailDTO;
import com.ferrisys.common.entity.business.Client;
import com.ferrisys.common.entity.business.Quote;
import com.ferrisys.common.entity.business.QuoteDetail;
import com.ferrisys.common.entity.inventory.Product;
import com.ferrisys.repository.ClientRepository;
import com.ferrisys.repository.QuoteRepository;
import com.ferrisys.repository.QuoteDetailRepository;
import com.ferrisys.repository.ProductRepository;
import com.ferrisys.service.business.QuoteService;
import java.util.UUID;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final ClientRepository clientRepository;
    private final QuoteDetailRepository detailRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void saveOrUpdate(QuoteDTO dto) {
        Quote quote = dto.getId() != null
                ? quoteRepository.findById(dto.getId()).orElse(new Quote())
                : new Quote();
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        quote.setClient(client);
        quote.setDescription(dto.getDescription());
        quote.setDate(dto.getDate());
        quote.setTotal(dto.getTotal());
        quote.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        quoteRepository.save(quote);

        detailRepository.deleteByQuote(quote);
        if (dto.getDetails() != null) {
            for (QuoteDetailDTO d : dto.getDetails()) {
                Product product = productRepository.findById(d.getProductId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                QuoteDetail detail = QuoteDetail.builder()
                        .quote(quote)
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
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotización no encontrada"));
        quote.setStatus(0);
        quoteRepository.save(quote);
    }

    @Override
    public PageResponse<QuoteDTO> list(int page, int size) {
        Page<Quote> result = quoteRepository.findAll(PageRequest.of(page, size));
        List<QuoteDTO> content = result.getContent().stream()
                .map(q -> QuoteDTO.builder()
                        .id(q.getId())
                        .clientId(q.getClient().getId())
                        .description(q.getDescription())
                        .date(q.getDate())
                        .details(q.getDetails() == null ? null : q.getDetails().stream()
                                .map(d -> QuoteDetailDTO.builder()
                                        .productId(d.getProduct().getId())
                                        .quantity(d.getQuantity())
                                        .unitPrice(d.getUnitPrice())
                                        .build())
                                .toList())
                        .total(q.getTotal())
                        .status(q.getStatus())
                        .build())
                .toList();
        return new PageResponse<>(content, result.getTotalPages(), result.getTotalElements(),
                result.getNumber(), result.getSize());
    }
}
