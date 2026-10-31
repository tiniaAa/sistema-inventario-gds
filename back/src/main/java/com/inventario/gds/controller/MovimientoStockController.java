package com.inventario.gds.controller;

import com.inventario.gds.dto.request.MovimientoRequestDTO;
import com.inventario.gds.dto.response.MovimientoResponseDTO;
import com.inventario.gds.service.MovimientoStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoStockController {

    private final MovimientoStockService movimientoService;

    // HU-07, HU-08, HU-09: Registro transaccional de movimientos
    @PostMapping
    public ResponseEntity<MovimientoResponseDTO> registrar(
            @Valid @RequestBody MovimientoRequestDTO dto,
            Principal principal) {

        String username = principal != null ? principal.getName() : "sistema";
        MovimientoResponseDTO movimiento = movimientoService.registrarMovimiento(dto, username);
        return new ResponseEntity<>(movimiento, HttpStatus.CREATED);
    }

    // HU-11: Listado de auditoría
    @GetMapping
    public ResponseEntity<Page<MovimientoResponseDTO>> listar(Pageable pageable) {
        return ResponseEntity.ok(movimientoService.listarMovimientos(pageable));
    }
}
