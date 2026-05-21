"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-full bg-[#0f172a] text-white text-sm font-bold py-3 hover:opacity-90 transition print:hidden"
    >
      🖨️ Imprimir QR
    </button>
  );
}
