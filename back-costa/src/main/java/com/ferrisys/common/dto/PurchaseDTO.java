package com.ferrisys.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseDTO {
    private UUID id;
    private UUID providerId;
    private String description;
    private LocalDate date;
    private List<PurchaseDetailDTO> details;
    private BigDecimal total;
    private Integer status;
}
