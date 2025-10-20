package com.ferrisys.mapper;

import com.ferrisys.common.dto.PurchaseDetailDTO;
import com.ferrisys.common.entity.business.PurchaseDetail;
import com.ferrisys.mapper.support.IdMappingSupport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PurchaseDetailMapper extends IdMappingSupport {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "purchase", ignore = true)
    PurchaseDetail toEntity(PurchaseDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    PurchaseDetailDTO toDto(PurchaseDetail entity);
}
