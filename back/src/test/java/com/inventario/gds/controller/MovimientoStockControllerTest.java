package com.inventario.gds.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventario.gds.dto.request.MovimientoRequestDTO;
import com.inventario.gds.dto.response.MovimientoResponseDTO;
import com.inventario.gds.entity.TipoMovimiento;
import com.inventario.gds.exception.GlobalExceptionHandler;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.exception.StockInsuficienteException;
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
                .andExpect(jsonPath("$.error").value("Error de validación de campos"))
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

    // --- Tests HU-11: Historial de movimientos ---

    @Test
    @DisplayName("HU-11: Historial paginado retorna movimientos con datos de auditoría")
    void listarMovimientos_Retorna200() throws Exception {
        MovimientoResponseDTO m = MovimientoResponseDTO.builder()
                .id(1L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .usuarioId(2L)
                .usuarioUsername("operador")
                .tipoMovimiento(TipoMovimiento.INGRESO)
                .cantidad(25)
                .stockAnterior(5)
                .stockPosterior(30)
                .motivo("Remito #101")
                .fechaMovimiento(LocalDateTime.of(2026, 11, 9, 1, 0))
                .build();

        PageImpl<MovimientoResponseDTO> page = new PageImpl<>(List.of(m), PageRequest.of(0, 10), 1);

        when(movimientoService.listarMovimientos(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/movimientos?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].tipoMovimiento").value("INGRESO"))
                .andExpect(jsonPath("$.content[0].cantidad").value(25))
                .andExpect(jsonPath("$.content[0].usuarioUsername").value("operador"))
                .andExpect(jsonPath("$.content[0].motivo").value("Remito #101"))
                .andExpect(jsonPath("$.content[0].fechaMovimiento[0]").value(2026))
                .andExpect(jsonPath("$.content[0].fechaMovimiento[1]").value(11))
                .andExpect(jsonPath("$.content[0].fechaMovimiento[2]").value(9))
                .andExpect(jsonPath("$.content[0].fechaMovimiento[3]").value(1))
                .andExpect(jsonPath("$.content[0].fechaMovimiento[4]").value(0))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("HU-11: El historial permite solicitar páginas posteriores")
    void listarMovimientos_PaginaSolicitada() throws Exception {
        when(movimientoService.listarMovimientos(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(2, 10), 25));

        mockMvc.perform(get("/api/movimientos?page=2&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value(2))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.totalElements").value(25));

        verify(movimientoService).listarMovimientos(PageRequest.of(2, 10));
    }

    // --- Tests HU-08: Egreso de stock ---

    @Test
    @DisplayName("HU-08: Registro exitoso de egreso descuenta existencias y genera auditoría")
    void registrarEgreso_Exitoso() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.EGRESO);
        request.setCantidad(5);
        request.setMotivo("Venta Factura #001-9982");

        MovimientoResponseDTO responseDTO = MovimientoResponseDTO.builder()
                .id(2L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .productoSku("PROD-001")
                .usuarioId(2L)
                .usuarioUsername("operador")
                .tipoMovimiento(TipoMovimiento.EGRESO)
                .cantidad(5)
                .stockAnterior(30)
                .stockPosterior(25)
                .motivo("Venta Factura #001-9982")
                .fechaMovimiento(LocalDateTime.now())
                .build();

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador")))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.tipoMovimiento").value("EGRESO"))
                .andExpect(jsonPath("$.cantidad").value(5))
                .andExpect(jsonPath("$.stockAnterior").value(30))
                .andExpect(jsonPath("$.stockPosterior").value(25))
                .andExpect(jsonPath("$.motivo").value("Venta Factura #001-9982"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador"));
    }

    @Test
    @DisplayName("HU-08: Rechazo de egreso cuando la cantidad supera el stock actual (HTTP 400)")
    void registrarEgreso_StockInsuficiente_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.EGRESO);
        request.setCantidad(50);
        request.setMotivo("Venta mayorista");

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador")))
                .thenThrow(new StockInsuficienteException(
                        "Stock insuficiente para el producto 'Teclado Mecánico RGB'. Stock disponible: 30, solicitado: 50"));

        mockMvc.perform(post("/api/movimientos")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Stock insuficiente"))
                .andExpect(jsonPath("$.message").value("Stock insuficiente para el producto 'Teclado Mecánico RGB'. Stock disponible: 30, solicitado: 50"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("operador"));
    }

    // --- Tests HU-09: Ajuste por merma o rotura ---

    @Test
    @DisplayName("HU-09: Registro exitoso de ajuste por merma descuenta existencias y genera auditoría")
    void registrarAjusteMerma_Exitoso() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.AJUSTE_MERMA);
        request.setCantidad(3);
        request.setMotivo("Rotura de empaque en sector depósito A");

        MovimientoResponseDTO responseDTO = MovimientoResponseDTO.builder()
                .id(3L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .productoSku("PROD-001")
                .usuarioId(1L)
                .usuarioUsername("admin")
                .tipoMovimiento(TipoMovimiento.AJUSTE_MERMA)
                .cantidad(3)
                .stockAnterior(25)
                .stockPosterior(22)
                .motivo("Rotura de empaque en sector depósito A")
                .fechaMovimiento(LocalDateTime.now())
                .build();

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin")))
                .thenReturn(responseDTO);

        Principal principalAdmin = () -> "admin";

        mockMvc.perform(post("/api/movimientos")
                        .principal(principalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.tipoMovimiento").value("AJUSTE_MERMA"))
                .andExpect(jsonPath("$.cantidad").value(3))
                .andExpect(jsonPath("$.stockAnterior").value(25))
                .andExpect(jsonPath("$.stockPosterior").value(22))
                .andExpect(jsonPath("$.motivo").value("Rotura de empaque en sector depósito A"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin"));
    }

    @Test
    @DisplayName("HU-09: Rechazo de ajuste por merma cuando la cantidad supera el stock actual (HTTP 400)")
    void registrarAjusteMerma_StockInsuficiente_Retorna400() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.AJUSTE_MERMA);
        request.setCantidad(40);
        request.setMotivo("Pérdida total por rotura masiva");

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin")))
                .thenThrow(new StockInsuficienteException(
                        "Stock insuficiente para el producto 'Teclado Mecánico RGB'. Stock actual: 25, solicitado: 40"));

        Principal principalAdmin = () -> "admin";

        mockMvc.perform(post("/api/movimientos")
                        .principal(principalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Stock insuficiente"))
                .andExpect(jsonPath("$.message").value("Stock insuficiente para el producto 'Teclado Mecánico RGB'. Stock actual: 25, solicitado: 40"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin"));
    }

    @Test
    @DisplayName("HU-09: Registro exitoso de ajuste por sobrante incrementa existencias")
    void registrarAjusteSobrante_Exitoso() throws Exception {
        MovimientoRequestDTO request = new MovimientoRequestDTO();
        request.setProductoId(10L);
        request.setTipoMovimiento(TipoMovimiento.AJUSTE_SOBRANTE);
        request.setCantidad(2);
        request.setMotivo("Recuento físico mensual - hallazgo sector C");

        MovimientoResponseDTO responseDTO = MovimientoResponseDTO.builder()
                .id(4L)
                .productoId(10L)
                .productoNombre("Teclado Mecánico RGB")
                .productoSku("PROD-001")
                .usuarioId(1L)
                .usuarioUsername("admin")
                .tipoMovimiento(TipoMovimiento.AJUSTE_SOBRANTE)
                .cantidad(2)
                .stockAnterior(22)
                .stockPosterior(24)
                .motivo("Recuento físico mensual - hallazgo sector C")
                .fechaMovimiento(LocalDateTime.now())
                .build();

        when(movimientoService.registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin")))
                .thenReturn(responseDTO);

        Principal principalAdmin = () -> "admin";

        mockMvc.perform(post("/api/movimientos")
                        .principal(principalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(4))
                .andExpect(jsonPath("$.tipoMovimiento").value("AJUSTE_SOBRANTE"))
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$.stockAnterior").value(22))
                .andExpect(jsonPath("$.stockPosterior").value(24))
                .andExpect(jsonPath("$.motivo").value("Recuento físico mensual - hallazgo sector C"));

        verify(movimientoService, times(1)).registrarMovimiento(any(MovimientoRequestDTO.class), eq("admin"));
    }
}
