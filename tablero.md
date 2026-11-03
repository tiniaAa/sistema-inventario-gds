# Tablero de Control del Proyecto (Dashboard) — StockMaster

> **Enlace del Dashboard en vivo (Servidor Gratuito GitHub Pages):**  
> 🔗 [https://tiniaaa.github.io/sistema-inventario-gds/](https://tiniaaa.github.io/sistema-inventario-gds/)

---

## 1. Contexto Operativo y Equipo de Desarrollo

* **Proyecto:** StockMaster — Sistema web de gestión de inventario para pequeños comercios y depósitos minoristas.
* **Repositorio Oficial:** [https://github.com/tiniaAa/sistema-inventario-gds](https://github.com/tiniaAa/sistema-inventario-gds)
* **Equipo Responsable y Roles:**
  * `@tiniaAa`: Project Lead / Backend Core / Seguridad.
  * `@mateomujica`: Frontend / Catálogo de Productos.
  * `@iFaustoo`: Vistas / Auditoría / Alertas y Reportes.
* **Stack Tecnológico:**
  * **Frontend:** React (Vite, Axios, TailwindCSS).
  * **Backend:** Java 17/21 con Spring Boot 3.x (Spring Web, Spring Security + JWT, Spring Data JPA / Hibernate, Hibernate Validator).
  * **Base de Datos:** PostgreSQL 15+ (con transacciones ACID, restricciones `CHECK` e integridad referencial `ON DELETE RESTRICT`).
* **Restricciones Operativas:**
  * Plazo estricto cuatrimestral académico.
  * Infraestructura desplegada en capa gratuita.
  * Disponibilidad horaria limitada a 10 horas semanales por integrante (30 hs/semana totales en el equipo).
* **Audiencia del Dashboard:** El equipo de desarrollo y los docentes/evaluadores de la cátedra de Gestión del Desarrollo de Software (UTN - TUP).

---

## 2. Definición y Selección de Indicadores (KPIs)

| Código | Indicador Clave (KPI) | Dimensión | Criterio de Medición (Definition of Done) | Estado Actual vs. Meta | Semáforo | Interpretación y Acción Requerida |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI 1** | **Tasa de Completitud del Backlog** | Productividad | HU terminada cuando cumple criterios de aceptación, validaciones front/back, pruebas locales/staging sin errores y PR mergeado en `main`. | **7 / 12 HU (58.33%)** | 🟢 Superó el 50% | 7 HU terminadas (HU-01 a 04, 06, 07 y 08) con 52 tests backend y componentes front validados. 5 HU pendientes. |
| **KPI 2** | **Consumo de Esfuerzo (Story Points)** | Tiempo y Esfuerzo | Comparativa entre Story Points planificados (80 SP) vs. consumidos a la fecha entre Etapa 1 (38 SP) y Etapa 2 (42 SP). | **45 / 80 SP (56.25% - 0% desvío)** | 🟢 Sin Desvío | 29 SP consumidos en Etapa 1 (83% de la etapa) y 16 SP en Etapa 2 (38% de la etapa). Consumo alineado al avance real. |
| **KPI 3** | **Balance de Carga y Capacidad** | Capacidad vs. Demanda | Distribución de avance y carga por desarrollador frente a las 10 hs/semana c/u. | **Desbalance crítico (0% vs 100%)** | 🔴 Cuello de Botella | @mateomujica completó el 100% (4/4 HU); @tiniaAa avanzó 75% (3/4 HU); @iFaustoo retiene 0% (0/4 HU - concentra el 80% del backlog pendiente). Requiere pair programming en HU-05 y redistribución de tareas. |
| **KPI 4** | **Latencia GET /productos (2.000 ítems)** | Calidad Técnica | Tiempo de respuesta de red del endpoint de catálogo ante volúmenes elevados de datos. | **< 100 ms** (antes: > 3.000 ms) | 🟢 Óptimo | Reducción del 96.7% consolidada mediante paginación del lado del servidor (*Server-Side Pagination*) con `Pageable`. |
| **KPI 5** | **Mitigación de Riesgos y Alcance** | Calidad y Tiempo | Cobertura de salvaguardas activas ante riesgos críticos detectados y control de desvíos en tareas secundarias. | **10 / 10 Riesgos cubiertos (100%)** | 🟢 Controlado | Matriz ampliada a 10 riesgos en `contexto.md` con defensas en profundidad (bloqueo pesimista, JWT, soft delete, CSV streaming). |

---

## 3. Desglose del Backlog por Integrante y Prioridad

| Integrante | Rol en el Proyecto | Total HU | Terminadas | Pendientes | Prioridad Alta 🔴 | Prioridad Media 🟡 | Prioridad Baja 🟢 | Estado de Cumplimiento y Foco |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **@tiniaAa** | Project Lead / Backend / Seguridad | 4 HU | 3 (75%) | 1 (25%) | 3 (HU 1, 7, 8) | 1 (HU 9) | 0 | **75% completado:** HU 1, 7 y 8 Terminadas. Pendiente: HU 9 (Ajuste merma). |
| **@mateomujica** | Frontend / Catálogo de Productos | 4 HU | 4 (100%) | 0 (0%) | 1 (HU 2) | 2 (HU 3, 4) | 1 (HU 6) | **100% completado:** HU 2, 3, 4 y 6 Terminadas. Capacidad liberada para apoyar al equipo. |
| **@iFaustoo** | Vistas / Auditoría / Alertas y Reportes | 4 HU | 0 (0%) | 4 (100%) | 2 (HU 5, 10) | 1 (HU 11) | 1 (HU 12) | **0% completado (Cuello de botella):** HU 5 (bloquea Etapa 1), HU 10, 11 y 12 Pendientes. |
| **Total Equipo** | **Disponibilidad: 30 hs/sem (10 hs c/u)** | **12 HU** | **7 HU (58.3%)** | **5 HU (41.7%)** | **6 HU (50%)** | **4 HU (33.3%)** | **2 HU (16.7%)** | **Progreso global: 58.33% del backlog terminado.** |

---

## 4. Matriz de Control de Riesgos y Decisiones Técnicas

| Riesgo / Problema Detectado | Impacto Potencial | Medida de Mitigación / Decisión Implementada | Estado |
| :--- | :--- | :--- | :--- |
| **1. Concurrencia en stock (Race conditions)** | Egresos e ingresos simultáneos generando stock negativo e inconsistencias en la base de datos. | Transacciones `@Transactional`, bloqueo pesimista (`PESSIMISTIC_WRITE` / `findByIdForUpdate`), validación reactiva en cliente y restricción `CHECK (stock_actual >= 0)`. | 🟢 Implementado en HU-07 y HU-08 |
| **2. Conflictos de Merge en Git** | Sobrescritura de código al trabajar en paralelo sobre entidades centrales. | Adopción de GitHub Flow, ramas cortas `feature/HU-xx` y Pull Requests con code review obligatorio. | 🟢 Política Activa |
| **3. Pérdida de integridad referencial** | Errores de foreign key o eliminación de auditoría histórica al borrar productos o categorías. | Patrón de baja lógica (`activo = false`), `ON DELETE RESTRICT` y tabla append-only `movimientos_stock`. | 🟢 Implementado en HU-04 y HU-06 |
| **4. Desborde de alcance (HU 12)** | Librerías de renderizado PDF insumieron el doble de tiempo estimado. | Priorización MoSCoW: reemplazo de generación PDF por exportación nativa a CSV vía streaming. | 🟢 Replanificado |
| **5. Expiración de token JWT en modales** | Destrucción de estado de formularios abiertos al expirar token de sesión. | Aislamiento de error 401 en interceptor Axios y propuesta de borrador en `sessionStorage`. | 🟢 Controlado |
| **6. Discrepancias mocks vs DB PostgreSQL** | Falsos positivos en pruebas ante violaciones de constraints físicos relacionales. | Incorporación proyectada de Testcontainers en CI para validar sobre motor real. | 🟡 En Monitoreo |
| **7. Desincronización de categorías activas** | Error 400 tardío si un admin desactiva una categoría mientras otro edita un producto. | Captura semántica del error en cliente y endpoint con parámetro opcional `incluirInactivas`. | 🟢 Implementado |
| **8. Irreversibilidad de bajas lógicas** | Imposibilidad de restaurar productos desactivados por error sin tocar SQL directo. | Diseño de endpoint `PATCH /api/productos/{id}/reactivar` análogo al de categorías. | 🟡 Planificado |
| **9. Opacidad de catálogo histórico inactivo** | Repositorios excluyen productos inactivos impidiendo auditoría visual a administradores. | Parámetro `incluirInactivos` proyectado para vistas exclusivas de rol `ADMIN`. | 🟡 Planificado |
| **10. Sobrecarga por colección de categorías** | `GET /api/categorias` retorna lista completa en memoria sin paginar. | `Pageable` proyectado para Server-Side Pagination cuando el catálogo de categorías crezca. | 🟢 Mitigado por escala actual |

---

## 5. Cierre Reflexivo de la Unidad

> *"Lo que se mide, se gestiona. Lo que se gestiona, se mejora." — Peter Drucker*

### 1. ¿Indicadores útiles vs. irrelevantes?
Un indicador **útil** es accionable, medible con precisión objetiva y está alineado a las prioridades del proyecto; uno **irrelevante** consume tiempo sin incidir en la toma de decisiones.  
En StockMaster, medir la **latencia de respuesta del catálogo (< 100 ms)** y el **avance estricto según Definition of Done (7/12 HU terminadas, 58.33%)** son indicadores útiles porque validan escalabilidad técnica real y visibilizan con exactitud qué funcionalidades están listas para staging y producción con tests superados. Por el contrario, medir "cantidad de líneas de código escritas" sería irrelevante frente al límite de 10 horas semanales por integrante, ya que un buen refactor reduce líneas aumentando la calidad.

### 2. ¿Cómo anticipan riesgos los KPIs?
Los KPIs actúan como un **sistema de alerta temprana** cuyas variaciones alertan al equipo antes de que los desvíos escalen a bloqueos mayores.  
Monitorear el consumo de esfuerzo permitió detectar tempranamente que la integración de librerías PDF para la HU 12 insumía más del 200% de la estimación original, disparando a tiempo la decisión de sustituirla por exportación CSV antes de comprometer las funcionalidades de la Etapa 2.  
Asimismo, el KPI 3 (*Balance de Capacidad*) visibiliza un **riesgo crítico de cuello de botella actual**: `@mateomujica` ya completó el 100% de sus historias asignadas (4/4 HU), mientras que `@iFaustoo` no ha completado ninguna (0/4 HU), acumulando 4 de las 5 tareas pendientes del proyecto e impidiendo dar por cerrada la Etapa 1 por la falta de HU-05. Este indicador alerta formalmente al equipo sobre la necesidad inmediata de pair programming o reasignación de soporte.

### 3. ¿Reportes + Indicadores = mejor comunicación?
Los indicadores y los reportes son complementarios: **los indicadores muestran el "qué" y los reportes explican el "por qué" y el "cómo"**.  
Si solo observáramos el valor numérico (7/12 HU finalizadas y 45/80 SP consumidos), un observador externo sabría que se superó la mitad del proyecto, pero ignoraría los detalles cualitativos. El reporte cualitativo explica que la Etapa 1 tiene 5 de sus 6 historias cerradas, que la Etapa 2 ya cuenta con el núcleo transaccional de stock funcionando con bloqueo pesimista (`MovimientoStockService` y modales de ingreso y egreso en React), y que existen 52 tests automatizados respaldando la robustez del sistema. La combinación de métricas duras y narrativa técnica elimina malentendidos con los evaluadores y alinea al equipo de desarrollo.

---

## 6. Código del Dashboard y Servidor Gratuito

El código fuente del dashboard se encuentra alojado en [`/docs/index.html`](docs/index.html).  
Está construido en HTML5 semántico, estilizado con **TailwindCSS** e incorpora gráficos interactivos renderizados con **Chart.js**, además de un botón directo para imprimir/guardar el artefacto en formato **PDF**.
