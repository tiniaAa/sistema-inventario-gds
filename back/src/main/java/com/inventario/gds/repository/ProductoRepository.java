package com.inventario.gds.repository;

import com.inventario.gds.entity.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Bloqueo pesimista para evitar condiciones de carrera en movimientos de stock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Producto p WHERE p.id = :id")
    Optional<Producto> findByIdForUpdate(@Param("id") Long id);

    Optional<Producto> findBySku(String sku);
    Boolean existsBySku(String sku);

    // Listado paginado de productos activos
    Page<Producto> findByActivoTrue(Pageable pageable);

    // Búsqueda paginada por nombre o SKU (HU-05)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Producto> searchActivos(@Param("query") String query, Pageable pageable);

    // Alertas de stock crítico (HU-10)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stockActual <= p.stockMinimo ORDER BY p.stockActual ASC")
    List<Producto> findProductosCriticos();
}
