package com.inventario.gds.controller;

import com.inventario.gds.dto.request.CategoriaRequestDTO;
import com.inventario.gds.dto.response.CategoriaResponseDTO;
import com.inventario.gds.entity.Categoria;
import com.inventario.gds.exception.ResourceNotFoundException;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.ProductoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    // HU-06: Listado de categorías (solo activas por defecto o todas con incluirInactivas=true)
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean incluirInactivas) {
        List<Categoria> categorias = incluirInactivas
                ? categoriaRepository.findAllByOrderByNombreAsc()
                : categoriaRepository.findByActivoTrueOrderByNombreAsc();

        List<CategoriaResponseDTO> response = categorias.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Obtener categoría individual por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> obtenerPorId(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        return ResponseEntity.ok(mapToDTO(categoria));
    }

    // HU-06: Crear categoría
    @PostMapping
    @Transactional
    public ResponseEntity<CategoriaResponseDTO> crear(@Valid @RequestBody CategoriaRequestDTO dto) {
        String nombreNormalizado = dto.getNombre().trim();

        if (categoriaRepository.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new IllegalArgumentException("Ya existe una categoría registrada con el nombre: " + nombreNormalizado);
        }

        Categoria categoria = Categoria.builder()
                .nombre(nombreNormalizado)
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .activo(true)
                .build();

        Categoria guardada = categoriaRepository.save(categoria);
        return new ResponseEntity<>(mapToDTO(guardada), HttpStatus.CREATED);
    }

    // HU-06: Modificar categoría
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CategoriaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO dto) {

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        String nuevoNombre = dto.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nuevoNombre, id)) {
            throw new IllegalArgumentException("Ya existe otra categoría registrada con el nombre: " + nuevoNombre);
        }

        categoria.setNombre(nuevoNombre);
        categoria.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);

        Categoria guardada = categoriaRepository.save(categoria);
        return ResponseEntity.ok(mapToDTO(guardada));
    }

    // HU-06: Baja lógica de categoría
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> bajaLogica(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        if (Boolean.FALSE.equals(categoria.getActivo())) {
            throw new IllegalArgumentException("La categoría ya se encuentra inactiva");
        }

        categoria.setActivo(false);
        categoriaRepository.save(categoria);
        return ResponseEntity.noContent().build();
    }

    // HU-06: Reactivación de categoría
    @PatchMapping("/{id}/reactivar")
    @Transactional
    public ResponseEntity<CategoriaResponseDTO> reactivar(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        if (Boolean.TRUE.equals(categoria.getActivo())) {
            throw new IllegalArgumentException("La categoría ya se encuentra activa");
        }

        categoria.setActivo(true);
        Categoria guardada = categoriaRepository.save(categoria);
        return ResponseEntity.ok(mapToDTO(guardada));
    }

    private CategoriaResponseDTO mapToDTO(Categoria c) {
        Long cantidad = productoRepository != null ? productoRepository.countByCategoriaIdAndActivoTrue(c.getId()) : 0L;
        return CategoriaResponseDTO.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .descripcion(c.getDescripcion())
                .activo(c.getActivo())
                .cantidadProductos(cantidad != null ? cantidad : 0L)
                .build();
    }
}
