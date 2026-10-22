package com.inventario.gds.controller;

import com.inventario.gds.dto.request.ProductoRequestDTO;
import com.inventario.gds.dto.response.ProductoResponseDTO;
import com.inventario.gds.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // HU-05: Listado con paginación y búsqueda
    @GetMapping
    public ResponseEntity<Page<ProductoResponseDTO>> listarProductos(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(productoService.listarProductos(search, pageable));
    }

    // HU-10: Alertas de stock crítico
    @GetMapping("/alertas")
    public ResponseEntity<List<ProductoResponseDTO>> obtenerAlertas() {
        return ResponseEntity.ok(productoService.obtenerAlertas());
    }

    // HU-02: Alta de producto
    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crearProducto(
            @Valid @RequestBody ProductoRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        ProductoResponseDTO response = productoService.crearProducto(dto, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // HU-04: Baja lógica de producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> bajaLogica(@PathVariable Long id) {
        productoService.bajaLogica(id);
        return ResponseEntity.noContent().build();
    }
}
