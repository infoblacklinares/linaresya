import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidad - LinaresYa",
  description: "Politica de privacidad y manejo de datos en LinaresYa conforme a la Ley 21.719.",
};

export default function PrivacidadPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        {"←"} Volver al inicio
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
        Politica de Privacidad
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Ultima actualizacion: Julio 2026 · Conforme a la Ley 21.719 de Proteccion de Datos Personales
      </p>

      <div className="prose prose-sm mt-8 space-y-5 text-[14px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-base font-bold mb-1">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recolectados en
            este sitio es LinaresYa (linaresya.cl), contactable en{" "}
            <a href="mailto:infoblack.linares@gmail.com" className="font-semibold underline">
              infoblack.linares@gmail.com
            </a>
            . Ante cualquier consulta, solicitud o reclamo sobre tus datos, ese es
            el canal oficial.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">2. Que datos tratamos, para que y con que base legal</h2>
          <p className="font-semibold mt-2">a) Publicacion de negocios</p>
          <p>
            Datos: nombre del negocio, categoria, descripcion, telefono, WhatsApp,
            email (opcional), direccion, zona de cobertura, horarios y fotos.
            Finalidad: mostrar la ficha publica del negocio para que los vecinos
            puedan contactarlo. Base legal: consentimiento del titular al enviar
            el formulario de publicacion. El email no se publica; se usa solo para
            notificar la aprobacion del negocio.
          </p>
          <p className="font-semibold mt-2">b) Resenas</p>
          <p>
            Datos: nombre del autor, comentario, puntuacion y fecha. Finalidad:
            mostrar opiniones publicas sobre los negocios. Base legal:
            consentimiento del autor al enviar la resena. La direccion IP se usa
            de forma transitoria (no se almacena en forma permanente) solo para
            prevenir spam y abuso.
          </p>
          <p className="font-semibold mt-2">c) Newsletter</p>
          <p>
            Datos: email. Finalidad: enviar un resumen de novedades de Linares.
            Base legal: consentimiento al suscribirte. Puedes darte de baja en
            cualquier momento con el enlace incluido en cada correo, o
            escribiendonos.
          </p>
          <p className="font-semibold mt-2">d) Estadisticas</p>
          <p>
            Registramos contadores anonimos de vistas y clicks por negocio. No
            guardamos IP, identificadores de dispositivo ni ningun dato que
            permita identificar al visitante. Los favoritos se guardan solo en tu
            propio navegador (localStorage) y nunca se envian a nuestros
            servidores.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">3. Plazos de conservacion</h2>
          <p>
            Los datos de un negocio se conservan mientras la ficha este publicada.
            Si pides la eliminacion, se borran de la base de datos. Las resenas se
            conservan mientras la ficha del negocio exista o hasta que su autor
            pida eliminarlas. El email del newsletter se conserva hasta que te des
            de baja.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">4. Encargados y transferencias internacionales</h2>
          <p>
            Usamos proveedores que procesan datos por cuenta nuestra: Supabase
            (base de datos y almacenamiento de fotos), Resend (envio de correos),
            Vercel (hosting) y Cloudflare Turnstile (verificacion anti-bots en
            formularios). Algunos de estos proveedores procesan datos en
            servidores ubicados fuera de Chile (principalmente Estados Unidos y la
            Union Europea), bajo sus propias garantias contractuales de proteccion
            de datos. No vendemos ni cedemos datos personales a terceros con fines
            comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">5. Tus derechos (ARCO y portabilidad)</h2>
          <p>
            De acuerdo con la Ley 21.719, puedes ejercer en cualquier momento tus
            derechos de <strong>acceso</strong> (saber que datos tenemos),{" "}
            <strong>rectificacion</strong> (corregirlos),{" "}
            <strong>supresion</strong> (eliminarlos), <strong>oposicion</strong>{" "}
            (que dejemos de tratarlos) y <strong>portabilidad</strong> (recibirlos
            en formato electronico). Escribenos a{" "}
            <a href="mailto:infoblack.linares@gmail.com" className="font-semibold underline">
              infoblack.linares@gmail.com
            </a>{" "}
            indicando tu solicitud; respondemos dentro de los plazos legales.
          </p>
          <p className="mt-2">
            Si consideras que no dimos respuesta adecuada, tienes derecho a
            reclamar ante la <strong>Agencia de Proteccion de Datos Personales</strong>,
            autoridad creada por la Ley 21.719.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">6. Seguridad y brechas</h2>
          <p>
            Aplicamos medidas razonables de seguridad: acceso restringido a la
            base de datos, credenciales administradas por variables de entorno y
            comunicaciones cifradas (HTTPS). Si ocurriera una brecha de seguridad
            que afecte datos personales, la notificaremos a la autoridad y a los
            titulares afectados conforme a la ley.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">7. Cambios a esta politica</h2>
          <p>
            Si modificamos esta politica veras el cambio reflejado en esta pagina
            con la fecha actualizada arriba. Los cambios sustanciales se
            comunicaran de forma destacada en el sitio.
          </p>
        </section>
      </div>
    </main>
  );
}
