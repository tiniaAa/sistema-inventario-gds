# Sistema de Gestión de Inventarios (GDS)

Sistema web para el control de inventario, stock y trazabilidad de movimientos de mercadería. Proyecto desarrollado para el Trabajo Final Integrador de Gestión del Desarrollo de Software (GDS).

* **Documentación y Estado del Proyecto:** [contexto.md](contexto.md)
* **Tablero de Tareas:** [Issues del Repositorio](https://github.com/tiniaAa/sistema-inventario-gds/issues)

---

## Guía de Desarrollo para el Equipo

Cada integrante debe utilizar el siguiente **prompt base** al interactuar con su asistente de IA personal para programar su Historia de Usuario asignada. 

Al iniciar una sesión de desarrollo:
1. Copia el texto que figura a continuación.
2. Pega debajo el contenido completo actualizado de [contexto.md](contexto.md).
3. Envíaselo a tu IA.
4. Cuando termines de trabajar en el código, escribe en el chat de tu IA: `FIN DE SESIÓN`.
5. Pásale el reporte resultante al Project Manager para registrar los avances y actualizar el archivo `contexto.md`.

---

### Prompt para la IA Personal

```text
Voy a programar un módulo para mi proyecto. A continuación te pego el estado actual del proyecto (contexto.md) para que conozcas la arquitectura, el alcance y las tecnologías que estamos usando.

Tus reglas estrictas de ejecución:

Cero teoría: No me hables del trabajo práctico, de "etapas" ni de metodologías ágiles. Tu foco es 100% el código, la lógica y la resolución de bugs.

Fidelidad al stack: Solo debes proponer soluciones utilizando las tecnologías y herramientas establecidas en el contexto. No sugieras cambiar de base de datos o migrar de framework a menos que sea técnicamente imposible continuar.

Modo Reporte: Durante nuestra sesión vamos a escribir código y resolver problemas. Cuando yo te escriba el comando "FIN DE SESIÓN", debes dejar de programar y generar un reporte técnico crudo en viñetas (Markdown) con:

Qué parte de la funcionalidad logramos terminar.

Qué errores técnicos, bugs, problemas de compatibilidad o de lógica enfrentamos (detallados técnicamente de forma verídica).

Qué partes del código quedaron pendientes o rotas.

A continuación, el contexto del proyecto. Léelo, confírmame que entendiste el stack tecnológico y pregúntame en qué ID de funcionalidad vamos a trabajar hoy.
```
