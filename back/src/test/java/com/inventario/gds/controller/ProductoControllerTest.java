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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    // --- Tests HU-02: Alta de producto ---

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

    // --- Tests HU-03: Modificación de producto ---

    @Test
    @DisplayName("HU-03: Modificación exitosa de datos comerciales y descripción")
    void actualizarProducto_Exitoso() throws Exception {
        Long productoId = 1L;

        Categoria catExistente = Categoria.builder()
                .id(1L)
                .nombre("Periféricos")
                .activo(true)
                .build();

        Categoria catNueva = Categoria.builder()
                .id(2L)
                .nombre("Componentes")
                .activo(true)
                .build();

        Producto productoExistente = Producto.builder()
                .id(productoId)
                .sku("TECL-001")
                .nombre("Teclado Básico")
                .descripcion("Descripción vieja")
                .categoria(catExistente)
                .precioUnitario(new BigDecimal("15000.00"))
                .stockActual(25)
                .stockMinimo(5)
                .activo(true)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("TECL-001-MOD");
        updateDto.setNombre("Teclado Mecánico Pro");
        updateDto.setDescripcion("Switches red silenciosos");
        updateDto.setCategoriaId(2L);
        updateDto.setPrecioUnitario(new BigDecimal("32000.00"));
        updateDto.setStockMinimo(8);

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoExistente));
        when(productoRepository.existsBySkuAndIdNot("TECL-001-MOD", productoId)).thenReturn(false);
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(catNueva));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productoId))
                .andExpect(jsonPath("$.sku").value("TECL-001-MOD"))
                .andExpect(jsonPath("$.nombre").value("Teclado Mecánico Pro"))
                .andExpect(jsonPath("$.descripcion").value("Switches red silenciosos"))
                .andExpect(jsonPath("$.precioUnitario").value(32000.00))
                .andExpect(jsonPath("$.stockActual").value(25)) // Conserva stock actual sin alterar
                .andExpect(jsonPath("$.stockMinimo").value(8))
                .andExpect(jsonPath("$.categoria.nombre").value("Componentes"));

        verify(productoRepository, times(1)).save(productoExistente);
    }

    @Test
    @DisplayName("HU-03: Modificación exitosa conservando el mismo SKU")
    void actualizarProducto_Exitoso_MismoSku() throws Exception {
        Long productoId = 1L;

        Categoria categoria = Categoria.builder()
                .id(1L)
                .nombre("Periféricos")
                .activo(true)
                .build();

        Producto productoExistente = Producto.builder()
                .id(productoId)
                .sku("SKU-ORIGINAL")
                .nombre("Mouse Gamer")
                .categoria(categoria)
                .precioUnitario(new BigDecimal("8000.00"))
                .stockActual(12)
                .stockMinimo(4)
                .activo(true)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-ORIGINAL");
        updateDto.setNombre("Mouse Gamer RGB 16000 DPI");
        updateDto.setCategoriaId(1L);
        updateDto.setPrecioUnitario(new BigDecimal("9500.00"));
        updateDto.setStockMinimo(5);

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoExistente));
        when(productoRepository.existsBySkuAndIdNot("SKU-ORIGINAL", productoId)).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-ORIGINAL"))
                .andExpect(jsonPath("$.nombre").value("Mouse Gamer RGB 16000 DPI"))
                .andExpect(jsonPath("$.precioUnitario").value(9500.00));
    }

    @Test
    @DisplayName("HU-03: Rechazo si el nuevo SKU ya pertenece a otro producto existente")
    void actualizarProducto_Error_SkuDuplicado() throws Exception {
        Long productoId = 1L;

        Producto productoExistente = Producto.builder()
                .id(productoId)
                .sku("SKU-PROPIO")
                .nombre("Auricular Básico")
                .activo(true)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-OCUPADO");
        updateDto.setNombre("Auricular Wireless");
        updateDto.setCategoriaId(1L);
        updateDto.setPrecioUnitario(new BigDecimal("22000.00"));

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoExistente));
        when(productoRepository.existsBySkuAndIdNot("SKU-OCUPADO", productoId)).thenReturn(true);

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya existe otro producto registrado con el SKU: SKU-OCUPADO"));

        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("HU-03: Rechazo por producto inexistente (404)")
    void actualizarProducto_Error_ProductoNoEncontrado() throws Exception {
        Long productoIdInexistente = 999L;

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-TEST");
        updateDto.setNombre("Producto Fantasma");
        updateDto.setCategoriaId(1L);
        updateDto.setPrecioUnitario(new BigDecimal("1000.00"));

        when(productoRepository.findById(productoIdInexistente)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/productos/{id}", productoIdInexistente)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado con ID: 999"));
    }

    @Test
    @DisplayName("HU-03: Rechazo al intentar modificar un producto inactivo")
    void actualizarProducto_Error_ProductoInactivo() throws Exception {
        Long productoId = 5L;

        Producto productoInactivo = Producto.builder()
                .id(productoId)
                .sku("SKU-INACTIVO")
                .nombre("Producto Dado De Baja")
                .activo(false)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-INACTIVO");
        updateDto.setNombre("Intento Modificar");
        updateDto.setCategoriaId(1L);
        updateDto.setPrecioUnitario(new BigDecimal("1000.00"));

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoInactivo));

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No se puede modificar un producto que se encuentra inactivo"));

        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("HU-03: Rechazo por categoría inexistente al modificar (404)")
    void actualizarProducto_Error_CategoriaInexistente() throws Exception {
        Long productoId = 1L;

        Producto productoExistente = Producto.builder()
                .id(productoId)
                .sku("SKU-ACTUAL")
                .nombre("Producto Ok")
                .activo(true)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-ACTUAL");
        updateDto.setNombre("Producto Ok");
        updateDto.setCategoriaId(888L);
        updateDto.setPrecioUnitario(new BigDecimal("1500.00"));

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoExistente));
        when(productoRepository.existsBySkuAndIdNot("SKU-ACTUAL", productoId)).thenReturn(false);
        when(categoriaRepository.findById(888L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Categoría no encontrada con ID: 888"));
    }

    @Test
    @DisplayName("HU-03: Rechazo si la categoría asignada al modificar está inactiva")
    void actualizarProducto_Error_CategoriaInactiva() throws Exception {
        Long productoId = 1L;

        Producto productoExistente = Producto.builder()
                .id(productoId)
                .sku("SKU-ACTUAL")
                .nombre("Producto Ok")
                .activo(true)
                .build();

        Categoria categoriaInactiva = Categoria.builder()
                .id(3L)
                .nombre("Discontinuados")
                .activo(false)
                .build();

        ProductoRequestDTO updateDto = new ProductoRequestDTO();
        updateDto.setSku("SKU-ACTUAL");
        updateDto.setNombre("Producto Ok");
        updateDto.setCategoriaId(3L);
        updateDto.setPrecioUnitario(new BigDecimal("1500.00"));

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(productoExistente));
        when(productoRepository.existsBySkuAndIdNot("SKU-ACTUAL", productoId)).thenReturn(false);
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoriaInactiva));

        mockMvc.perform(put("/api/productos/{id}", productoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La categoría seleccionada está inactiva y no admite productos"));

        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("HU-03: Validación Bean Validation en modificación (campos vacíos o negativos)")
    void actualizarProducto_Error_ValidacionCampos() throws Exception {
        ProductoRequestDTO invalidDto = new ProductoRequestDTO();
        invalidDto.setSku("");
        invalidDto.setNombre("");
        invalidDto.setCategoriaId(null);
        invalidDto.setPrecioUnitario(new BigDecimal("-50.00"));
        invalidDto.setStockMinimo(-2);

        mockMvc.perform(put("/api/productos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.sku").exists())
                .andExpect(jsonPath("$.fieldErrors.nombre").exists())
                .andExpect(jsonPath("$.fieldErrors.categoriaId").exists())
                .andExpect(jsonPath("$.fieldErrors.precioUnitario").exists())
                .andExpect(jsonPath("$.fieldErrors.stockMinimo").exists());

        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Obtener producto por ID exitoso")
    void obtenerProductoPorId_Exitoso() throws Exception {
        Long productoId = 1L;
        Categoria categoria = Categoria.builder().id(1L).nombre("Periféricos").build();
        Producto producto = Producto.builder()
                .id(productoId)
                .sku("PROD-001")
                .nombre("Monitor")
                .categoria(categoria)
                .precioUnitario(new BigDecimal("50000.00"))
                .stockActual(10)
                .stockMinimo(2)
                .activo(true)
                .build();

        when(productoRepository.findById(productoId)).thenReturn(Optional.of(producto));

        mockMvc.perform(get("/api/productos/{id}", productoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productoId))
                .andExpect(jsonPath("$.sku").value("PROD-001"))
                .andExpect(jsonPath("$.nombre").value("Monitor"));
    }

    @Test
    @DisplayName("Obtener producto por ID no encontrado (404)")
    void obtenerProductoPorId_NoEncontrado() throws Exception {
        when(productoRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/productos/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado con ID: 999"));
    }
}
