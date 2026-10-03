# Estado actual de LinaresYa

**Corte:** 2026-10-03

Este documento es la referencia rapida del estado tecnico del proyecto. Los documentos historicos de cada etapa se conservan; si describen una tarea como pendiente, debe interpretarse dentro de la fecha de ese documento.

## Estado confirmado

- La rama principal es `main`.
- La validacion automatica ejecuta tests y build; la produccion actual esta desplegada correctamente.
- El estado de ficha esta unificado entre Admin, Calidad y ficha individual.
- La cola operativa de Admin usa prioridades y destinos contextuales.
- Data Auditor se integra como fuente complementaria de hallazgos.
- Las claves de Supabase usan el modelo actual: Publishable en cliente y Secret en servidor/CI.
- La auditoria administrativa funciona en produccion: una edicion real de ficha genero registros en `audit_logs` con `before/after`, `actor_type=admin_panel` y `reason`.
- La migracion `supabase/migrations/20261002_audit_logs_v2.sql` fue ejecutada y verificada en Supabase.
- La integracion de auditoria cubre negocios, reseñas, reportes, resultados reportados, ediciones administrativas y aprobacion mediante link firmado.
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
- 4.8 Auditoria administrativa y verificacion funcional en produccion.

## Pendientes reales

### Seguridad
- Rotar la `SUPABASE_SECRET_KEY` anterior que fue expuesta durante el trabajo. Se mantiene como deuda de saneamiento; no bloquea el funcionamiento actual.

### P1 — Antes de crecer
- Resolver la estrategia de versionado del esquema de base de datos.
- Revisar limites distribuidos para busqueda, reseñas y reportes.
- Revisar estrategia del service worker/cache.
- Revisar la politica del bucket de imagenes que permite subidas anonimas.

### P2 — Deuda
- Completar la version de tipos compartidos.
- Evaluar pruebas de integracion/UI.
- Revisar pendientes de seguridad y privacidad adicionales documentados en arquitectura.

## Regla de trabajo

No iniciar una nueva funcionalidad solo porque aparezca mencionada como "pendiente" en un documento historico. Primero contrastar con este estado y con el codigo de `main`.

El siguiente bloque de desarrollo debe salir de los pendientes reales y priorizarse por impacto, riesgo y necesidad del producto. Las decisiones de negocio deben pasar por ANALIZA/PROPÓN antes de ejecutar cambios de producto; las correcciones técnicas claras pueden ejecutarse directamente cuando el alcance ya esta definido.
