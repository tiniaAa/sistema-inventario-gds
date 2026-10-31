package com.inventario.gds.dto.response;

import com.inventario.gds.entity.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoResponseDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoSku;
    private Long usuarioId;
    private String usuarioUsername;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private Integer stockAnterior;
    private Integer stockPosterior;
    private String motivo;
    private LocalDateTime fechaMovimiento;
}
