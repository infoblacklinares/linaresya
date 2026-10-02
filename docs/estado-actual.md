# Estado actual de LinaresYa

**Corte:** 2026-10-02

Este documento es la referencia rapida del estado tecnico del proyecto. Los documentos historicos de cada etapa se conservan; si describen una tarea como pendiente, debe interpretarse dentro de la fecha de ese documento.

## Estado confirmado

- La rama principal es `main`.
- La validacion automatica ejecuta tests y build.
- El ultimo CI revisado esta en estado exitoso.
- El estado de ficha esta unificado entre Admin, Calidad y ficha individual.
- La cola operativa de Admin usa prioridades y destinos contextuales.
- Data Auditor se integra como fuente complementaria de hallazgos.
- Las claves de Supabase usan el modelo actual: Publishable en cliente y Secret en servidor/CI.
- No hay issues abiertos registrados en el repositorio al momento de este corte.

## Bloques cerrados de la etapa actual

- 4.1.1 Cola operativa y destinos.
- 4.1.2 Reglas de prioridad.
- 4.1.3 Centro operativo administrativo.
- 4.1.4 Jerarquia visual.
- 4.2 Contexto y acciones.
- 4.3 Salud de ficha.
- 4.4 Unificacion del estado de ficha.
- 4.5 Validacion integral.
- 4.6 CI y cierre tecnico de la implementacion.

## Pendientes reales

Los siguientes puntos siguen siendo deuda o decisiones futuras y no se consideran parte del bloque cerrado:

- Integrar `logAudit()` en acciones administrativas sensibles y revisar antes la migracion de auditoria.
- Revisar limites distribuidos para busqueda, reseñas y reportes.
- Revisar estrategia del service worker/cache.
- Completar la version de tipos compartidos.
- Evaluar pruebas de integracion/UI.
- Resolver la estrategia de versionado del esquema de base de datos.
- Revisar los pendientes de seguridad y privacidad documentados en arquitectura.

## Regla de trabajo

No iniciar una nueva funcionalidad solo porque aparezca mencionada como "pendiente" en un documento historico. Primero contrastar con este estado y con el codigo de `main`.

El siguiente bloque de desarrollo debe salir de los pendientes reales y priorizarse por impacto, riesgo y necesidad del producto.
