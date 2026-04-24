// Renderiza un bloque <script type="application/ld+json"> con el payload
// pasado. Usar dentro de <head> o inline en el body (Next lo indexa igual).
// Limpieza: removemos claves con valor undefined para que el JSON quede
// compacto y valido (JSON.stringify ya las omite, pero asi es explicito).

type Props = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
};

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((v) => v !== undefined);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      const cleaned = stripUndefined(v);
      if (cleaned === undefined) continue;
      out[k] = cleaned;
    }
    return out;
  }
  return value;
}

export default function JsonLd({ data, id }: Props) {
  const cleaned = stripUndefined(data);
  // JSON.stringify escapa "<" implicitamente? No: reemplazamos < por \u003c
  // para evitar que un "</" dentro del payload cierre el script prematuramente.
  const json = JSON.stringify(cleaned).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      id={id}
      // El payload es JSON generado por nosotros, no contenido de usuario,
      // asi que es seguro usar dangerouslySetInnerHTML.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
