-- Agrega la categoría "Restaurante" al directorio LinaresYa
-- NOTA: se superpone con "Gastronomía". Evaluar consolidar a futuro.
-- Ejecutar en Supabase SQL Editor

INSERT INTO categorias (nombre, slug, emoji, descripcion, activa, orden)
VALUES (
  'Restaurante',
  'restaurante',
  '🍴',
  'Restaurantes de Linares: cocina chilena, internacional, parrilladas y más.',
  true,
  (SELECT COALESCE(MAX(orden), 0) + 1 FROM categorias)
)
ON CONFLICT (slug) DO NOTHING;
