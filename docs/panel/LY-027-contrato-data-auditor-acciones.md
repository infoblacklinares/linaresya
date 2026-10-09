# LY-027 — Contrato de acciones del Data Auditor

- **Prioridad:** P1
- **Fecha:** 2026-10-09
- **Depende de:** UX-06.28.x (cola de calidad + diagnóstico centralizado) y LY-026 (flujo administrativo)
- **Estado:** Diseñado — sin cambio de comportamiento todavía
- **Siguiente tarea:** UX-06.36.2 — adaptar Data Auditor para emitir acciones estructuradas

## Objetivo

Convertir un hallazgo del Data Auditor en una instrucción operativa trazable:

`hallazgo → acción → sección de edición → corrección → reevaluación`

La cola de calidad no debe intentar adivinar qué parte del formulario corresponde a un `rule` o a un mensaje textual.

## Contrato actual

El feed que consume LinaresYa actualmente contiene:

- `business_id`
- `business_name` (opcional)
- `rule`
- `severity`
- `message`
- `generated_at`

El Data Auditor documenta que su exportación es de solo lectura y que actualmente no incluye instrucciones de corrección ni valores propuestos.

## Contrato propuesto v1

Cada hallazgo podrá incorporar un campo opcional:

```json
{
  "action": {
    "section": "basico",
    "field": "descripcion",
    "label": "Revisar descripción"
  }
}
```

### Valores permitidos para `section`

| Section | Uso |
|---|---|
| `basico` | nombre, descripción, categoría y datos básicos |
| `contacto` | teléfono / WhatsApp |
| `ubicacion` | dirección, coordenadas y cobertura |
| `horarios` | horarios de atención |
| `fotografias` | portada y galería |

### Campos

- `section`: obligatorio cuando existe `action`; determina el bloque de edición.
- `field`: opcional; identifica el campo concreto cuando sea útil.
- `label`: obligatorio; texto corto para explicar al administrador qué revisar.

La acción **no** debe contener valores inventados ni instrucciones para modificar automáticamente una ficha.

## Compatibilidad

`action` será opcional para mantener compatibilidad con feeds antiguos.

Si llega un hallazgo sin `action`:

1. LinaresYa lo seguirá mostrando.
2. No debe fallar la cola de calidad.
3. El botón de corrección usará el comportamiento de respaldo existente.
4. No se inferirá una sección a partir de texto libre del hallazgo.

Si `action.section` es inválido, el hallazgo debe considerarse inválido para acción estructurada y conservarse como hallazgo visible, sin romper la cola.

## Principio de responsabilidad

El **Data Auditor decide qué encontró y qué sección debe revisarse** porque conoce la regla que produjo el hallazgo.

LinaresYa decide **cómo presentar y ejecutar esa acción** dentro de su interfaz.

Esto evita duplicar en LinaresYa un mapa frágil del tipo:

`rule/message → sección`

## Flujo objetivo

1. Data Auditor detecta un problema.
2. Data Auditor genera `rule + severity + message + action`.
3. El feed publica el hallazgo.
4. LinaresYa lo valida.
5. La cola de calidad muestra el hallazgo y su acción.
6. `Corregir` abre directamente la ficha en `action.section`.
7. El administrador corrige y guarda.
8. LinaresYa redirige a la reevaluación.
9. En una nueva auditoría, el hallazgo desaparece si la condición ya no existe.

## Reglas iniciales de acción

El contrato no fija todavía un mapa completo de reglas porque debe derivarse del código real del Data Auditor antes de implementarlo.

Como caso ya documentado por el auditor:

- `LOCATION_NOT_ACTIONABLE` → `ubicacion` → **Solicitar ubicación verificable**.

No se deben inventar acciones para reglas que todavía no hayan sido verificadas en el repositorio del Data Auditor.

## Criterios de aceptación

- [x] Contrato propuesto documentado.
- [x] Secciones permitidas definidas.
- [x] Compatibilidad con feeds antiguos definida.
- [x] Fallback para acciones inválidas definido.
- [x] Responsabilidad Data Auditor/LinaresYa separada.
- [ ] Reglas reales del Data Auditor mapeadas una por una.
- [ ] Data Auditor emite `action`.
- [ ] LinaresYa valida y consume `action`.
- [ ] Cola de calidad usa `action.section`.
- [ ] Flujo corrección → reevaluación probado de extremo a extremo.

## Fuera de alcance

- Corrección automática de datos.
- Inferencia de valores faltantes.
- Escritura automática en LinaresYa desde el auditor.
- Cambios en la lógica de auditoría que no sean necesarios para emitir la acción.
