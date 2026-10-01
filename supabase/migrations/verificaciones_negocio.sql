-- Historial de verificación humana de fichas.
-- No reemplaza negocios.verificado: registra la evidencia y decisión que sustentan cada revisión.

CREATE TABLE IF NOT EXISTS public.verificaciones_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  estado TEXT NOT NULL CHECK (estado IN ('verificado', 'pendiente', 'no_verificado')),
  fuente TEXT NOT NULL CHECK (
    fuente IN (
      'google_maps',
      'sitio_web',
      'instagram',
      'facebook',
      'directorio_empresarial',
      'otra_fuente_publica'
    )
  ),
  url_fuente TEXT,
  evidencia TEXT NOT NULL,
  coincide_nombre BOOLEAN,
  coincide_direccion BOOLEAN,
  coincide_telefono BOOLEAN,
  observacion TEXT,
  verificado_por UUID,
  verificado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verificaciones_negocio_negocio
  ON public.verificaciones_negocio(negocio_id, verificado_en DESC);

CREATE INDEX IF NOT EXISTS idx_verificaciones_negocio_estado
  ON public.verificaciones_negocio(estado, verificado_en DESC);

ALTER TABLE public.verificaciones_negocio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verificaciones_negocio_admin_only"
  ON public.verificaciones_negocio
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
