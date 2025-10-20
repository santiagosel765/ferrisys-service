package com.ferrisys.mapper;

import com.ferrisys.common.dto.QuoteDTO;
import com.ferrisys.common.entity.business.Quote;
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
        uses = {QuoteDetailMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface QuoteMapper {

    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "client.id", source = "clientId"),
            @Mapping(target = "status", source = "status", defaultValue = "1")
    })
    Quote toEntity(QuoteDTO dto);

    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "clientId", source = "client.id")
    })
    QuoteDTO toDto(Quote entity);

    List<QuoteDTO> toDtoList(List<Quote> entities);

    @AfterMapping
    default void linkDetails(@MappingTarget Quote quote) {
        if (quote.getDetails() != null) {
            quote.getDetails().forEach(detail -> detail.setQuote(quote));
        }
    }

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
