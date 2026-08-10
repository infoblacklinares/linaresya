import Link from "next/link";
import SplashDemoCliente from "./SplashDemoCliente";

export const metadata = {
  title: "Demo del splash animado - LinaresYa",
  robots: { index: false, follow: false },
};

export default function SplashDemoPage() {
  return (
    <main className="flex-1 w-full bg-[#F9F8F6]">
      <div className="mx-auto w-full max-w-2xl lg:max-w-4xl px-4 py-8 pb-24">
        <Link href="/" className="text-xs font-semibold text-[#8E8279] hover:text-[#1A1410]">
          ← Volver al inicio
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1A1410]">
          Demo del splash animado
        </h1>
        <p className="mt-1 text-sm text-[#8E8279] mb-6">
          Página de prueba. No está enlazada desde el sitio ni la indexa Google.
          Sirve para decidir si el splash va o no en la portada.
        </p>

        <SplashDemoCliente />

        <div className="mt-8 rounded-2xl bg-white border border-[#E8E4DE] p-5">
          <h2 className="text-sm font-bold text-[#1A1410]">Qué estás viendo</h2>
          <ul className="mt-2 space-y-1 text-[13px] text-[#6B5E57] leading-relaxed">
            <li>· El pin cae con rebote y escala de 0.6 a 1</li>
            <li>· Aparece la sombra bajo el pin y crece</li>
            <li>· Sale un anillo de impacto que se expande y desvanece</li>
            <li>· El pin queda respirando suavemente</li>
            <li>· El logotipo salta desde abajo</li>
          </ul>
          <p className="mt-3 text-[12px] text-[#8E8279]">
            Duración total: 3 segundos. Si el visitante tiene activado
            &quot;reducir movimiento&quot; en su sistema, se muestra el resultado
            final sin animación.
          </p>
        </div>
      </div>
    </main>
  );
}
