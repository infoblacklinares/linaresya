import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidad - LinaresYa",
  description: "Politica de privacidad y manejo de datos en LinaresYa.",
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
        Ultima actualizacion: Abril 2026
      </p>

      <div className="prose prose-sm mt-8 space-y-5 text-[14px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-base font-bold mb-1">1. Que datos recolectamos</h2>
          <p>
            Cuando publicas un negocio guardamos: nombre del negocio, categoria,
            descripcion, telefono, WhatsApp, email (si lo entregas), direccion,
            zona de cobertura, horarios y fotos. Esa informacion se publica en
            la ficha del negocio para que los vecinos puedan contactarte.
          </p>
          <p className="mt-2">
            Cuando dejas una resena guardamos: tu nombre y comentario, junto con
            la fecha. Tambien guardamos la IP del solicitante de forma temporal
            para evitar spam.
          </p>
          <p className="mt-2">
            Para estadisticas anonimas registramos cuantas vistas y clicks tiene
            cada negocio. No asociamos esa informacion a ningun usuario
            identificable.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">2. Para que usamos los datos</h2>
          <p>
            Los datos del negocio se muestran publicamente en su ficha. El email,
            si lo proveiste, se usa solo para notificarte cuando aprobamos tu
            negocio. No lo vendemos ni lo compartimos con terceros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">3. Cookies y tecnicas similares</h2>
          <p>
            Usamos Cloudflare Turnstile para evitar bots en el formulario de
            publicacion. Cloudflare recibe informacion tecnica del navegador
            (no personal) para hacer esa verificacion.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">4. Quien recibe los datos</h2>
          <p>
            Los datos se almacenan en Supabase (proveedor de base de datos) y
            las fotos se sirven desde Supabase Storage. El correo de aprobacion
            se envia con Resend. Estos servicios pueden procesar datos para los
            fines tecnicos del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">5. Tus derechos</h2>
          <p>
            Podes pedir en cualquier momento que actualicemos o eliminemos los
            datos de tu negocio escribiendonos a{" "}
            <a
              href="mailto:infoblack.linares@gmail.com"
              className="font-semibold underline"
            >
              infoblack.linares@gmail.com
            </a>
            . Tambien podes pedir la eliminacion de una resena si crees que
            te perjudica injustamente; cada caso se evalua individualmente.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">6. Cambios a esta politica</h2>
          <p>
            Si modificamos esta politica vas a ver el cambio reflejado en esta
            pagina con la fecha actualizada arriba.
          </p>
        </section>
      </div>
    </main>
  );
}
