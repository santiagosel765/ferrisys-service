package com.ferrisys.mapper;

import com.ferrisys.common.dto.ProviderDTO;
import com.ferrisys.common.entity.business.Provider;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProviderMapper {

    @Mapping(target = "status", source = "status", defaultValue = "1")
    Provider toEntity(ProviderDTO dto);

    ProviderDTO toDto(Provider entity);

    List<ProviderDTO> toDtoList(List<Provider> entities);
}
