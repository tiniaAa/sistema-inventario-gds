package com.inventario.gds.service;

import com.inventario.gds.dto.request.ProductoRequestDTO;
import com.inventario.gds.dto.response.ProductoResponseDTO;
import com.inventario.gds.entity.*;
import com.inventario.gds.exception.ResourceNotFoundException;
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

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private MovimientoStockRepository movimientoStockRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ProductoService productoService;

    private Categoria categoria;
    private Usuario usuario;
    private ProductoRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        categoria = Categoria.builder()
                .id(1L)
                .nombre("Herramientas")
                .descripcion("Herramientas varias")
                .activo(true)
                .build();

        usuario = Usuario.builder()
                .id(1L)
                .username("operador")
                .rol(Rol.OPERADOR)
                .build();

        requestDTO = new ProductoRequestDTO();
        requestDTO.setSku("TAL-001");
        requestDTO.setNombre("Taladro Percutor 750W");
        requestDTO.setDescripcion("Taladro de impacto profesional");
        requestDTO.setCategoriaId(1L);
        requestDTO.setPrecioUnitario(new BigDecimal("12500.50"));
        requestDTO.setStockInicial(10);
        requestDTO.setStockMinimo(5);
    }

    @Test
    @DisplayName("Debe crear un producto exitosamente y registrar movimiento inicial si stock > 0")
    void crearProducto_ConStockInicial_Exitoso() {
        when(productoRepository.existsBySku("TAL-001")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(usuarioRepository.findByUsername("operador")).thenReturn(Optional.of(usuario));

        Producto productoGuardado = Producto.builder()
                .id(100L)
                .sku("TAL-001")
                .nombre("Taladro Percutor 750W")
                .descripcion("Taladro de impacto profesional")
                .categoria(categoria)
                .precioUnitario(new BigDecimal("12500.50"))
                .stockActual(10)
                .stockMinimo(5)
                .activo(true)
                .build();

        when(productoRepository.save(any(Producto.class))).thenReturn(productoGuardado);

        ProductoResponseDTO response = productoService.crearProducto(requestDTO, "operador");

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getSku()).isEqualTo("TAL-001");
        assertThat(response.getNombre()).isEqualTo("Taladro Percutor 750W");
        assertThat(response.getStockActual()).isEqualTo(10);
        assertThat(response.getCategoria().getId()).isEqualTo(1L);

        verify(productoRepository, times(1)).save(any(Producto.class));
        verify(movimientoStockRepository, times(1)).save(any(MovimientoStock.class));
    }

    @Test
    @DisplayName("Debe fallar al crear producto con SKU duplicado")
    void crearProducto_SkuDuplicado_LanzaExcepcion() {
        when(productoRepository.existsBySku("TAL-001")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                productoService.crearProducto(requestDTO, "operador")
        );

        assertThat(ex.getMessage()).contains("Ya existe un producto registrado con el SKU: TAL-001");
        verify(productoRepository, never()).save(any(Producto.class));
        verify(movimientoStockRepository, never()).save(any(MovimientoStock.class));
    }

    @Test
    @DisplayName("Debe fallar si la categoría especificada no existe")
    void crearProducto_CategoriaInexistente_LanzaExcepcion() {
        when(productoRepository.existsBySku("TAL-001")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                productoService.crearProducto(requestDTO, "operador")
        );

        assertThat(ex.getMessage()).contains("Categoría no encontrada con ID: 1");
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    @DisplayName("No debe registrar movimiento si stock inicial es 0")
    void crearProducto_StockInicialCero_NoRegistraMovimiento() {
        requestDTO.setStockInicial(0);

        when(productoRepository.existsBySku("TAL-001")).thenReturn(false);
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));

        Producto productoGuardado = Producto.builder()
                .id(101L)
                .sku("TAL-001")
                .nombre("Taladro Percutor 750W")
                .categoria(categoria)
                .precioUnitario(new BigDecimal("12500.50"))
                .stockActual(0)
                .stockMinimo(5)
                .activo(true)
                .build();

        when(productoRepository.save(any(Producto.class))).thenReturn(productoGuardado);

        ProductoResponseDTO response = productoService.crearProducto(requestDTO, "operador");

        assertThat(response.getStockActual()).isEqualTo(0);
        verify(movimientoStockRepository, never()).save(any(MovimientoStock.class));
    }
}
