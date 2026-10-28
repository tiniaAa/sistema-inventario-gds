package com.inventario.gds.controller;

import com.inventario.gds.dto.request.ProductoRequestDTO;
import com.inventario.gds.dto.response.ProductoResponseDTO;
import com.inventario.gds.entity.Categoria;
import com.inventario.gds.entity.MovimientoStock;
import com.inventario.gds.entity.Producto;
import com.inventario.gds.entity.TipoMovimiento;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.MovimientoStockRepository;
import com.inventario.gds.repository.ProductoRepository;
import com.inventario.gds.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimientoStockRepository movimientoStockRepository;
    private final UsuarioRepository usuarioRepository;

    // HU-05: Listado con paginación y búsqueda
    @GetMapping
    public ResponseEntity<Page<ProductoResponseDTO>> listarProductos(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        Page<Producto> pageResult;
        if (StringUtils.hasText(search)) {
            pageResult = productoRepository.searchActivos(search, pageable);
        } else {
            pageResult = productoRepository.findByActivoTrue(pageable);
        }

        Page<ProductoResponseDTO> responsePage = pageResult.map(this::mapToDTO);
        return ResponseEntity.ok(responsePage);
    }

    // Obtener producto individual por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> obtenerProductoPorId(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        return ResponseEntity.ok(mapToDTO(producto));
    }

    // HU-10: Alertas de stock crítico
    @GetMapping("/alertas")
    public ResponseEntity<List<ProductoResponseDTO>> obtenerAlertas() {
        List<ProductoResponseDTO> alertas = productoRepository.findProductosCriticos().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(alertas);
    }

    // HU-02: Alta de producto
    @PostMapping
    @Transactional
    public ResponseEntity<ProductoResponseDTO> crearProducto(
            @Valid @RequestBody ProductoRequestDTO dto,
            Principal principal) {

        if (productoRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("Ya existe un producto registrado con el SKU: " + dto.getSku());
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        if (Boolean.FALSE.equals(categoria.getActivo())) {
            throw new IllegalArgumentException("La categoría seleccionada está inactiva y no admite nuevos productos");
        }

        int stockInicial = dto.getStockInicial() != null ? dto.getStockInicial() : 0;
        int stockMinimo = dto.getStockMinimo() != null ? dto.getStockMinimo() : 5;

        Producto producto = Producto.builder()
                .sku(dto.getSku().trim())
                .nombre(dto.getNombre().trim())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .categoria(categoria)
                .precioUnitario(dto.getPrecioUnitario())
                .stockActual(stockInicial)
                .stockMinimo(stockMinimo)
                .activo(true)
                .build();

        Producto guardado = productoRepository.save(producto);

        // Registro de auditoría si se ingresa con stock inicial
        if (stockInicial > 0 && principal != null) {
            usuarioRepository.findByUsername(principal.getName()).ifPresent(usuario -> {
                MovimientoStock movimiento = MovimientoStock.builder()
                        .producto(guardado)
                        .usuario(usuario)
                        .tipoMovimiento(TipoMovimiento.INGRESO)
                        .cantidad(stockInicial)
                        .stockAnterior(0)
                        .stockPosterior(stockInicial)
                        .motivo("Stock inicial por alta de producto")
                        .build();
                movimientoStockRepository.save(movimiento);
            });
        }

        return new ResponseEntity<>(mapToDTO(guardado), HttpStatus.CREATED);
    }

    // HU-03: Modificación de producto
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ProductoResponseDTO> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequestDTO dto) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(producto.getActivo())) {
            throw new IllegalArgumentException("No se puede modificar un producto que se encuentra inactivo");
        }

        String nuevoSku = dto.getSku().trim();
        if (productoRepository.existsBySkuAndIdNot(nuevoSku, id)) {
            throw new IllegalArgumentException("Ya existe otro producto registrado con el SKU: " + dto.getSku());
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        if (Boolean.FALSE.equals(categoria.getActivo())) {
            throw new IllegalArgumentException("La categoría seleccionada está inactiva y no admite productos");
        }

        producto.setSku(nuevoSku);
        producto.setNombre(dto.getNombre().trim());
        producto.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        producto.setCategoria(categoria);
        producto.setPrecioUnitario(dto.getPrecioUnitario());
        producto.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5);
        // El stockActual no se modifica en este endpoint para mantener la trazabilidad inmutable de movimientos

        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(mapToDTO(guardado));
    }

    // HU-04: Baja lógica de producto
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> bajaLogica(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(producto.getActivo())) {
            throw new IllegalArgumentException("El producto ya se encuentra dado de baja");
        }

        producto.setActivo(false);
        productoRepository.save(producto);
        return ResponseEntity.noContent().build();
    }

    private ProductoResponseDTO mapToDTO(Producto p) {
        return ProductoResponseDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .categoria(p.getCategoria() != null ?
                        new ProductoResponseDTO.CategoriaSummary(p.getCategoria().getId(), p.getCategoria().getNombre()) : null)
                .precioUnitario(p.getPrecioUnitario())
                .stockActual(p.getStockActual())
                .stockMinimo(p.getStockMinimo())
                .activo(p.getActivo())
                .fechaActualizacion(p.getFechaActualizacion())
                .build();
    }
}
