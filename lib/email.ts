import { Resend } from "resend";

// Cliente lazy: solo se crea si hay RESEND_API_KEY. Asi en dev local, preview
// deploys, o si te olvidas de setear la env var, el sistema sigue andando sin
// romper nada; simplemente no se envian emails.
let client: Resend | null = null;
function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

// Remitente por defecto: onboarding@resend.dev funciona sin dominio verificado.
// Cuando verifiques linaresya.cl en Resend, cambia esto a algo como
// "LinaresYa <avisos@linaresya.cl>".
const FROM = process.env.RESEND_FROM ?? "LinaresYa <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type NegocioParaNotificar = {
  id: string;
  nombre: string;
  tipo: "negocio" | "independiente";
  descripcion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  categoria_nombre?: string | null;
};

// Notifica al admin que alguien publico un negocio y esta pendiente de aprobacion.
// Fire-and-forget: nunca lanza. Si falla, solo loguea.
export async function sendAdminPublicacionNotification(
  negocio: NegocioParaNotificar,
): Promise<void> {
  try {
    const c = getClient();
    const to = process.env.ADMIN_EMAIL;
    if (!c || !to) {
      // Dev/sin configurar: no enviamos nada, no es error.
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";
    const adminUrl = `${siteUrl}/admin`;

    const subject = `Nuevo ${negocio.tipo === "independiente" ? "independiente" : "negocio"} pendiente: ${negocio.nombre}`;

    const filas: Array<[string, string]> = [];
    filas.push(["Nombre", negocio.nombre]);
    filas.push(["Tipo", negocio.tipo === "independiente" ? "Independiente" : "Negocio"]);
    if (negocio.categoria_nombre) filas.push(["Categoria", negocio.categoria_nombre]);
    if (negocio.telefono) filas.push(["Telefono", negocio.telefono]);
    if (negocio.whatsapp) filas.push(["WhatsApp", `+${negocio.whatsapp}`]);
    if (negocio.direccion) filas.push(["Direccion", negocio.direccion]);
    if (negocio.descripcion) filas.push(["Descripcion", negocio.descripcion]);

    const filasHtml = filas
      .map(
        ([k, v]) => `
          <tr>
            <td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td>
            <td style="padding:8px 12px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(v)}</td>
          </tr>`,
      )
      .join("");

    const html = `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="padding:20px 24px;background:#0f172a;color:#fff;">
      <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.7;">LinaresYa · Admin</p>
      <h1 style="margin:4px 0 0;font-size:20px;font-weight:800;">Nuevo negocio pendiente</h1>
    </div>
    <div style="padding:20px 24px;">
      <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.5;">
        Alguien acaba de publicar <strong>${escapeHtml(negocio.nombre)}</strong> y esta esperando revision.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${filasHtml}
      </table>
      <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;">
        Revisar en el admin
      </a>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Este correo se envio automaticamente al publicarse un negocio en LinaresYa.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `Nuevo negocio pendiente: ${negocio.nombre}\n\n${filas.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nRevisar: ${adminUrl}`;

    const { error } = await c.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend error:", error);
    }
  } catch (err) {
    // Nunca romper el flujo de publicacion por un email fallido.
    console.error("[email] Notificacion admin fallo:", err);
  }
}
