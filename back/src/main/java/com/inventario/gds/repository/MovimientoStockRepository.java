package com.inventario.gds.repository;

import com.inventario.gds.entity.MovimientoStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {
    Page<MovimientoStock> findAllByOrderByFechaMovimientoDesc(Pageable pageable);
    List<MovimientoStock> findByProductoIdOrderByFechaMovimientoDesc(Long productoId);
}
