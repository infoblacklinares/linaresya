import { createClient } from "@supabase/supabase-js";

// Cliente con service role key. SOLO para uso en server actions / route handlers.
// NUNCA importar desde componentes cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
