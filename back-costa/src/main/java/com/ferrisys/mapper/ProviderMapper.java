package com.ferrisys.mapper;

import com.ferrisys.common.dto.ProviderDTO;
import com.ferrisys.common.entity.business.Provider;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProviderMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "status", source = "status", defaultValue = "1")
    Provider toEntity(ProviderDTO dto);

    @Mapping(target = "id", source = "id")
    ProviderDTO toDto(Provider entity);

    List<ProviderDTO> toDtoList(List<Provider> entities);

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
