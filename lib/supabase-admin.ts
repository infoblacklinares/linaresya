import { createClient } from "@supabase/supabase-js";

// Cliente privilegiado. SOLO para uso en server actions / route handlers.
// NUNCA importar desde componentes cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Compatibilidad con Preview: algunos entornos aún usan la variable legacy service-role.
// La secret key nueva tiene prioridad cuando está configurada.
const secretKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
