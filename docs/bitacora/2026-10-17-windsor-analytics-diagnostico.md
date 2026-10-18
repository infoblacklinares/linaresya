# 17 de octubre de 2026 — Windsor.ai para diagnosticar el crecimiento de LinaresYa

## Motivo
Tras aproximadamente dos meses sin registros de negocios nuevos, no hay evidencia suficiente para saber si el problema principal es falta de tráfico, falta de interacción, fricción en el formulario de publicación o una combinación. Se pausa el trabajo en auditorías técnicas generales y se prioriza medir el recorrido real de los visitantes.

## Estado al cierre de esta sesión
- Willson abrió Windsor.ai y la pantalla de conexión con ChatGPT.
- En los conectores visibles aparecen Google Analytics 4 y Google Search Console, además de Instagram Insights, Facebook Ads, Google Ads y TikTok Organic.
- Todavía no se ha confirmado que ninguna fuente esté conectada ni que existan datos importados.
- No se han compartido credenciales ni valores secretos.
- La revisión de configuración de producción de Cloudflare Turnstile sigue pendiente; el código público de `/publicar` depende de validación Turnstile para las publicaciones no administrativas. No se ha confirmado que esa configuración esté fallando.
- La implementación de Google Analytics en LinaresYa es opcional mediante `NEXT_PUBLIC_GA_ID`; debe verificarse si está configurada en producción.
- En la documentación técnica del sistema de eventos constaba como pendiente ejecutar la migración `supabase/eventos_negocio.sql` y validar la analítica ampliada. El estado actual de producción debe comprobarse, no darse por hecho.

## Decisión
Priorizar la conexión de datos antes de nuevas auditorías SEO o cambios secundarios. Empezar con Google Analytics 4 para visitas y comportamiento del sitio, y Google Search Console para impresiones, clics y consultas de búsqueda. Conectar solo propiedades que correspondan a LinaresYa y autorizar únicamente el acceso necesario.

## Preguntas que debe responder el diagnóstico
1. ¿Cuántas visitas reales hubo durante los últimos 30 y 60 días?
2. ¿Qué proporción llegó desde Google, redes sociales, enlaces directos y referencias?
3. ¿Qué páginas y fichas se visitan?
4. ¿Se realizan búsquedas internas y clics de contacto (WhatsApp, teléfono, cómo llegar)?
5. ¿La página `/publicar` recibe visitas y el formulario se completa o se abandona?
6. ¿Google muestra LinaresYa en resultados y para qué consultas?

## Siguiente paso
En Windsor.ai, seleccionar Google Analytics 4 y conectar la cuenta que contiene la propiedad de LinaresYa. Después conectar Google Search Console. No conectar Google Ads ni Facebook Ads salvo que se necesite analizar campañas pagadas. Luego revisar datos reales antes de decidir cambios.

## Criterio de éxito
Poder distinguir con datos entre: (a) falta de tráfico, (b) tráfico sin intención, (c) dificultad para contactar negocios y (d) problemas para registrar una ficha. La prioridad es corregir el cuello de botella demostrado, no seguir haciendo auditorías sin una relación clara con los resultados.
