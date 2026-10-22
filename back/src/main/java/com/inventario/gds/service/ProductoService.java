package com.inventario.gds.service;

import com.inventario.gds.dto.request.ProductoRequestDTO;
import com.inventario.gds.dto.response.ProductoResponseDTO;
import com.inventario.gds.entity.*;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.MovimientoStockRepository;
import com.inventario.gds.repository.ProductoRepository;
import com.inventario.gds.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimientoStockRepository movimientoStockRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Page<ProductoResponseDTO> listarProductos(String search, Pageable pageable) {
        Page<Producto> pageResult;
        if (StringUtils.hasText(search)) {
            pageResult = productoRepository.searchActivos(search, pageable);
        } else {
            pageResult = productoRepository.findByActivoTrue(pageable);
        }
        return pageResult.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> obtenerAlertas() {
        return productoRepository.findProductosCriticos().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto, String username) {
        String cleanSku = dto.getSku().trim();
        if (productoRepository.existsBySku(cleanSku)) {
            throw new IllegalArgumentException("Ya existe un producto registrado con el SKU: " + cleanSku);
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        int stockInicial = dto.getStockInicial() != null ? dto.getStockInicial() : 0;
        int stockMinimo = dto.getStockMinimo() != null ? dto.getStockMinimo() : 5;

        Producto producto = Producto.builder()
                .sku(cleanSku)
                .nombre(dto.getNombre().trim())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .categoria(categoria)
                .precioUnitario(dto.getPrecioUnitario())
                .stockActual(stockInicial)
                .stockMinimo(stockMinimo)
                .activo(true)
                .build();

        Producto guardado = productoRepository.save(producto);

        // Si se especificó stock inicial > 0, registrar movimiento de auditoría transaccional
        if (stockInicial > 0 && username != null) {
            Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);

            if (usuario != null) {
                MovimientoStock movimiento = MovimientoStock.builder()
                        .producto(guardado)
                        .usuario(usuario)
                        .tipoMovimiento(TipoMovimiento.INGRESO)
                        .cantidad(stockInicial)
                        .stockAnterior(0)
                        .stockPosterior(stockInicial)
                        .motivo("Stock inicial - Alta de producto")
                        .build();

                movimientoStockRepository.save(movimiento);
            }
        }

        return mapToDTO(guardado);
    }

    @Transactional
    public void bajaLogica(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        producto.setActivo(false);
        productoRepository.save(producto);
    }

    public ProductoResponseDTO mapToDTO(Producto p) {
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
