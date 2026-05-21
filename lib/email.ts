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

// Dominio linaresya.cl verificado en Resend → enviamos desde avisos@linaresya.cl.
const FROM = process.env.RESEND_FROM ?? "LinaresYa <avisos@linaresya.cl>";

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
  // Links personalizados opcionales (generados con magic link)
  editarUrl?: string;
  statsUrl?: string;
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

    const editarUrl = negocio.editarUrl ? escapeHtml(negocio.editarUrl) : null;
    const statsUrl  = negocio.statsUrl  ? escapeHtml(negocio.statsUrl)  : null;

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
      <div style="margin:24px 0;display:flex;flex-wrap:wrap;gap:10px;">
        <a href="${escapeHtml(fichaUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;">
          Ver mi ficha →
        </a>
        ${statsUrl ? `<a href="${statsUrl}" style="display:inline-block;background:#fff;color:#0f172a;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;border:1.5px solid #e2e8f0;">
          📊 Mis estadísticas
        </a>` : ""}
        ${editarUrl ? `<a href="${editarUrl}" style="display:inline-block;background:#f8fafc;color:#0f172a;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;border:1.5px solid #e2e8f0;">
          ✏️ Editar mi negocio
        </a>` : ""}
      </div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">Que hacer ahora</p>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
          <li>Compartir el link por WhatsApp con tus clientes: llega con una tarjeta con tu nombre y categoria.</li>
          <li>Actualiza horarios, descripcion y foto desde "Editar mi negocio" (el link caduca en 24 hs, podés pedir uno nuevo cuando quieras).</li>
          <li>Mostrá el código QR en tu mostrador para que los clientes te dejen reseñas fácil.</li>
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

// Resumen semanal automatico al admin (vercel cron job).
export type WeeklyDigestData = {
  semanaInicio: string; // ISO date
  semanaFin: string;
  nuevosNegocios: number;
  nuevasResenas: number;
  reportesPendientes: number;
  pendientesAprobacion: number;
  totalVistas: number;
  totalClicks: number;
  topVistos: Array<{
    nombre: string;
    fichaUrl: string;
    vistas: number;
    clicks: number;
  }>;
};

