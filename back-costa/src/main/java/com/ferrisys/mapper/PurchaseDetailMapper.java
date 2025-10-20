package com.ferrisys.mapper;

import com.ferrisys.common.dto.PurchaseDetailDTO;
import com.ferrisys.common.entity.business.PurchaseDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PurchaseDetailMapper {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "purchase", ignore = true)
    PurchaseDetail toEntity(PurchaseDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    PurchaseDetailDTO toDto(PurchaseDetail entity);

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
