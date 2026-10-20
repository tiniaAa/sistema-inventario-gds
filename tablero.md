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
| **KPI 1** | **Tasa de Completitud del Backlog** | Productividad | HU terminada cuando cumple criterios de aceptación, validaciones front/back, pruebas locales/staging sin errores y PR mergeado en `main`. | **0 / 12 HU (0%)** | 🟡 En Inicio | Las 12 HU están pendientes de merge final; foco actual en cerrar la Etapa 1. |
| **KPI 2** | **Consumo de Esfuerzo (Story Points)** | Tiempo y Esfuerzo | Comparativa entre Story Points planificados (80 SP) vs. consumidos a la fecha entre Etapa 1 (38 SP) y Etapa 2 (42 SP). | **0 / 80 SP (0% desvío)** | 🟢 Sin Desvío | Etapa 1 en proceso (38 SP) y Etapa 2 pendiente (42 SP). |
| **KPI 3** | **Balance de Carga y Capacidad** | Capacidad vs. Demanda | Distribución de Historias de Usuario y criticidad por desarrollador frente a las 10 hs/semana c/u. | **4 HU c/u (Equilibrado)** | 🟡 Atención | @tiniaAa concentra 3 HU de prioridad Alta; vigilar posibles cuellos de botella en backend. |
| **KPI 4** | **Latencia GET /productos (2.000 ítems)** | Calidad Técnica | Tiempo de respuesta de red del endpoint de catálogo ante volúmenes elevados de datos. | **&lt; 100 ms** (antes: &gt; 3.000 ms) | 🟢 Óptimo | Reducción de más del 96% tras implementar paginación del lado del servidor (*Server-Side Pagination*). |
| **KPI 5** | **Mitigación de Riesgos y Alcance** | Calidad y Tiempo | Cobertura de salvaguardas activas ante riesgos críticos detectados y control de desvíos en tareas secundarias. | **4 / 4 Riesgos cubiertos (100%)** | 🟢 Controlado | Replanificación de HU 12 (PDF a CSV) evitó retrasos en entregables centrales. |

---

## 3. Desglose del Backlog por Integrante y Prioridad

| Integrante | Rol en el Proyecto | Total HU | Prioridad Alta 🔴 | Prioridad Media 🟡 | Prioridad Baja 🟢 | Historias de Usuario Asignadas y Foco |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **@tiniaAa** | Project Lead / Backend / Seguridad | 4 HU | 3 (HU 1, 7, 8) | 1 (HU 9) | 0 | Autenticación JWT (HU 1), Ingreso stock (HU 7), Egreso stock (HU 8) y Ajuste merma (HU 9). |
| **@mateomujica** | Frontend / Catálogo de Productos | 4 HU | 1 (HU 2) | 2 (HU 3, 4) | 1 (HU 6) | Alta producto (HU 2), Modificación producto (HU 3), Baja lógica (HU 4) y Categorías (HU 6). |
| **@iFaustoo** | Vistas / Auditoría / Alertas y Reportes | 4 HU | 2 (HU 5, 10) | 1 (HU 11) | 1 (HU 12) | Listado y búsqueda paginada (HU 5), Alertas stock mínimo (HU 10), Historial auditoría (HU 11) y Exportación CSV (HU 12). |
| **Total Equipo** | **Disponibilidad: 30 hs/sem (10 hs c/u)** | **12 HU** | **6 HU (50%)** | **4 HU (33,3%)** | **2 HU (16,7%)** | **100% del Backlog en estado Pendiente de cierre final.** |

---

## 4. Matriz de Control de Riesgos y Decisiones Técnicas