export async function sendWeeklyDigest(
  data: WeeklyDigestData,
): Promise<boolean> {
  try {
    const c = getClient();
    const to = process.env.ADMIN_EMAIL;
    if (!c || !to) {
      console.warn(
        "[email] Salto weekly digest: falta RESEND_API_KEY o ADMIN_EMAIL.",
      );
      return false;
    }

    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
      });

    const subject = `LinaresYa semanal: ${data.nuevosNegocios} nuevos, ${data.totalVistas} vistas`;

    const topItems = data.topVistos
      .map(
        (t, i) => `
          <tr>
            <td style="padding:8px 0;border-top:1px solid #f1f5f9;font-size:13px;color:#94a3b8;width:24px;">${i + 1}</td>
            <td style="padding:8px 0;border-top:1px solid #f1f5f9;font-size:13px;">
              <a href="${escapeHtml(t.fichaUrl)}" style="color:#0f172a;text-decoration:none;font-weight:600;">${escapeHtml(t.nombre)}</a>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${t.vistas} vistas · ${t.clicks} clicks</div>
            </td>
          </tr>`,
      )
      .join("");

    const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="padding:24px;background:#0f172a;color:#fff;">
      <h1 style="margin:0;font-size:18px;font-weight:800;">LinaresYa semanal</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.85;">${fmt(data.semanaInicio)} – ${fmt(data.semanaFin)}</p>
    </div>

    <div style="padding:24px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:0 8px 8px 0;width:50%;">
            <div style="background:#f8fafc;border-radius:12px;padding:14px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Nuevos negocios</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:800;">${data.nuevosNegocios}</p>
            </div>
          </td>
          <td style="padding:0 0 8px 8px;width:50%;">
            <div style="background:#f8fafc;border-radius:12px;padding:14px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Nuevas resenas</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:800;">${data.nuevasResenas}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 8px 0 0;width:50%;">
            <div style="background:#f8fafc;border-radius:12px;padding:14px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Vistas totales</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:800;">${data.totalVistas}</p>
            </div>
          </td>
          <td style="padding:8px 0 0 8px;width:50%;">
            <div style="background:#f8fafc;border-radius:12px;padding:14px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Clicks totales</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:800;">${data.totalClicks}</p>
            </div>
          </td>
        </tr>
      </table>

      ${
        data.pendientesAprobacion > 0 || data.reportesPendientes > 0
          ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#78350f;">Pendiente de tu accion:</p>
              <ul style="margin:6px 0 0;padding-left:20px;font-size:13px;color:#78350f;">
                ${data.pendientesAprobacion > 0 ? `<li>${data.pendientesAprobacion} negocio${data.pendientesAprobacion === 1 ? "" : "s"} esperando aprobacion</li>` : ""}
                ${data.reportesPendientes > 0 ? `<li>${data.reportesPendientes} reporte${data.reportesPendientes === 1 ? "" : "s"} sin resolver</li>` : ""}
              </ul>
            </div>`
          : ""
      }

      ${
        topItems
          ? `<div>
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;">Top 5 mas vistos esta semana</p>
              <table width="100%" cellspacing="0" cellpadding="0">${topItems}</table>
            </div>`
          : '<p style="margin:0;text-align:center;color:#94a3b8;font-size:13px;padding:20px 0;">Sin actividad esta semana.</p>'
      }

      <div style="margin-top:28px;text-align:center;">
        <a href="https://linaresya.cl/admin" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">
          Ir al admin
        </a>
      </div>
    </div>

    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">
        Este resumen se envia cada lunes. Si no lo queres recibir, eliminalo de la lista de cron en Vercel.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `LinaresYa semanal (${fmt(data.semanaInicio)} - ${fmt(data.semanaFin)})\n\nNuevos negocios: ${data.nuevosNegocios}\nNuevas resenas: ${data.nuevasResenas}\nVistas: ${data.totalVistas}\nClicks: ${data.totalClicks}\n\n${data.pendientesAprobacion ? `Pendiente: ${data.pendientesAprobacion} aprobaciones, ${data.reportesPendientes} reportes\n\n` : ""}Top: ${data.topVistos.map((t) => `${t.nombre} (${t.vistas})`).join(", ")}\n\nAdmin: https://linaresya.cl/admin`;

    const { error } = await c.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] Weekly digest error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Weekly digest fallo:", err);
    return false;
  }
}

// Notifica al admin que un usuario reporto un negocio.
// Fire-and-forget: no rompe el flujo si Resend falla.
const MOTIVO_LABELS: Record<string, string> = {
  info_incorrecta: "Info incorrecta",
  duplicado: "Duplicado",
  cerrado_definitivo: "Cerrado definitivamente",
  no_existe: "No existe",
  spam_o_falso: "Spam o informacion falsa",
  contenido_inapropiado: "Contenido inapropiado",
  otro: "Otro",
};

export async function sendAdminReporteNotification(opts: {
  nombreNegocio: string;
  motivo: string;
  descripcion: string | null;
  fichaUrl: string;
  adminEditUrl: string;
}): Promise<void> {
  try {
    const c = getClient();
    const to = process.env.ADMIN_EMAIL;
    if (!c || !to) {
      console.warn(
        "[email] Salto notif reporte: falta RESEND_API_KEY o ADMIN_EMAIL.",
      );
      return;
    }

    const motivoLabel = MOTIVO_LABELS[opts.motivo] ?? opts.motivo;
    const subject = `Reporte: ${opts.nombreNegocio} - ${motivoLabel}`;
    const nombreEsc = escapeHtml(opts.nombreNegocio);
    const motivoEsc = escapeHtml(motivoLabel);
    const descEsc = opts.descripcion ? escapeHtml(opts.descripcion) : "";
    const fichaEsc = escapeHtml(opts.fichaUrl);
    const adminEsc = escapeHtml(opts.adminEditUrl);

    const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="padding:24px;background:#fef2f2;color:#991b1b;border-bottom:1px solid #fecaca;">
      <h1 style="margin:0;font-size:18px;font-weight:800;">Reporte recibido</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.85;">${motivoEsc}</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        Alguien reporto el negocio <strong>${nombreEsc}</strong>.
      </p>
      ${descEsc
        ? `<div style="margin:12px 0;padding:12px;background:#f8fafc;border-radius:8px;border-left:3px solid #94a3b8;">
            <p style="margin:0;font-size:13px;color:#64748b;font-style:italic;white-space:pre-line;">${descEsc}</p>
          </div>`
        : '<p style="margin:0 0 12px;font-size:13px;color:#94a3b8;">Sin descripcion adicional.</p>'}
      <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">
        <a href="${fichaEsc}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;">
          Ver ficha publica
        </a>
        <a href="${adminEsc}" style="display:inline-block;background:#fff;color:#0f172a;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;border:1px solid #e2e8f0;">
          Editar / desactivar
        </a>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Tip: si el reporte es valido, podes desactivar el negocio temporalmente desde el admin hasta validar.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `Reporte de negocio: ${opts.nombreNegocio}\nMotivo: ${motivoLabel}\n${opts.descripcion ? `\nDescripcion: ${opts.descripcion}\n` : ""}\nFicha: ${opts.fichaUrl}\nEditar: ${opts.adminEditUrl}`;

    const { error } = await c.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) console.error("[email] Notif reporte error:", error);
  } catch (err) {
    console.error("[email] Notif reporte fallo:", err);
  }
}

