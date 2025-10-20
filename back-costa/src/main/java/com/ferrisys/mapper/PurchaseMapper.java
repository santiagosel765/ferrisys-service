package com.ferrisys.mapper;

import com.ferrisys.common.dto.PurchaseDTO;
import com.ferrisys.common.entity.business.Purchase;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.UUID;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {PurchaseDetailMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PurchaseMapper {

    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "provider.id", source = "providerId"),
            @Mapping(target = "status", source = "status", defaultValue = "1")
    })
    Purchase toEntity(PurchaseDTO dto);

    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "providerId", source = "provider.id")
    })
    PurchaseDTO toDto(Purchase entity);

    List<PurchaseDTO> toDtoList(List<Purchase> entities);

    @AfterMapping
    default void linkDetails(@MappingTarget Purchase purchase) {
        if (purchase.getDetails() != null) {
            purchase.getDetails().forEach(detail -> detail.setPurchase(purchase));
        }
    }

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
