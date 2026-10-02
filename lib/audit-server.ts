import { supabaseAdmin } from "@/lib/supabase-admin";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export type AuditActorType = "admin_panel" | "signed_link" | "system";

export interface AuditLogInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorType?: AuditActorType;
  userId?: string | null;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string | null;
}

/**
 * Registra una acción administrativa desde servidor.
 *
 * El audit log nunca debe bloquear una operación válida: si la escritura
 * de auditoría falla, se registra el error técnico y la acción original
 * permanece aplicada.
 */
export async function logAuditServer(input: AuditLogInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      user_id: input.userId ?? null,
      actor_type: input.actorType ?? "admin_panel",
      changes: {
        before: input.before ?? {},
        after: input.after ?? {},
      },
      reason: input.reason ?? null,
    });

    if (error) {
      console.error("[audit] No se pudo registrar la acción:", error.message);
    }
  } catch (error) {
    console.error("[audit] Error inesperado al registrar la acción:", error);
  }
}
