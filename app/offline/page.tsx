export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#F9F8F6] px-6 text-center">
      {/* Ícono */}
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#2B6E80]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-black text-[#1A1410]">Sin conexión</h1>
        <p className="mt-2 text-sm text-[#6B5E57] leading-relaxed max-w-xs">
          Revisa tu conexión a internet e intenta de nuevo.
          Las páginas que ya visitaste siguen disponibles.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-[#2B6E80] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#235c6c] active:scale-95"
      >
        Reintentar
      </button>
    </main>
  );
}
