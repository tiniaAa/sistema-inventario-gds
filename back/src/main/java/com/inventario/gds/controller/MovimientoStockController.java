package com.inventario.gds.controller;

import com.inventario.gds.dto.request.MovimientoRequestDTO;
import com.inventario.gds.entity.MovimientoStock;
import com.inventario.gds.service.MovimientoStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoStockController {

    private final MovimientoStockService movimientoService;

    // HU-07, HU-08, HU-09: Registro transaccional de movimientos
    @PostMapping
    public ResponseEntity<MovimientoStock> registrar(
            @Valid @RequestBody MovimientoRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        MovimientoStock movimiento = movimientoService.registrarMovimiento(dto, userDetails.getUsername());
        return new ResponseEntity<>(movimiento, HttpStatus.CREATED);
    }

    // HU-11: Listado de auditoría
    @GetMapping
    public ResponseEntity<Page<MovimientoStock>> listar(Pageable pageable) {
        return ResponseEntity.ok(movimientoService.listarMovimientos(pageable));
    }
}
