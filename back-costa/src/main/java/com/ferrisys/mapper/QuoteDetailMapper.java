package com.ferrisys.mapper;

import com.ferrisys.common.dto.QuoteDetailDTO;
import com.ferrisys.common.entity.business.QuoteDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface QuoteDetailMapper {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "quote", ignore = true)
    QuoteDetail toEntity(QuoteDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    QuoteDetailDTO toDto(QuoteDetail entity);

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
