package com.inventario.gds.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventario.gds.dto.request.ProductoRequestDTO;
import com.inventario.gds.entity.Categoria;
import com.inventario.gds.entity.MovimientoStock;
import com.inventario.gds.entity.Producto;
import com.inventario.gds.entity.Usuario;
import com.inventario.gds.exception.GlobalExceptionHandler;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.MovimientoStockRepository;
import com.inventario.gds.repository.ProductoRepository;
import com.inventario.gds.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MovimientoStockRepository movimientoStockRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ProductoController productoController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("HU-02: Alta de producto exitosa con stock inicial y auditoría")
    void crearProducto_Exitoso_ConStockInicial() throws Exception {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku("PROD-001");
        dto.setNombre("Teclado Mecánico RGB");
        dto.setDescripcion("Teclado gamer switches blue");
        dto.setCategoriaId(1L);
        dto.setPrecioUnitario(new BigDecimal("45000.00"));
        dto.setStockInicial(10);
        dto.setStockMinimo(5);

        Categoria categoria = Categoria.builder()
                .id(1L)
                .nombre("Periféricos")
                .activo(true)
                .build();

        Producto productoGuardado = Producto.builder()
                .id(100L)
                .sku("PROD-001")
                .nombre("Teclado Mecánico RGB")
                .descripcion("Teclado gamer switches blue")
                .categoria(categoria)
                .precioUnitario(new BigDecimal("45000.00"))
                .stockActual(10)
                .stockMinimo(5)
                .activo(true)
                .build();

        Usuario operador = Usuario.builder()
                .id(2L)
                .username("operador")
                .build();

        Principal principal = () -> "operador";

        when(productoRepository.existsBySku("PROD-001")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenReturn(productoGuardado);
        when(usuarioRepository.findByUsername("operador")).thenReturn(Optional.of(operador));

        mockMvc.perform(post("/api/productos")
                .principal(principal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.sku").value("PROD-001"))
                .andExpect(jsonPath("$.nombre").value("Teclado Mecánico RGB"))
                .andExpect(jsonPath("$.stockActual").value(10))
                .andExpect(jsonPath("$.categoria.nombre").value("Periféricos"));

        verify(movimientoStockRepository, times(1)).save(any(MovimientoStock.class));
    }

    @Test
    @DisplayName("HU-02: Rechazo por SKU duplicado")
    void crearProducto_Error_SkuDuplicado() throws Exception {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku("PROD-DUP");
        dto.setNombre("Mouse Óptico");
        dto.setCategoriaId(1L);
        dto.setPrecioUnitario(new BigDecimal("12000.00"));

        when(productoRepository.existsBySku("PROD-DUP")).thenReturn(true);

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya existe un producto registrado con el SKU: PROD-DUP"));

        verify(productoRepository, never()).save(any());
        verify(movimientoStockRepository, never()).save(any());
    }

    @Test
    @DisplayName("HU-02: Rechazo si la categoría está inactiva")
    void crearProducto_Error_CategoriaInactiva() throws Exception {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku("PROD-002");
        dto.setNombre("Monitor 24");
        dto.setCategoriaId(2L);
        dto.setPrecioUnitario(new BigDecimal("90000.00"));

        Categoria categoriaInactiva = Categoria.builder()
                .id(2L)
                .nombre("Obsoletos")
                .activo(false)
                .build();

        when(productoRepository.existsBySku("PROD-002")).thenReturn(false);
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(categoriaInactiva));

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La categoría seleccionada está inactiva y no admite nuevos productos"));

        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("HU-02: Rechazo por categoría inexistente (404)")
    void crearProducto_Error_CategoriaInexistente() throws Exception {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku("PROD-003");
        dto.setNombre("Gabinete ATX");
        dto.setCategoriaId(999L);
        dto.setPrecioUnitario(new BigDecimal("35000.00"));

        when(productoRepository.existsBySku("PROD-003")).thenReturn(false);
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Categoría no encontrada con ID: 999"));
    }

    @Test
    @DisplayName("HU-02: Validación Bean Validation (Campos obligatorios vacíos o valores negativos)")
    void crearProducto_Error_ValidacionCampos() throws Exception {
        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setSku(""); // Inválido (@NotBlank)
        dto.setNombre(""); // Inválido (@NotBlank)
        dto.setCategoriaId(null); // Inválido (@NotNull)
        dto.setPrecioUnitario(new BigDecimal("-10.00")); // Inválido (@DecimalMin >= 0)
        dto.setStockInicial(-5); // Inválido (@Min >= 0)

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.sku").exists())
                .andExpect(jsonPath("$.fieldErrors.nombre").exists())
                .andExpect(jsonPath("$.fieldErrors.categoriaId").exists())
                .andExpect(jsonPath("$.fieldErrors.precioUnitario").exists())
                .andExpect(jsonPath("$.fieldErrors.stockInicial").exists());

        verify(productoRepository, never()).save(any());
    }
}
