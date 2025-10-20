package com.ferrisys.mapper;

import com.ferrisys.common.dto.ModuleDTO;
import com.ferrisys.common.entity.user.AuthModule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModuleMapper {

    @Mapping(target = "status", source = "status", defaultValue = "1")
    AuthModule toEntity(ModuleDTO dto);

    ModuleDTO toDto(AuthModule entity);

    List<ModuleDTO> toDtoList(List<AuthModule> entities);
}