| Riesgo / Problema Detectado | Impacto Potencial | Medida de Mitigación / Decisión Implementada | Estado |
| :--- | :--- | :--- | :--- |
| **1. Concurrencia en stock (Race conditions)** | Egresos simultáneos generando stock negativo e inconsistencias en la base de datos. | Transacciones `@Transactional`, bloqueo pesimista (`PESSIMISTIC_WRITE` / `SELECT FOR UPDATE`) y restricción `CHECK (stock_actual >= 0)`. | 🟢 Mitigado en diseño |
| **2. Conflictos de Merge en Git** | Sobrescritura de código al trabajar en paralelo sobre entidades centrales. | Adopción de GitHub Flow, ramas cortas `feature/HU-xx` y Pull Requests con code review obligatorio. | 🟢 Política Activa |
| **3. Pérdida de integridad referencial** | Errores de foreign key o eliminación de auditoría histórica al borrar productos. | Patrón de baja lógica (`activo = false`), `ON DELETE RESTRICT` y tabla append-only `movimientos_stock`. | 🟢 Mitigado en BD |
| **4. Desborde de alcance (HU 12)** | Librerías de renderizado PDF insumieron el doble de tiempo estimado. | Priorización MoSCoW: reemplazo de generación PDF por exportación nativa a CSV vía streaming. | 🟢 Replanificado |
| **5. Vulnerabilidad de sesiones** | Falta de separación segura entre Administrador y Operador en revisión inicial. | Migración a autenticación stateless con JWT, hash BCrypt y validación de roles por endpoint. | 🟢 Implementado |

---

## 5. Cierre Reflexivo de la Unidad

> *"Lo que se mide, se gestiona. Lo que se gestiona, se mejora." — Peter Drucker*

### 1. ¿Indicadores útiles vs. irrelevantes?
Un indicador **útil** es accionable, medible con precisión objetiva y está alineado a las prioridades del proyecto; uno **irrelevante** consume tiempo sin incidir en la toma de decisiones.  
En StockMaster, medir la **latencia de respuesta del catálogo (< 100 ms)** y el **avance estricto según Definition of Done (0/12 HU)** son indicadores útiles porque validan escalabilidad técnica real y visibilizan con exactitud qué funcionalidades están listas para staging y producción. Por el contrario, medir "cantidad de líneas de código escritas" sería irrelevante frente al límite de 10 horas semanales por integrante.

### 2. ¿Cómo anticipan riesgos los KPIs?
Los KPIs actúan como un **sistema de alerta temprana** cuyas variaciones alertan al equipo antes de que los desvíos escalen a bloqueos mayores.  
Monitorear el consumo de esfuerzo permitió detectar que la integración de librerías PDF para la HU 12 insumía más del 200% de la estimación original, disparando a tiempo la decisión de sustituirla por exportación CSV antes de comprometer las funcionalidades de la Etapa 2. Asimismo, visualizar que `@tiniaAa` concentra 3 historias de prioridad Alta advierte al equipo para brindarle apoyo temprano en revisiones de código y no retrasar los endpoints del backend.

### 3. ¿Reportes + Indicadores = mejor comunicación?
Los indicadores y los reportes son complementarios: **los indicadores muestran el "qué" y los reportes explican el "por qué" y el "cómo"**.  
Si solo observáramos el valor numérico (0/12 HU finalizadas y 0/80 SP consumidos), un observador externo podría asumir erróneamente que no hubo actividad. El reporte cualitativo explica que la Etapa 1 se encuentra actualmente *En proceso* y que el equipo estuvo resolviendo cimientos críticos de arquitectura (seguridad JWT con BCrypt, aislamiento transaccional con bloqueo pesimista y paginación en servidor) indispensables para que las Historias de Usuario cumplan el *Definition of Done*.

---

## 6. Código del Dashboard y Servidor Gratuito

El código fuente del dashboard se encuentra alojado en [`/docs/index.html`](docs/index.html).  
Está construido en HTML5 semántico, estilizado con **TailwindCSS** e incorpora gráficos interactivos renderizados con **Chart.js**, además de un botón directo para imprimir/guardar el artefacto en formato **PDF**.
