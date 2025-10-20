package com.ferrisys.mapper;

import com.ferrisys.common.dto.QuoteDetailDTO;
import com.ferrisys.common.entity.business.QuoteDetail;
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
public interface QuoteDetailMapper extends IdMappingSupport {

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "quote", ignore = true)
    QuoteDetail toEntity(QuoteDetailDTO dto);

    @Mapping(target = "productId", source = "product.id")
    QuoteDetailDTO toDto(QuoteDetail entity);
}
