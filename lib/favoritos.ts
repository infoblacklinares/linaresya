// Helpers para manejar favoritos en localStorage. Estado solo cliente.
// Custom event "favoritos-changed" se dispara en cada cambio para que multiples
// componentes (corazon en card y en ficha) queden sincronizados sin re-render
// completo de la pagina.

const KEY = "linaresya_favoritos";
const EVENT = "favoritos-changed";

function safeRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function safeWrite(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // sin permiso de localStorage, ignoramos
  }
}

export function getFavoritos(): string[] {
  return safeRead();
}

export function isFavorito(id: string): boolean {
  return safeRead().includes(id);
}

export function addFavorito(id: string): void {
  const arr = safeRead();
  if (arr.includes(id)) return;
  arr.unshift(id);
  safeWrite(arr);
}

export function removeFavorito(id: string): void {
  const arr = safeRead().filter((x) => x !== id);
  safeWrite(arr);
}

export function toggleFavorito(id: string): boolean {
  if (isFavorito(id)) {
    removeFavorito(id);
    return false;
  }
  addFavorito(id);
  return true;
}

// Suscripcion al evento de cambios. Devuelve una funcion para desuscribir.
export function onFavoritosChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const wrapped = () => handler();
  window.addEventListener(EVENT, wrapped);
  // Tambien escuchamos cambios en otras pestañas via storage event
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) handler();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, wrapped);
    window.removeEventListener("storage", storageHandler);
  };
}
