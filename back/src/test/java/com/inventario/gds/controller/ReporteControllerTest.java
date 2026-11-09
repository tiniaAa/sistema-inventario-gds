package com.inventario.gds.controller;

import com.inventario.gds.entity.Categoria;
import com.inventario.gds.entity.Producto;
import com.inventario.gds.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ReporteControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ReporteController reporteController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reporteController).build();
    }

    @Test
    void exportarInventarioCsv_incluyeValorTotalYProductosInactivos() throws Exception {
        Producto activo = producto("SKU-1", "Teclado", "Periféricos", "1250.50", 2, true);
        Producto inactivo = producto("SKU-2", "Mouse", "Periféricos", "500.00", 0, false);
        when(productoRepository.findAllForInventoryExport()).thenReturn(List.of(activo, inactivo));

        byte[] response = mockMvc.perform(get("/api/reportes/inventario/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(new MediaType("text", "csv", StandardCharsets.UTF_8)))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"inventario.csv\""))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        String csv = new String(response, StandardCharsets.UTF_8);
        org.junit.jupiter.api.Assertions.assertEquals(
                "\uFEFFSKU,Nombre,Categoría,Precio unitario,Stock actual,Valor total,Estado\r\n" +
                        "\"SKU-1\",\"Teclado\",\"Periféricos\",1250.50,2,2501.00,Activo\r\n" +
                        "\"SKU-2\",\"Mouse\",\"Periféricos\",500.00,0,0.00,Inactivo\r\n",
                csv);
        verify(productoRepository).findAllForInventoryExport();
    }

    @Test
    void exportarInventarioCsv_escapaCamposYNeutralizaFormulas() throws Exception {
        Producto producto = producto("=1+1", "Teclado, \"pro\"", "Categoría\nnueva", "10.00", 1, true);
        when(productoRepository.findAllForInventoryExport()).thenReturn(List.of(producto));

        byte[] response = mockMvc.perform(get("/api/reportes/inventario/csv"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        String csv = new String(response, StandardCharsets.UTF_8);
        org.junit.jupiter.api.Assertions.assertTrue(csv.contains("\"'=1+1\",\"Teclado, \"\"pro\"\"\",\"Categoría\nnueva\""));
    }

    @Test
    void exportarInventarioCsv_sinProductosDevuelveSoloEncabezado() throws Exception {
        when(productoRepository.findAllForInventoryExport()).thenReturn(List.of());

        mockMvc.perform(get("/api/reportes/inventario/csv"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(("\uFEFFSKU,Nombre,Categoría,Precio unitario,Stock actual,Valor total,Estado\r\n")
                        .getBytes(StandardCharsets.UTF_8)));
    }

    private Producto producto(String sku, String nombre, String categoria, String precio, int stock, boolean activo) {
        Categoria categoriaEntity = Categoria.builder().nombre(categoria).build();
        return Producto.builder()
                .sku(sku)
                .nombre(nombre)
                .categoria(categoriaEntity)
                .precioUnitario(new BigDecimal(precio))
                .stockActual(stock)
                .activo(activo)
                .build();
    }
}
