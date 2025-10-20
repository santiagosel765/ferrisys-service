package com.ferrisys.mapper;

import com.ferrisys.common.dto.QuoteDetailDTO;
import com.ferrisys.common.entity.business.QuoteDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuoteDetailMapper {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "quote", ignore = true)
    QuoteDetail toEntity(QuoteDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    QuoteDetailDTO toDto(QuoteDetail entity);
}
