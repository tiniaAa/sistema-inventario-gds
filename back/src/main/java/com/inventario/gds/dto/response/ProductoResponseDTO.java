package com.inventario.gds.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponseDTO {
    private Long id;
    private String sku;
    private String nombre;
    private String descripcion;
    private CategoriaSummary categoria;
    private BigDecimal precioUnitario;
    private Integer stockActual;
    private Integer stockMinimo;
    private Boolean activo;
    private LocalDateTime fechaActualizacion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoriaSummary {
        private Long id;
        private String nombre;
    }
}
