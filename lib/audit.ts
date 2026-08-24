import { supabase } from './supabase';

interface AuditLogInput {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  userId?: string;
  userIp?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
}

/**
 * Registra un cambio en el audit log
 * Uso:
 *   await logAudit({
 *     action: 'UPDATE',
 *     entityType: 'negocios',
 *     entityId: negocio.id,
 *     userId: user.id,
 *     before: oldData,
 *     after: newData,
 *     reason: 'Admin update'
 *   });
 */
export async function logAudit(input: AuditLogInput) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        user_id: input.userId,
        user_ip: input.userIp,
        changes: {
          before: input.before || {},
          after: input.after || {},
        },
        reason: input.reason,
      });

    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (err) {
    console.error('Failed to log audit:', err);
    // No fallar la operación si falla el logging
  }
}

/**
 * Obtiene alertas de actividad sospechosa no resueltas
 */
export async function getUnresolvedAlerts() {
  const { data, error } = await supabase
    .from('audit_alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching alerts:', error);
  return data || [];
}

/**
 * Marca una alerta como resuelta
 */
export async function resolveAlert(alertId: string) {
  const { error } = await supabase
    .from('audit_alerts')
    .update({ resolved: true, resolved_at: new Date() })
    .eq('id', alertId);

  if (error) console.error('Error resolving alert:', error);
}
