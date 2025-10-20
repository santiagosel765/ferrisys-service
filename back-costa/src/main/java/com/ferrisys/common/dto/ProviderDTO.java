package com.ferrisys.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderDTO {
    private UUID id;
    private String name;
    private String contact;
    private String phone;
    private String address;
    private String ruc;
    private Integer status;
}
