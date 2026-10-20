package com.inventario.gds.controller;

import com.inventario.gds.entity.Categoria;
import com.inventario.gds.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    @GetMapping
    public ResponseEntity<List<Categoria>> listarActivas() {
        return ResponseEntity.ok(categoriaRepository.findByActivoTrue());
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        categoria.setActivo(true);
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }
}
