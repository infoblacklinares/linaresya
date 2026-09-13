-- =============================================================================
-- LinaresYa - Resultados reportados por el negocio (LY-028)
-- =============================================================================
-- ORDEN: solo AGREGA. Se puede correr antes o despues del deploy.
--
-- Para que: el sitio ya sabe cuantas personas vieron una ficha y cuantas
-- tocaron "Llamar" o "WhatsApp". Lo que no sabe, y es lo unico que el negocio
-- siente, es cuantas de esas personas terminaron comprando. Eso no se puede
-- medir desde el navegador: pasa en el local, por telefono o por WhatsApp.
--
-- Asi que se pregunta. Willson anota lo que el negocio le dice, y el panel
-- muestra las dos columnas lado a lado: lo que el sitio genero y lo que el
-- negocio reconoce haber recibido. Esa comparacion es el argumento de venta de
-- Premium, y tambien la unica forma de saber si el directorio sirve de verdad.
--
-- Es un dato REPORTADO, no medido. El panel lo dice con esas palabras: nadie
-- puede confundirlo con una metrica del sitio.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.resultados_negocio (
  id             BIGSERIAL PRIMARY KEY,
  negocio_id     UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  -- Primer dia del mes al que corresponde lo reportado, en hora de Chile.
  -- Un mes es el periodo mas chico que un negocio puede responder de memoria;
  -- por semana la respuesta seria inventada.
  periodo        DATE NOT NULL,
  -- Cuantas personas lo contactaron por el directorio. NULL = no lo supo decir,
  -- que no es lo mismo que cero.
  consultas      INTEGER CHECK (consultas IS NULL OR consultas >= 0),
  -- De esas, cuantas terminaron comprando.
  clientes       INTEGER CHECK (clientes IS NULL OR clientes >= 0),
  -- Lo que dijo, en sus palabras. Sirve mas que los numeros para vender.
  nota           TEXT CHECK (nota IS NULL OR length(nota) <= 500),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Un solo reporte por negocio y mes: volver a preguntar corrige, no duplica.
  UNIQUE (negocio_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_resultados_negocio_periodo
  ON public.resultados_negocio (periodo DESC);

-- Solo el servidor escribe aca (service role). Sin politicas, la llave publica
-- no entra: son datos comerciales de terceros, no informacion del directorio.
ALTER TABLE public.resultados_negocio ENABLE ROW LEVEL SECURITY;

-- `actualizado_en` al dia sin depender de que el codigo se acuerde.
CREATE OR REPLACE FUNCTION public.tocar_resultados_negocio()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resultados_negocio_actualizado ON public.resultados_negocio;
CREATE TRIGGER trg_resultados_negocio_actualizado
  BEFORE UPDATE ON public.resultados_negocio
  FOR EACH ROW EXECUTE FUNCTION public.tocar_resultados_negocio();
