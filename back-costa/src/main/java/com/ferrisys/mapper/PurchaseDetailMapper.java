package com.ferrisys.mapper;

import com.ferrisys.common.dto.PurchaseDetailDTO;
import com.ferrisys.common.entity.business.PurchaseDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchaseDetailMapper {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "purchase", ignore = true)
    PurchaseDetail toEntity(PurchaseDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    PurchaseDetailDTO toDto(PurchaseDetail entity);
}
