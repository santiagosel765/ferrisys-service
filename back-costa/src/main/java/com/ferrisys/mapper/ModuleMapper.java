package com.ferrisys.mapper;

import com.ferrisys.common.dto.ModuleDTO;
import com.ferrisys.common.entity.user.AuthModule;
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
public interface ModuleMapper extends IdMappingSupport {

    @Mapping(target = "id", source = "id")
    AuthModule toEntity(ModuleDTO dto);

    @Mapping(target = "id", source = "id")
    ModuleDTO toDto(AuthModule entity);

    List<ModuleDTO> toDtoList(List<AuthModule> entities);
}
