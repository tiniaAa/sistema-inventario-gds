package com.inventario.gds.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventario.gds.dto.request.MovimientoRequestDTO;
import com.inventario.gds.dto.response.MovimientoResponseDTO;
import com.inventario.gds.entity.TipoMovimiento;
import com.inventario.gds.exception.GlobalExceptionHandler;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.service.MovimientoStockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MovimientoStockControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MovimientoStockService movimientoService;

    @InjectMocks
    private MovimientoStockController movimientoController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Principal principal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(movimientoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        principal = () -> "operador";
    }

    // --- Tests HU-07: Ingreso de stock ---

    @Test
    @DisplayName("HU-07: Registro exitoso de ingreso de stock incrementa saldo y audita movimiento")
    void registrarIngreso_Exitoso() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(25);
        request.setMotivo("Remito Proveedor #9921");

        MovimientoResponseDTO responseDTO = MovimientoResponseDTO.builder()
                .id(1L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .productoSku("PROD-001")
                .usuarioId(2L)
                .usuarioUsername("operador")
                .tipoMovimiento(TipoMovimiento.INGRESO)
                .cantidad(25)
                .stockAnterior(5)
                .stockPosterior(30)
                .motivo("Remito Proveedor #9921")
                .fechaMovimiento(LocalDateTime.now())
                .build();

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador")))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productoId").value(10))
                .andExpect(jsonPath("$.productoNombre").value("Teclado Mecánico RGB"))
                .andExpect(jsonPath("$.productoSku").value("PROD-001"))
                .andExpect(jsonPath("$.tipoMovimiento").value("INGRESO"))
                .andExpect(jsonPath("$.cantidad").value(25))
                .andExpect(jsonPath("$.stockAnterior").value(5))
                .andExpect(jsonPath("$.stockPosterior").value(30))
                .andExpect(jsonPath("$.motivo").value("Remito Proveedor #9921"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador"));
    }

    @Test
    @DisplayName("HU-07: Error al ingresar stock si el producto no existe (HTTP 404)")
    void registrarIngreso_ProductoInexistente_Retorna404() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(999L);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(10);
        request.setMotivo("Remito de entrada");

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador")))
                .thenThrow(new ResourceNotFoundException("Producto no encontrado con ID: 999"));

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Recurso no encontrado"))
                .andExpect(jsonPath("$.message").value("Producto no encontrado con ID: 999"));
    }

    @Test
    @DisplayName("HU-07: Error al ingresar stock sobre producto inactivo (HTTP 400)")
    void registrarIngreso_ProductoInactivo_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(15L);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(10);
        request.setMotivo("Remito sobre producto deshabilitado");

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador")))
                .thenThrow(new IllegalArgumentException("No se pueden registrar movimientos sobre un producto inactivo"));

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Petición inválida"))
                .andExpect(jsonPath("$.message").value("No se pueden registrar movimientos sobre un producto inactivo"));
    }

    @Test
    @DisplayName("HU-07: Validación Bean Validation cantidad nula o menor a 1 retorna HTTP 400")
    void registrarIngreso_CantidadInvalida_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(0); // Min(1) violado
        request.setMotivo("Remito sin cantidad");

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Error de validación de campos"))
                .andExpect(jsonPath("$.fieldErrors.cantidad").value("La cantidad debe ser mayor a cero"));

        verify(movimientoService, never()).registrarMovimiento(any(), any());
    }

    @Test
    @DisplayName("HU-07: Validación Bean Validation motivo en blanco retorna HTTP 400")
    void registrarIngreso_MotivoEnBlanco_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(10);
        request.setMotivo("   "); // NotBlank violado

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.motivo").value("El motivo o documento de respaldo es obligatorio"));

        verify(movimientoService, never()).registrarMovimiento(any(), any());
    }

    @Test
    @DisplayName("HU-07: Validación Bean Validation productoId nulo retorna HTTP 400")
    void registrarIngreso_ProductoIdNulo_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(null);
        request.setTipoMovimiento(TipoMovimiento.INGRESO);
        request.setCantidad(10);
        request.setMotivo("Remito válido");

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.productoId").value("El ID del producto es obligatorio"));

        verify(movimientoService, never()).registrarMovimiento(any(), any());
    }

    @Test
    @DisplayName("HU-07: Listado paginado de movimientos retorna HTTP 200 con contenido")
    void listarMovimientos_Retorna200() throws Exception {
        MovimientoResponseDTO m = MovimientoResponseDTO.builder()
                .id(1L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .tipoMovimiento(TipoMovimiento.INGRESO)
                .cantidad(25)
                .stockAnterior(5)
                .stockPosterior(30)
                .motivo("Remito #101")
                .fechaMovimiento(LocalDateTime.now())
                .build();

        PageImpl<MovimientoResponseDTO> page = new PageImpl<>(List.of(m), PageRequest.of(0, 10), 1);

        when(movimientoService.listarMovimientos(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/movimientos?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].tipoMovimiento").value("INGRESO"))
                .andExpect(jsonPath("$.content[0].cantidad").value(25))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
