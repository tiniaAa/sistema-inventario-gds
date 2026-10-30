package com.inventario.gds.repository;

import com.inventario.gds.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByActivoTrue();
    List<Categoria> findByActivoTrueOrderByNombreAsc();
    List<Categoria> findAllByOrderByNombreAsc();
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    Boolean existsByNombreIgnoreCase(String nombre);
    Boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
