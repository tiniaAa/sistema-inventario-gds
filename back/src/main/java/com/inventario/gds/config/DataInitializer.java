package com.inventario.gds.config;

import com.inventario.gds.entity.Categoria;
import com.inventario.gds.entity.Rol;
import com.inventario.gds.entity.Usuario;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Inicializar Usuarios de Prueba si la tabla está vacía
        if (usuarioRepository.count() == 0) {
            log.info("Inicializando usuarios de prueba por defecto...");

            // 1. Usuario Administrador
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador del Sistema")
                    .email("admin@inventario.com")
                    .rol(Rol.ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);

            // 2. Usuario Operador
            Usuario operador = Usuario.builder()
                    .username("operador")
                    .passwordHash(passwordEncoder.encode("operador123"))
                    .nombreCompleto("Operador de Depósito")
                    .email("operador@inventario.com")
                    .rol(Rol.OPERADOR)
                    .activo(true)
                    .build();
            usuarioRepository.save(operador);

            log.info("Usuarios creados exitosamente: 'admin' (pass: admin123) y 'operador' (pass: operador123)");
        }

        // Inicializar Categorías iniciales si la tabla está vacía
        if (categoriaRepository.count() == 0) {
            log.info("Inicializando categorías por defecto...");
            categoriaRepository.save(Categoria.builder().nombre("Herramientas").descripcion("Herramientas de mano y eléctricas").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Materiales Eléctricos").descripcion("Cables, interruptores y componentes").activo(true).build());
            categoriaRepository.save(Categoria.builder().nombre("Insumos de Almacén").descripcion("Cajas, precintos y embalajes").activo(true).build());
            log.info("Categorías iniciales creadas exitosamente.");
        }
    }
}
