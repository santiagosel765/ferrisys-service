package com.ferrisys.mapper;

import com.ferrisys.common.dto.ModuleDTO;
import com.ferrisys.common.entity.user.AuthModule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ModuleMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "status", source = "status", defaultValue = "1")
    AuthModule toEntity(ModuleDTO dto);

    @Mapping(target = "id", source = "id")
    ModuleDTO toDto(AuthModule entity);

    List<ModuleDTO> toDtoList(List<AuthModule> entities);

    default UUID toUuid(String id) {
        return id == null ? null : UUID.fromString(id);
    }

    default String fromUuid(UUID id) {
        return id == null ? null : id.toString();
    }
}
