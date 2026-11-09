package com.inventario.gds.controller;

import com.inventario.gds.entity.Producto;
import com.inventario.gds.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private static final String CSV_HEADER =
            "SKU,Nombre,Categoría,Precio unitario,Stock actual,Valor total,Estado";

    private final ProductoRepository productoRepository;

    @GetMapping(value = "/inventario/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportarInventarioCsv() {
        List<Producto> productos = productoRepository.findAllForInventoryExport();
        StringBuilder csv = new StringBuilder("\uFEFF").append(CSV_HEADER).append("\r\n");

        for (Producto producto : productos) {
            BigDecimal precio = producto.getPrecioUnitario();
            int stock = producto.getStockActual();
            BigDecimal valorTotal = precio.multiply(BigDecimal.valueOf(stock));

            csv.append(csvText(producto.getSku())).append(',')
                    .append(csvText(producto.getNombre())).append(',')
                    .append(csvText(producto.getCategoria().getNombre())).append(',')
                    .append(precio.toPlainString()).append(',')
                    .append(stock).append(',')
                    .append(valorTotal.toPlainString()).append(',')
                    .append(Boolean.TRUE.equals(producto.getActivo()) ? "Activo" : "Inactivo")
                    .append("\r\n");
        }

        byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("inventario.csv").build().toString())
                .body(content);
    }

    private String csvText(String value) {
        String safeValue = value == null ? "" : value;
        String valueWithoutLeadingSpaces = safeValue.stripLeading();
        if (!valueWithoutLeadingSpaces.isEmpty()
                && "=+-@".indexOf(valueWithoutLeadingSpaces.charAt(0)) >= 0) {
            safeValue = "'" + safeValue;
        }
        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }
}
