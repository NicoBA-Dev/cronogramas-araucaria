# Araucaria · Last Planner (prototipo)

Prototipo navegable del sistema Last Planner para Araucaria Construcciones.
HTML, CSS y JavaScript puro: no necesita instalar nada.

## Cómo abrirlo
1. Descomprime la carpeta.
2. Haz doble clic en `index.html` (Chrome, Edge, Safari o Firefox).

Para verlo en el teléfono: copia la carpeta al teléfono y ábrela con el navegador,
o súbela a cualquier hosting estático (Netlify, GitHub Pages, etc.).

## Qué incluye
- **Tablero**: PPC de la semana o del mes, avance por día, tendencia semanal,
  causas de incumplimiento, PPC por contratista y últimos incumplimientos.
- **Plan semanal**: grilla actividad × día en computadora y vista por día en teléfono.
- **Evaluar día**: Cumplió / No cumplió, causa obligatoria y observación.
- **Calificación**: calificación semanal, ranking, ganador del mes e histórico.
- **Configuración**: proyectos, contratistas, sectores, pisos, causas y especialidades.

## Datos de demostración
- Fecha de la demo: jueves 15 de octubre de 2026 (semana 42). Se cambia en `js/data.js` (`TODAY`).
- Dos proyectos (Edificio Arena y Edificio Etrusco), semanas 39 a 43.
- No hay base de datos: los cambios se pierden al recargar la página.
- Los botones Exportar PDF / Excel todavía no tienen funcionalidad.

## Reglas de calificación (ejemplo, a validar con el cliente)
- Base = PPC × 0,5 + Calidad × 2 + Seguridad × 2 + Limpieza × 1 (criterios de 0 a 10).
- Falta grave: el puntaje se multiplica por 0,5.
- Elegible: criterios completos, sin falta grave, 2+ compromisos evaluados y final ≥ 70.
- Excelencia: final ≥ 90 y PPC ≥ 90 %. Ganador mensual: 2+ semanas y 4+ compromisos.
- Las reglas están en `js/app.js`, en el objeto `RULES`.

## Archivos
- `index.html`: estructura
- `css/styles.css`: estilos (modo claro/oscuro, responsivo)
- `js/data.js`: datos de demostración
- `js/app.js`: lógica de la aplicación
- `assets/logo.png`: logo
