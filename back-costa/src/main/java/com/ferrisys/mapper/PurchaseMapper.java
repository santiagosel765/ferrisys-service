package com.ferrisys.mapper;

import com.ferrisys.common.dto.PurchaseDTO;
import com.ferrisys.common.entity.business.Purchase;
import com.ferrisys.mapper.support.IdMappingSupport;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {PurchaseDetailMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PurchaseMapper extends IdMappingSupport {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "provider.id", source = "providerId")
    Purchase toEntity(PurchaseDTO dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "providerId", source = "provider.id")
    PurchaseDTO toDto(Purchase entity);

    List<PurchaseDTO> toDtoList(List<Purchase> entities);

    @AfterMapping
    default void linkDetails(@MappingTarget Purchase purchase) {
        if (purchase.getDetails() != null) {
            purchase.getDetails().forEach(detail -> detail.setPurchase(purchase));
        }
    }
}
