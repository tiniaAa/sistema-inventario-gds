package com.inventario.gds.service;

import com.inventario.gds.dto.request.MovimientoRequestDTO;
import com.inventario.gds.entity.*;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.exception.StockInsuficienteException;
import com.inventario.gds.repository.MovimientoStockRepository;
import com.inventario.gds.repository.ProductoRepository;
import com.inventario.gds.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovimientoStockService {

    private final MovimientoStockRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MovimientoStock registrarMovimiento(MovimientoRequestDTO dto, String username) {
        // Bloqueo pesimista para evitar colisiones en egresos concurrentes
        Producto producto = productoRepository.findByIdForUpdate(dto.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + dto.getProductoId()));

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        int stockAnterior = producto.getStockActual();
        int stockPosterior = stockAnterior;

        switch (dto.getTipoMovimiento()) {
            case INGRESO:
            case AJUSTE_SOBRANTE:
                stockPosterior += dto.getCantidad();
                break;

            case EGRESO:
            case AJUSTE_MERMA:
                if (stockAnterior < dto.getCantidad()) {
                    throw new StockInsuficienteException(
                        String.format("Stock insuficiente para el producto '%s'. Stock actual: %d, solicitado: %d",
                                producto.getNombre(), stockAnterior, dto.getCantidad())
                    );
                }
                stockPosterior -= dto.getCantidad();
                break;
        }

        // Actualización atómica del stock del producto
        producto.setStockActual(stockPosterior);
        productoRepository.save(producto);

        // Registro inmutable de auditoría
        MovimientoStock movimiento = MovimientoStock.builder()
                .producto(producto)
                .usuario(usuario)
                .tipoMovimiento(dto.getTipoMovimiento())
                .cantidad(dto.getCantidad())
                .stockAnterior(stockAnterior)
                .stockPosterior(stockPosterior)
                .motivo(dto.getMotivo())
                .build();

        return movimientoRepository.save(movimiento);
    }

    @Transactional(readOnly = true)
    public Page<MovimientoStock> listarMovimientos(Pageable pageable) {
        return movimientoRepository.findAllByOrderByFechaMovimientoDesc(pageable);
    }
}
