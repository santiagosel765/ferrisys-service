package com.ferrisys.mapper;

import com.ferrisys.common.dto.ProviderDTO;
import com.ferrisys.common.entity.business.Provider;
import com.ferrisys.mapper.support.IdMappingSupport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ProviderMapper extends IdMappingSupport {

    @Mapping(target = "id", source = "id")
    Provider toEntity(ProviderDTO dto);

    @Mapping(target = "id", source = "id")
    ProviderDTO toDto(Provider entity);

    List<ProviderDTO> toDtoList(List<Provider> entities);
}
