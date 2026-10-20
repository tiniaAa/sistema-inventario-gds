# Módulo Backend - Sistema de Inventarios (StockMaster)

API RESTful desarrollada en **Java 17** con **Spring Boot 3.2.4** y base de datos relacional **PostgreSQL**.

## Estructura de Paquetes

```text
back/src/main/java/com/inventario/gds/
├── config/        # Configuración de Seguridad, CORS y Beans
├── controller/    # Endpoints REST (Auth, Productos, Movimientos, Categorias)
├── dto/           # Data Transfer Objects (Request y Response validados)
├── entity/        # Entidades JPA (Usuario, Categoria, Producto, MovimientoStock, Enums)
├── exception/     # Manejo global de excepciones (@RestControllerAdvice)
├── repository/    # Interfaces JpaRepository con consultas y bloqueo pesimista
├── security/      # Filtros JWT y UserDetailsService
├── service/       # Lógica transaccional (@Transactional y reglas de negocio)
└── InventarioApplication.java # Clase principal de arranque
```

## Requisitos Previos
* Java 17 LTS instalado.
* Base de datos PostgreSQL en ejecución en el puerto `5432` con una base llamada `inventario_db`.

## Configuración y Ejecución
1. Configurar credenciales en `src/main/resources/application.properties`.
2. Para compilar y ejecutar (con Maven instalado o mediante tu IDE favorito como IntelliJ / Eclipse / VS Code):
   ```bash
   mvn clean spring-boot:run
   ```
El backend estará disponible en: `http://localhost:8080/api`
