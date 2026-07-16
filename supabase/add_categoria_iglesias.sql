-- Agrega la categoría "Iglesias y Religión" al directorio LinaresYa
-- Ejecutar en Supabase SQL Editor

INSERT INTO categorias (nombre, slug, emoji, descripcion, activa, orden)
VALUES (
  'Iglesias y Religión',
  'iglesias',
  '⛪',
  'Iglesias, parroquias, templos, comunidades y servicios religiosos de Linares.',
  true,
  (SELECT COALESCE(MAX(orden), 0) + 1 FROM categorias)
)
ON CONFLICT (slug) DO NOTHING;
