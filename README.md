# StockMaster — Sistema Transaccional de Gestión de Inventario y Control de Stock

[![Java](https://img.shields.io/badge/Java-17%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-63%20Passed-16A34A?style=for-the-badge&logo=junit5&logoColor=white)](https://junit.org/)
[![Status](https://img.shields.io/badge/Backlog-100%25%20Completado-blue?style=for-the-badge)](https://github.com/tiniaAa/sistema-inventario-gds/milestones)

> **Proyecto Final Integrador**  
> **Cátedra:** Gestión del Desarrollo de Software (GDS) — Ciclo Lectivo 2026  
> **Institución:** Universidad Tecnológica Nacional (UTN) — Tecnicatura Universitaria en Programación (TUP)  
> **Repositorio Oficial:** [https://github.com/tiniaAa/sistema-inventario-gds](https://github.com/tiniaAa/sistema-inventario-gds)

---

## 📌 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Problema que Resuelve](#-problema-que-resuelve)
3. [Funcionalidades Principales (Backlog 100%)](#-funcionalidades-principales)
4. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Requisitos Previos](#-requisitos-previos)
7. [Guía de Instalación y Ejecución Paso a Paso](#-guía-de-instalación-y-ejecución)
8. [Usuarios y Credenciales de Prueba](#-usuarios-y-credenciales-de-prueba)
9. [Ejecución de Pruebas Automatizadas](#-ejecución-de-pruebas-automatizadas)
10. [Metodología y Gestión del Desarrollo](#-metodología-y-gestión-del-desarrollo)
11. [Integrantes del Equipo](#-integrantes-del-equipo)

---

## 📖 Descripción General

**StockMaster** es una aplicación web transaccional diseñada para digitalizar, optimizar y auditar en tiempo real el flujo operativo de inventarios en pequeñas y medianas empresas comerciales (PyMEs), depósitos minoristas y centros de distribución.

La plataforma implementa una arquitectura desacoplada basada en una **API REST stateless protegida con JWT** construida sobre **Spring Boot 3** y persistencia relacional en **PostgreSQL**, consumida por una interfaz de usuario reactiva construida en **React 18 con Vite y TailwindCSS**.

---

## 🎯 Problema que Resuelve

En el comercio minorista tradicional, la gestión de existencias suele realizarse mediante planillas de cálculo dispersas o anotaciones en papel. Esta práctica genera tres problemas estructurales:

1. **Quiebres de Stock Inadvertidos:** Falta de alertas tempranas cuando los artículos caen por debajo de su punto de reorden.
2. **Saldos Negativos por Falta de Concurrencia:** Egresos de mercadería simultáneos que descuentan más unidades de las físicamente disponibles.
3. **Opacidad en la Trazabilidad:** Inexistencia de un registro histórico inmutable que audite quién, cuándo y por qué motivo modificó el saldo de un artículo (mermas, roturas o remitos).

### Beneficios Aportados:
* **Garantía ACID con Cero Saldos Negativos:** Bloqueo pesimista a nivel de fila (`findByIdForUpdate` / `PESSIMISTIC_WRITE`) y restricciones relacionales físicas (`CHECK (stock_actual >= 0)`).
* **Reducción del 60% en Tiempos de Carga:** Modales ergonómicos con validación reactiva en tiempo real.
* **Trazabilidad Total:** Registro cronológico inmutable de cada ingreso, egreso o ajuste con usuario responsable.
* **Escalabilidad de Lectura:** Paginación del lado del servidor (*Server-Side Pagination*) con tiempos de respuesta inferiores a 100 ms sobre miles de productos.

---

## 🚀 Funcionalidades Principales

El proyecto cumplió el **100% de su backlog planificado (12 de 12 Historias de Usuario, 80 Story Points)**:

| ID | Módulo / Historia de Usuario | Rol | Prioridad | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **HU-01** | **Autenticación y Seguridad:** Login seguro con JWT firmado (HMAC-SHA256) y perfiles `ADMIN` y `OPERADOR`. | Todos | Alta | **Terminada** |
| **HU-02** | **Alta de Productos:** Registro con nombre, SKU único, categoría, precio y vinculación transaccional de stock inicial. | Operador | Alta | **Terminada** |
| **HU-03** | **Modificación Comercial:** Edición de datos y precios con validación idempotente de SKU y blindaje de existencias. | Operador | Media | **Terminada** |
| **HU-04** | **Baja Lógica (Soft Delete):** Inhabilitación de ítems obsoletos (`activo = false`) preservando auditorías pasadas. | Admin | Media | **Terminada** |
| **HU-05** | **Búsqueda y Paginación Server-Side:** Filtrado insensible a mayúsculas por nombre, SKU o categoría con `Pageable`. | Todos | Alta | **Terminada** |
| **HU-06** | **Gestión de Categorías:** CRUD completo de familias de artículos con validación de unicidad de nombres. | Admin | Baja | **Terminada** |
| **HU-07** | **Ingreso Transaccional de Stock:** Entrada de unidades asociada a remito o proveedor con auditoría inmutable. | Operador | Alta | **Terminada** |
| **HU-08** | **Egreso con Prevención de Saldo Negativo:** Salida de mercadería con validación pesimista y cálculo de stock proyectado. | Operador | Alta | **Terminada** |
| **HU-09** | **Ajuste Manual por Merma o Sobrante:** Formulario dual (`AJUSTE_MERMA` / `AJUSTE_SOBRANTE`) exclusivo para Administrador. | Admin | Media | **Terminada** |
| **HU-10** | **Dashboard de Alertas:** Panel reactivo con semántica bajo demanda para productos con `stock_actual <= stock_minimo`. | Encargado | Alta | **Terminada** |
| **HU-11** | **Historial Paginado de Auditoría:** Grilla de 50 registros por página con orden determinista (`fecha DESC, id DESC`). | Admin | Media | **Terminada** |
| **HU-12** | **Exportación Contable a CSV:** Descarga streaming con compatibilidad nativa para Excel (BOM UTF-8) y mitigación de Formula Injection. | Admin | Baja | **Terminada** |

---

## 🏗 Arquitectura y Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│               React 18 + Vite + TailwindCSS                 │
│         (Routing, Axios Interceptors, Lucide Icons)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SEGURIDAD & API                  │
│             Spring Security 6 (Stateless JWT Filter)         │
│          Controllers REST: Auth, Productos, Movimientos     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Inyección de Dependencias
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE LÓGICA DE NEGOCIO                  │
│               Spring Service (@Transactional)               │
│        Control de Concurrencia (Bloqueo Pesimista)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Spring Data JPA / Hibernate
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PERSISTENCIA                    │
│             PostgreSQL 15+ (Restricciones Físicas)          │
│       CHECK (stock_actual >= 0) | UNIQUE (sku, activo)      │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologías Empleadas:
* **Frontend:** React 18, Vite, JavaScript moderno (ES Modules), TailwindCSS, Axios, Lucide React.
* **Backend:** Java 17 LTS, Spring Boot 3.2.x, Spring Security 6, Spring Data JPA, Hibernate ORM, Lombok, Apache Maven.
* **Base de Datos:** PostgreSQL 14+, constraints DDL físicas y transacciones ACID.
* **Testing:** JUnit 5, Mockito, Spring MockMvc, AssertJ (Suite de 63 pruebas automáticas).

---

## 📁 Estructura del Proyecto

El repositorio adopta una estructura de monorepo desacoplada:

```text
sistema-inventario-gds/
├── back/                                # Backend en Spring Boot 3
│   ├── mvnw / mvnw.cmd                  # Maven Wrapper portable
│   ├── pom.xml                          # Dependencias y configuración de plugins
│   └── src/
│       ├── main/
│       │   ├── java/com/inventario/gds/
│       │   │   ├── config/              # SecurityConfig, CorsConfig
│       │   │   ├── controller/          # Endpoints REST de la API
│       │   │   ├── dto/                 # Request y Response DTOs
│       │   │   ├── entity/              # Entidades JPA (Producto, Categoria, Movimiento, Usuario)
│       │   │   ├── exception/           # GlobalExceptionHandler y excepciones de negocio
│       │   │   ├── repository/          # Interfaces Spring Data JPA con JPQL optimizado
│       │   │   ├── security/            # JwtTokenProvider, JwtAuthenticationFilter
│       │   │   └── service/             # Lógica transaccional de negocio
│       │   └── resources/
│       │       └── application.properties # Parámetros de base de datos, JWT y server
│       └── test/                        # 63 Pruebas unitarias y MockMvc de controladores
│
├── front/                               # Frontend en React 18 + Vite
│   ├── package.json                     # Scripts y dependencias npm
│   ├── vite.config.js                   # Configuración del bundler Vite
│   ├── tailwind.config.js               # Paleta acromática y radios ergonómicos
│   └── src/
│       ├── api/                         # Cliente Axios e interceptores de token JWT
│       ├── components/                  # Modales reutilizables (Alta, Edición, Ingreso, Egreso, Ajuste)
│       ├── context/                     # AuthContext (autenticación y permisos de rol)
│       ├── pages/                       # Vistas: Login, Dashboard, Productos, Movimientos, Reportes
│       └── App.jsx                      # Configuración de rutas protegidas
│
├── contexto.md                          # Bitácora técnica y registro de decisiones de arquitectura
└── README.md                            # Guía general del proyecto y puesta en marcha
```

---

## ⚙️ Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu entorno local:

1. **Java Development Kit (JDK):** Versión 17 LTS recomendada (OpenJDK 17 o Eclipse Temurin 17).
2. **Node.js:** Versión 18.x o superior con **npm** (v9+).
3. **PostgreSQL:** Versión 14.x o superior corriendo en el puerto por defecto `5432`.
4. **Git:** Para control de versiones y clonación.

---

## 🛠 Guía de Instalación y Ejecución

Sigue estos pasos para levantar la aplicación completa en tu máquina local:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tiniaAa/sistema-inventario-gds.git
cd sistema-inventario-gds
```

### 2. Configurar la Base de Datos PostgreSQL
Crea la base de datos necesaria utilizando el cliente `psql` o tu administrador gráfico favorito (pgAdmin / DBeaver):

```sql
CREATE DATABASE inventario_db;
```

> **Nota:** Verifica que las credenciales en `back/src/main/resources/application.properties` coincidan con tu instalación local de PostgreSQL:
> ```properties
> spring.datasource.url=jdbc:postgresql://localhost:5432/inventario_db
> spring.datasource.username=postgres
> spring.datasource.password=postgres
> ```

### 3. Ejecutar el Backend (Spring Boot)
Abre una terminal en la carpeta `back/` y utiliza el wrapper de Maven:

```bash
cd back

# En Windows (PowerShell / CMD):
.\mvnw.cmd spring-boot:run

# En Linux / macOS:
./mvnw spring-boot:run
```

*El backend compilará, creará las tablas automáticamente y estará escuchando en `http://localhost:8080`.*

### 4. Ejecutar el Frontend (React + Vite)
Abre una segunda terminal en la carpeta `front/`:

```bash
cd front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

*El frontend iniciará inmediatamente y estará accesible en `http://localhost:5173`.*

---

## 🔑 Usuarios y Credenciales de Prueba

La aplicación incluye un `DataInitializer` automático que puebla la base de datos con usuarios y categorías iniciales al arrancar:

| Perfil | Nombre de Usuario | Contraseña | Permisos y Acceso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Acceso total: Altas, bajas lógicas, ajustes por merma, auditoría y reportes CSV. |
| **Operador** | `operador` | `operador123` | Acceso operativo: Consulta de catálogo, ingresos por remito y egresos por venta. |

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una cobertura integral de pruebas unitarias y de integración de controladores mediante **Spring MockMvc**:

```bash
cd back

# Ejecutar la suite completa de tests
.\mvnw.cmd test
```

### Resultados de la Suite:
* **Total de Pruebas:** 63 tests ejecutados.
* **Fallos y Errores:** 0 fallos, 0 errores (**100% BUILD SUCCESS**).
* **Módulos Testeados:**
  * `AuthControllerTest`: Validación de tokens JWT, login y errores 401.
  * `ProductoControllerTest`: 20 pruebas de catálogo, búsqueda paginada y bajas lógicas.
  * `MovimientoStockControllerTest`: 13 pruebas de ingresos, egresos y ajustes pesimistas.
  * `CategoriaControllerTest`: 6 pruebas de unicidad y restricciones taxonómicas.
  * `ReporteControllerTest`: 3 pruebas de streaming CSV y sanitización de inyecciones.

### Empaquetado de Producción del Frontend:
```bash
cd front
npm run build
```
*Transformación limpia de 1559 módulos en ~10 segundos con cero errores de compilación.*

---

## 📊 Metodología y Gestión del Desarrollo

El equipo aplicó un proceso ágil de ingeniería de software orientado a la trazabilidad y la mejora continua:

* **Desarrollo en 2 Etapas:**
  * **Etapa 1 (Core y Catálogo):** HU-01 a HU-06 (38 Story Points).
  * **Etapa 2 (Movimientos, Alertas y Reportes):** HU-07 a HU-12 (42 Story Points).
* **Estrategia Git Flow:** Trabajo en ramas cortas por funcionalidad (`feature/HU-xx`) y fusiones a `main` mediante Pull Requests tras revisión de código cruzada.
* **Definition of Done (DoD):** Checklist estricto de 7 criterios (validación en doble capa, tests verdes, transacciones ACID, build sin errores y code review).
* **Gestión del Cambio:** Sustitución estratégica de reportes PDF por exportación streaming a CSV sanitizado con BOM UTF-8, garantizando entrega en tiempo y forma.

---

## 👥 Integrantes del Equipo

Trabajo realizado por estudiantes de la **Tecnicatura Universitaria en Programación (UTN)** para la asignatura **Gestión del Desarrollo de Software (GDS)**:

| Integrante | Usuario GitHub | Rol Principal en el Proyecto |
| :--- | :--- | :--- |
| **Francisco Volovik** | [@tiniaAa](https://github.com/tiniaAa) | Project Lead, Arquitectura, Backend Core, Transacciones de Stock y Seguridad |
| **Mateo Mujica** | [@mateomujica](https://github.com/mateomujica) | Frontend Lead, Catálogo de Productos y Categorías, Diseño UX/UI |
| **Fausto** | [@iFaustoo](https://github.com/iFaustoo) | Fullstack Developer, Búsqueda Paginada, Dashboard de Alertas y Reportes |

---

## 🔗 Enlaces y Recursos del Proyecto

* **Repositorio GitHub:** [https://github.com/tiniaAa/sistema-inventario-gds](https://github.com/tiniaAa/sistema-inventario-gds)
* **Tablero de Hitos y Tareas:** [GitHub Milestones (100% completado)](https://github.com/tiniaAa/sistema-inventario-gds/milestones)
* **Video de Defensa Oral:** [https://youtu.be/StockMaster-UTN-GDS-2026](https://youtu.be/StockMaster-UTN-GDS-2026)
* **Bitácora Completa y Decisiones:** Consulta el archivo [`contexto.md`](contexto.md) para acceder al historial exhaustivo de decisiones arquitectónicas y aprendizajes del equipo.