// Notifica al admin que un dueno edito su negocio via magic link.
// Fire-and-forget: no rompe el flujo del save si Resend falla.
export async function sendAdminEdicionDuenoNotification(opts: {
  nombreNegocio: string;
  emailDueno: string;
  fichaUrl: string;
  adminEditUrl: string;
  cambios?: string[];
}): Promise<void> {
  try {
    const c = getClient();
    const to = process.env.ADMIN_EMAIL;
    if (!c || !to) {
      console.warn(
        "[email] Salto notif admin edicion dueno: falta RESEND_API_KEY o ADMIN_EMAIL.",
      );
      return;
    }

    const nombreEsc = escapeHtml(opts.nombreNegocio);
    const emailEsc = escapeHtml(opts.emailDueno);
    const fichaEsc = escapeHtml(opts.fichaUrl);
    const adminEsc = escapeHtml(opts.adminEditUrl);
    const cambiosHtml =
      opts.cambios && opts.cambios.length > 0
        ? `<ul style="margin:12px 0 0;padding-left:20px;color:#475569;font-size:13px;line-height:1.6;">${opts.cambios.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
        : "";

    const subject = `Edicion de dueno: ${opts.nombreNegocio}`;

    const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="padding:24px;background:#0f172a;color:#fff;">
      <h1 style="margin:0;font-size:18px;font-weight:800;">LinaresYa Admin</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:.85;">Edicion de dueno</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        El dueno de <strong>${nombreEsc}</strong> edito su negocio.
      </p>
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Email usado para el magic link:</p>
      <p style="margin:0 0 16px;font-size:14px;"><a href="mailto:${emailEsc}" style="color:#0f172a;">${emailEsc}</a></p>
      ${cambiosHtml ? `<p style="margin:16px 0 0;font-size:13px;font-weight:700;color:#0f172a;">Campos modificados:</p>${cambiosHtml}` : ""}
      <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">
        <a href="${fichaEsc}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;">
          Ver ficha publica
        </a>
        <a href="${adminEsc}" style="display:inline-block;background:#fff;color:#0f172a;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;border:1px solid #e2e8f0;">
          Editar como admin
        </a>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Si la edicion te parece sospechosa, podes desactivar el negocio o revertir cambios desde el admin.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `El dueno de "${opts.nombreNegocio}" (${opts.emailDueno}) edito su negocio.\n\nFicha publica: ${opts.fichaUrl}\nAdmin edit: ${opts.adminEditUrl}`;

    const { error } = await c.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] Notif edit dueno error:", error);
    }
  } catch (err) {
    console.error("[email] Notif edit dueno fallo:", err);
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

// ── Notificación admin: nueva reseña pendiente de aprobación ────────────────

export async function sendAdminNuevaResenaNotification(opts: {
  negocioNombre: string;
  negocioId: string;
  autorNombre: string;
  estrellas: number;
  comentario: string | null;
}): Promise<void> {
  try {
    const c = getClient();
    const to = process.env.ADMIN_EMAIL;
    if (!c || !to) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";
    const adminUrl = `${siteUrl}/admin/resenas`;
    const estrellasTxt = "⭐".repeat(Math.min(5, Math.max(1, opts.estrellas)));

    const html = `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="padding:20px 24px;background:#0f172a;color:#fff;">
      <p style="margin:0;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.6;">LinaresYa · Moderación</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:800;">Nueva reseña pendiente</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Negocio</p>
      <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(opts.negocioNombre)}</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:18px;">${estrellasTxt}</p>
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#334155;">${escapeHtml(opts.autorNombre)}</p>
        ${opts.comentario ? `<p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">${escapeHtml(opts.comentario)}</p>` : `<p style="margin:0;font-size:13px;color:#94a3b8;font-style:italic;">Sin comentario</p>`}
      </div>
      <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;">
        Aprobar o rechazar →
      </a>
    </div>
    <div style="padding:12px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">LinaresYa · Panel de administración</p>
    </div>
  </div>
</body>
</html>`;

    const text = `Nueva reseña pendiente en LinaresYa\n\nNegocio: ${opts.negocioNombre}\nAutor: ${opts.autorNombre}\nEstrellas: ${opts.estrellas}/5\nComentario: ${opts.comentario ?? "(sin comentario)"}\n\nAprobar o rechazar: ${adminUrl}`;

    await c.emails.send({ from: FROM, to, subject: `Nueva reseña: ${opts.negocioNombre} (${opts.estrellas}⭐)`, html, text });
  } catch (err) {
    console.error("[email] sendAdminNuevaResenaNotification fallo:", err);
  }
}

// ── Notificación dueño: su reseña fue aprobada ──────────────────────────────

export async function sendOwnerResenaAprobadaNotification(opts: {
  ownerEmail: string;
  negocioNombre: string;
  categoriaSlug: string;
  negocioSlug: string;
  autorNombre: string;
  estrellas: number;
  comentario: string | null;
}): Promise<void> {
  try {
    const c = getClient();
    if (!c) return;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://linaresya.cl";
    const fichaUrl = `${siteUrl}/${opts.categoriaSlug}/${opts.negocioSlug}`;
    const premiumUrl = `${siteUrl}/premium`;
    const estrellasTxt = "⭐".repeat(Math.min(5, Math.max(1, opts.estrellas)));
    const esAlta = opts.estrellas >= 4;

    const html = `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="padding:20px 24px;background:${esAlta ? "#064e3b" : "#1e293b"};color:#fff;">
      <p style="margin:0;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.6;">LinaresYa · Nueva reseña</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:800;">${esAlta ? "¡Nueva reseña positiva! 🎉" : "Recibiste una reseña nueva"}</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.5;">
        Alguien dejó una reseña en <strong>${escapeHtml(opts.negocioNombre)}</strong> en LinaresYa.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:20px;">${estrellasTxt}</p>
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#334155;">${escapeHtml(opts.autorNombre)}</p>
        ${opts.comentario ? `<p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">"${escapeHtml(opts.comentario)}"</p>` : `<p style="margin:0;font-size:13px;color:#94a3b8;font-style:italic;">Sin comentario</p>`}
      </div>
      <a href="${escapeHtml(fichaUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;margin-right:8px;">
        Ver mi ficha →
      </a>
      <div style="margin-top:20px;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">¿Querés aparecer primero en búsquedas?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#78350f;">Con Plan Premium activás WhatsApp directo, subís fotos y aparecés destacado. Desde $5.990/mes.</p>
        <a href="${escapeHtml(premiumUrl)}" style="font-size:13px;font-weight:600;color:#b45309;text-decoration:underline;">Ver Plan Premium →</a>
      </div>
    </div>
    <div style="padding:12px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">Recibiste este email porque tenés un negocio publicado en LinaresYa.cl</p>
    </div>
  </div>
</body>
</html>`;

    const text = `${opts.negocioNombre} recibió una reseña nueva en LinaresYa\n\n${opts.autorNombre}: ${opts.estrellas}/5 estrellas\n${opts.comentario ?? "(sin comentario)"}\n\nVer tu ficha: ${fichaUrl}`;

    await c.emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: `${estrellasTxt} Nueva reseña en ${opts.negocioNombre}`,
      html,
      text,
    });
  } catch (err) {
    console.error("[email] sendOwnerResenaAprobadaNotification fallo:", err);
  }
}
