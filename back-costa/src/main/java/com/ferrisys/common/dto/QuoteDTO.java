package com.ferrisys.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;
import java.util.List;
import java.time.LocalDate;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteDTO {
    private UUID id;
    private UUID clientId;
    private String description;
    private LocalDate date;
    private List<QuoteDetailDTO> details;
    private BigDecimal total;
    private Integer status;
}
