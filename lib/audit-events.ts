import type { AuditAction } from "@/lib/audit-server";

export type AuditEntityType =
  | "negocios"
  | "resenas"
  | "reportes"
  | "resultados_negocio";

export type AuditEvent =
  | "negocio.aprobar"
  | "negocio.verificar"
  | "negocio.editar"
  | "negocio.desactivar"
  | "negocio.eliminar"
  | "negocio.activar_premium"
  | "negocio.quitar_premium"
  | "resena.aprobar"
  | "resena.rechazar"
  | "resena.vecino_verificado"
  | "reporte.resolver"
  | "reporte.eliminar"
  | "resultado.guardar"
  | "resultado.eliminar";

type AuditDefinition = {
  action: AuditAction;
  entityType: AuditEntityType;
};

export const AUDIT_EVENTS: Record<AuditEvent, AuditDefinition> = {
  "negocio.aprobar": { action: "UPDATE", entityType: "negocios" },
  "negocio.verificar": { action: "UPDATE", entityType: "negocios" },
  "negocio.editar": { action: "UPDATE", entityType: "negocios" },
  "negocio.desactivar": { action: "UPDATE", entityType: "negocios" },
  "negocio.eliminar": { action: "DELETE", entityType: "negocios" },
  "negocio.activar_premium": { action: "UPDATE", entityType: "negocios" },
  "negocio.quitar_premium": { action: "UPDATE", entityType: "negocios" },

  "resena.aprobar": { action: "UPDATE", entityType: "resenas" },
  "resena.rechazar": { action: "DELETE", entityType: "resenas" },
  "resena.vecino_verificado": { action: "UPDATE", entityType: "resenas" },

  "reporte.resolver": { action: "UPDATE", entityType: "reportes" },
  "reporte.eliminar": { action: "DELETE", entityType: "reportes" },

  "resultado.guardar": { action: "UPDATE", entityType: "resultados_negocio" },
  "resultado.eliminar": { action: "DELETE", entityType: "resultados_negocio" },
};

/**
 * Solo se auditan campos que explican el cambio administrativo.
 * No se registran tokens, contraseñas, IP ni snapshots completos.
 */
export const AUDITABLE_NEGOCIO_FIELDS = [
  "activo",
  "verificado",
  "plan",
  "premium_desde",
  "premium_hasta",
  "nombre",
  "categoria_id",
  "descripcion",
  "telefono",
  "whatsapp",
  "email",
  "sitio_web",
  "instagram",
  "facebook",
  "direccion",
  "lat",
  "lng",
  "a_domicilio",
  "zona_cobertura",
  "disponibilidad",
  "foto_portada",
] as const;

export function getAuditDefinition(event: AuditEvent): AuditDefinition {
  return AUDIT_EVENTS[event];
}
