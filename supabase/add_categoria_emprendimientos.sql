-- Agrega la categoría "Emprendimientos" al directorio LinaresYa
-- Ejecutar en Supabase SQL Editor

INSERT INTO categorias (nombre, slug, emoji, descripcion, activa, orden)
VALUES (
  'Emprendimientos',
  'emprendimientos',
  '💡',
  'Emprendedores y pequeños negocios independientes de Linares. Repostería, costura, artesanía, diseño y más.',
  true,
  (SELECT COALESCE(MAX(orden), 0) + 1 FROM categorias)
)
ON CONFLICT (slug) DO NOTHING;
