package com.ferrisys.mapper;

import com.ferrisys.common.dto.QuoteDTO;
import com.ferrisys.common.entity.business.Quote;
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
        uses = {QuoteDetailMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface QuoteMapper extends IdMappingSupport {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "client.id", source = "clientId")
    Quote toEntity(QuoteDTO dto);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "clientId", source = "client.id")
    QuoteDTO toDto(Quote entity);

    List<QuoteDTO> toDtoList(List<Quote> entities);

    @AfterMapping
    default void linkDetails(@MappingTarget Quote quote) {
        if (quote.getDetails() != null) {
            quote.getDetails().forEach(detail -> detail.setQuote(quote));
        }
    }
}
