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
    if (!c) {
      console.warn(
        "[email] Salto notificacion admin: falta RESEND_API_KEY en .env.local (recordar reiniciar npm run dev).",
      );
      return;
    }
    if (!to) {
      console.warn(
        "[email] Salto notificacion admin: falta ADMIN_EMAIL en .env.local.",
      );
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

    const { data, error } = await c.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend error (admin):", error);
    } else {
      console.log("[email] Notificacion admin enviada:", { id: data?.id, to });
    }
  } catch (err) {
    // Nunca romper el flujo de publicacion por un email fallido.
    console.error("[email] Notificacion admin fallo:", err);
  }
}

// --- Aprobacion: email al duenio cuando activamos su negocio --------------

export type NegocioAprobado = {
  nombre: string;
  slug: string;
  email: string;
  verificado: boolean;
  categoria: {
    nombre: string;
    slug: string;
    emoji: string;
  };
};

export async function sendOwnerAprobacionNotification(
  negocio: NegocioAprobado,
): Promise<void> {
  try {
    const c = getClient();
    if (!c) {
      console.warn(
        "[email] Salto notificacion duenio: falta RESEND_API_KEY en .env.local.",
      );
      return;
    }
    if (!negocio.email) {
      console.warn(
        "[email] Salto notificacion duenio: el negocio no tiene email cargado.",
      );
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";
    const fichaUrl = `${siteUrl}/${negocio.categoria.slug}/${negocio.slug}`;

    const subject = negocio.verificado
      ? `Tu negocio ya esta publicado y verificado en LinaresYa`
      : `Tu negocio ya esta publicado en LinaresYa`;

    const badge = negocio.verificado
      ? `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;margin-left:8px;">Verificado</span>`
      : "";

    const html = `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="padding:24px;background:#0f172a;color:#fff;">
      <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.7;">LinaresYa · Publicado</p>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;">Tu negocio ya esta en LinaresYa ${escapeHtml(negocio.categoria.emoji)}</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.5;">
        Aprobamos <strong>${escapeHtml(negocio.nombre)}</strong>${badge}. Ya aparece en la categoria
        <strong>${escapeHtml(negocio.categoria.nombre)}</strong> y se puede encontrar desde el buscador.
      </p>
      <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Tu ficha publica</p>
        <a href="${escapeHtml(fichaUrl)}" style="color:#0f172a;font-size:15px;font-weight:600;word-break:break-all;">${escapeHtml(fichaUrl)}</a>
      </div>
      <div style="margin:24px 0;">
        <a href="${escapeHtml(fichaUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;">
          Ver mi ficha
        </a>
      </div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">Que hacer ahora</p>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
          <li>Compartir el link por WhatsApp con tus clientes: llega con una tarjeta con tu nombre y categoria.</li>
          <li>Si queres cambiar datos (horarios, descripcion, foto), escribinos y lo editamos.</li>
          <li>Pedir a clientes contentos que dejen una resena cuando habilitemos resenas publicas.</li>
        </ul>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Recibiste este correo porque publicaste tu negocio en LinaresYa.cl
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `Tu negocio "${negocio.nombre}" ya esta publicado en LinaresYa${negocio.verificado ? " (verificado)" : ""}.\n\nTu ficha publica: ${fichaUrl}\n\nCompartila por WhatsApp para que te encuentren.`;

    const { data, error } = await c.emails.send({
      from: FROM,
      to: negocio.email,
      subject,
      html,
      text,
    });

    if (error) {
      // Resend en plan free sin dominio verificado solo acepta enviar al
      // email de la cuenta. Lo detectamos para mostrar un warning amigable
      // en vez de un error rojo que asusta.
      const errMsg = String((error as { message?: unknown }).message ?? "");
      const errStatus = (error as { statusCode?: number }).statusCode;
      const esLimiteFree =
        errStatus === 403 || /testing emails|verify a domain/i.test(errMsg);
      if (esLimiteFree) {
        console.warn(
          `[email] Resend rechazo enviar a ${negocio.email} porque el dominio no esta verificado. ` +
            `Verificar linaresya.cl en https://resend.com/domains o usar un email coincidente con la cuenta Resend.`,
        );
      } else {
        console.error("[email] Resend error (aprobacion):", error);
      }
    } else {
      console.log("[email] Notificacion duenio enviada:", {
        id: data?.id,
        to: negocio.email,
      });
    }
  } catch (err) {
    console.error("[email] Notificacion duenio fallo:", err);
  }
}

// Envia un magic link al duenio para que pueda editar su negocio.
// Devuelve true si el envio salio bien, false si fallo o no esta configurado.
// Devuelve true incluso si Resend no esta configurado (modo dev), para que la
// UI no se rompa: el server log avisa que no se envio nada.
export async function sendDuenoMagicLink(opts: {
  to: string;
  nombreNegocio: string;
  link: string;
  expiraHoras: number;
}): Promise<boolean> {
  try {
    const c = getClient();
    if (!c) {
      console.warn(
        "[email] Salto magic link: falta RESEND_API_KEY. Link generado:",
        opts.link,
      );
      return false;
    }

    const nombreEsc = escapeHtml(opts.nombreNegocio);
    const linkEsc = escapeHtml(opts.link);
    const subject = `Editar tu negocio en LinaresYa: ${opts.nombreNegocio}`;

    const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="padding:24px;background:#0f172a;color:#fff;">
      <h1 style="margin:0;font-size:18px;font-weight:800;">LinaresYa</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.85;">Editar tu negocio</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
        Solicitaste editar tu negocio <strong>${nombreEsc}</strong> en LinaresYa.
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
        Hacé click en el botón de abajo para acceder al editor. El link es valido por ${opts.expiraHoras} horas.
      </p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${linkEsc}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">
          Editar mi negocio
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
        O copia este link en tu navegador:
      </p>
      <p style="margin:0;font-size:12px;color:#475569;word-break:break-all;">
        ${linkEsc}
      </p>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Si vos no pediste este link, podes ignorar este correo. Nadie podra editar tu negocio sin acceso a este email.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `Solicitaste editar tu negocio "${opts.nombreNegocio}" en LinaresYa.\n\nLink al editor (valido por ${opts.expiraHoras} hs):\n${opts.link}\n\nSi no pediste este link, ignoralo.`;

    const { data, error } = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Magic link Resend error:", error);
      return false;
    }
    console.log("[email] Magic link enviado:", { id: data?.id, to: opts.to });
    return true;
  } catch (err) {
    console.error("[email] Magic link fallo:", err);
    return false;
  }
}
