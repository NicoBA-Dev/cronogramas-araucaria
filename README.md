# Araucaria · Last Planner (prototipo v2)

Prototipo navegable del sistema Last Planner para Araucaria Construcciones.
HTML, CSS y JavaScript puro: no necesita instalar nada, ni internet (la tipografía cae a la del sistema).

## Cómo abrirlo
1. Descomprime la carpeta.
2. Haz doble clic en `index.html` (Chrome, Edge, Safari o Firefox).

Para verlo en el teléfono: sube la carpeta a cualquier hosting estático (Netlify, GitHub Pages, etc.)
o cópiala al teléfono y ábrela con el navegador.

## Menú (5 módulos)
| Módulo | Qué hace |
|---|---|
| **Dashboard** | Vista de presentación de la semana actual: PPC con meta, cumplidos / no cumplidos / pendientes, aviso de actividades por calificar, PPC por día, Top 3 causas, días perdidos por retraso y contratistas con más incumplimientos. |
| **Tableros** | Grilla actividad + contratista × días. Siempre la misma grilla en teléfono y computadora, con scroll horizontal, columna de actividad fija y 4 semanas seguidas por defecto (desde la semana actual). |
| **Calificación** | Calificación semanal por contratista y proyecto: Calificar, Ranking, Ganador del mes e Histórico. |
| **Reportes** | PPC, Causas (con días perdidos y causa × contratista), Calidad y limpieza, Asistencia, Calificaciones tardías, Ranking y Bitácora. Con filtros y botones Excel / PDF. |
| **Ajustes** | Proyectos, Contratistas (con sus actividades), Sectores, Pisos, Causas, Especialidades, Fórmula, Tableros, Días sin obra y Simulador. |

## Reglas principales
- **Todo es estático.** No hay `localStorage`, cookies ni base de datos. Al recargar la página vuelve la demo.
- **Reloj:** usa la fecha y hora reales. En Ajustes → Simulador se puede simular otra fecha y hora
  (aparece la etiqueta «Fecha simulada» arriba). Botón «Volver a hoy».
- **Día editable:** hoy, y el día anterior hasta las 12:00. Los días futuros nunca se califican ni evalúan. El domingo no es día de obra.
- **12 causas oficiales** con número y nombre fijos (no se renombran ni se borran). Solo se agregan causas nuevas en Ajustes (siguiente número libre). El número siempre va junto al nombre y, en la grilla, un «No cumplió» muestra un círculo rojo con el número de la causa.
- **Tocar un compromiso** → ventana con la actividad ya cargada y dos opciones: *Evaluar día* (Cumplió / No cumplió; si no cumplió: causa y «¿Retrasó la obra?» obligatorios) y *Editar compromiso* (día, piso, sector, detalle; un compromiso ya evaluado no se mueve ni se elimina).
- **Tocar una actividad** → *Calificar* (por defecto), *Asistencia* y *Editar actividad*.
- **Calificar:** por compromiso (dos compromisos el mismo día = dos bloques). «¿Trabajó hoy?»; si trabajó, Calidad y Limpieza de 0 a 10 son obligatorias; si no trabajó, ese día no entra al promedio y el compromiso queda «No cumplió» con causa.
- **Candados:** no se puede guardar Cumplió / No cumplió sin la calificación del día. Si quedó un día anterior sin cerrar, hoy queda bloqueado hasta cerrarlo como calificación **tardía** (queda marcada en Reportes y en la bitácora). Los días sin obra y los domingos no bloquean.
- **Asistencia:** del contratista responsable, tres estados (Llegó / Tarde / No llegó), dos reuniones de lunes a viernes y una el sábado. Se comparte entre las actividades del contratista. Nunca bloquea.
- **Calificación semanal:** PPC automático; Calidad y Limpieza = promedio de los días trabajados (editable, queda «editado»); Seguridad y Personal (cantidad de personas) manuales; falta grave. Lunes a viernes muestran el aviso «se califican los sábados» pero se pueden llenar.
- **Fórmula (editable en Ajustes → Fórmula):** base = Σ peso × nota (0–100) con pesos que suman 100 (inicial 50 / 20 / 15 / 15); final = base × FM × (falta grave ? 0,5 : 1). Sin tope. La tabla del FM es **de ejemplo** hasta recibir la real.
- **Falta grave:** además de ×0,5, el contratista queda fuera del ranking semanal y del bonus.
- **Operador:** selector «¿Quién opera?» (Nicolas, Rodrigo, Adriana, Benjamin). Cada acción queda en la Bitácora (Reportes → Bitácora).
- **Exportar:** Excel = archivo `.csv` con `;` y UTF-8 con BOM (Excel en español abre bien las tildes). PDF = vista de impresión limpia (`window.print()`, elegir «Guardar como PDF»).

## Datos de demostración
- Se generan **relativos a la fecha real** al abrir la página: los días anteriores a hoy quedan evaluados y calificados (con algunas calificaciones tardías y asistencias con tardanza o falta), hoy queda pendiente y lo demás programado.
- Hoy hay dos compromisos de «Cableado eléctrico» (Piso 7 y Piso 8) para probar el bloque doble de calificación.
- Dos proyectos (Edificio Arena y Edificio Etrusco). Hay un sábado sin obra de ejemplo en Arena.
- Para probar bloqueos y el corte de las 12:00 sin esperar: Ajustes → Simulador.

## Fuera de esta maqueta
Login y roles, crear/duplicar proyecto con wizard, íconos por especialidad, multas de asistencia, responsabilidad oficina/contratista de las causas, librerías de exportación, dependencias automáticas entre actividades, edición simultánea y backend.

## Archivos
- `index.html`: estructura
- `css/styles.css`: estilos (modo claro/oscuro, responsivo)
- `js/data.js`: datos de demostración (relativos a la fecha real)
- `js/app.js`: lógica de la aplicación
- `assets/logo.png`: logo
