import Link from "next/link";

export const metadata = {
  title: "Terminos y Condiciones - LinaresYa",
  description: "Terminos y condiciones de uso del directorio LinaresYa.",
};

export default function TerminosPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        {"←"} Volver al inicio
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
        Terminos y Condiciones
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Ultima actualizacion: Abril 2026
      </p>

      <div className="prose prose-sm mt-8 space-y-5 text-[14px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-base font-bold mb-1">1. Que es LinaresYa</h2>
          <p>
            LinaresYa es un directorio gratuito de negocios, servicios y oficios
            de la comuna de Linares, Region del Maule, Chile. Su proposito es
            facilitar el contacto entre vecinos y comercios locales.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">
            2. Publicacion de un negocio
          </h2>
          <p>
            Al publicar un negocio el usuario declara que la informacion entregada
            (nombre, direccion, telefono, etc.) es veridica y que tiene derecho
            a representarlo. LinaresYa se reserva el derecho de editar o eliminar
            publicaciones que sean falsas, ofensivas, duplicadas o que contradigan
            estos terminos. La aprobacion no implica respaldo o validacion del
            negocio.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">3. Resenas</h2>
          <p>
            Las resenas son moderadas antes de ser publicadas. Nos reservamos el
            derecho de rechazar resenas con lenguaje ofensivo, contenido falso,
            ataques personales o que no aporten al objetivo del sitio. La opinion
            expresada en una resena es responsabilidad de quien la escribe y no
            de LinaresYa.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">4. Limitacion de responsabilidad</h2>
          <p>
            LinaresYa actua solo como intermediario informativo. No es parte de
            las transacciones, contrataciones o disputas que ocurran entre
            usuarios y los negocios listados. La calidad, disponibilidad y
            cumplimiento de los servicios es responsabilidad exclusiva de cada
            negocio.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">5. Propiedad intelectual</h2>
          <p>
            Las marcas, logos, fotos y descripciones publicadas pertenecen a sus
            respectivos duenios. Al subir contenido a LinaresYa, el publicador
            otorga una licencia no exclusiva para mostrar ese contenido dentro
            del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">6. Modificaciones</h2>
          <p>
            Estos terminos pueden actualizarse en cualquier momento. La version
            vigente sera siempre la publicada en esta pagina.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-1">7. Contacto</h2>
          <p>
            Para reportes, correcciones o eliminacion de un listado, escribir a{" "}
            <a
              href="mailto:infoblack.linares@gmail.com"
              className="font-semibold underline"
            >
              infoblack.linares@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
