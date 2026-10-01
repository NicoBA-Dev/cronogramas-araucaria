/* =========================================================
   Araucaria · Last Planner — Aplicación
   JavaScript puro, sin librerías. Todo es estático: los datos
   viven en memoria y al recargar la página vuelve la demo.
   ========================================================= */
(function () {
  'use strict';

  const DB = JSON.parse(JSON.stringify(window.DEMO_DATA));
  const CFG = DB.settings;              // fórmula y reglas (editables en Ajustes)

  const DAY = 864e5;
  const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DOW_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const CAUSE_COLORS = ['#e5484d', '#f59e0b', '#3b82f6', '#a855f7', '#14b8a6', '#ec4899', '#64748b', '#0ea5e9', '#f97316', '#6366f1', '#84cc16', '#d946ef'];
  const SECTOR_COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#a855f7', '#ec4899', '#64748b', '#0ea5e9', '#f97316'];
  const MAX_WEEK = 52;
  const MEETINGS = { am: 'Mañana', pm: 'Tarde' };
  const ATT = { ok: 'Llegó', late: 'Tarde', no: 'No llegó' };

  /* ---------- Íconos (SVG en línea) ---------- */
  const svg = (p, extra = '') => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
  const I = {
    home: svg('<path d="M3 13h8V3H3z"/><path d="M13 21h8V11h-8z"/><path d="M13 3h8v5h-8z"/><path d="M3 21h8v-5H3z"/>'),
    plan: svg('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 14h3M8 17h6"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    report: svg('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
    cog: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    check: svg('<path d="M20 6L9 17l-5-5"/>', 'stroke-width="3"'),
    x: svg('<path d="M18 6L6 18M6 6l12 12"/>', 'stroke-width="2.6"'),
    chevL: svg('<path d="M15 18l-6-6 6-6"/>'),
    chevR: svg('<path d="M9 18l6-6-6-6"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    pdf: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6M9 18h4"/>'),
    xls: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'),
    alert: svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    filter: svg('<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>'),
    star: svg('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
    arrowUp: svg('<path d="M12 19V5M5 12l7-7 7 7"/>', 'stroke-width="2.6"'),
    arrowDown: svg('<path d="M12 5v14M19 12l-7 7-7-7"/>', 'stroke-width="2.6"'),
    users: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
    calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    ban: svg('<circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/>'),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
    clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    crosshair: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>')
  };

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', short: 'Dashboard', icon: I.home },
    { id: 'tableros', label: 'Tableros', short: 'Tableros', icon: I.plan },
    { id: 'calificacion', label: 'Calificación', short: 'Calificar', icon: I.trophy },
    { id: 'reportes', label: 'Reportes', short: 'Reportes', icon: I.report },
    { id: 'ajustes', label: 'Ajustes', short: 'Ajustes', icon: I.cog }
  ];

  /* ---------- Estado de la interfaz ---------- */
  const S = {
    view: 'dashboard',
    projectId: DB.projects[0].id,
    operator: DB.operators[0],
    sim: null,                       // { date, time } cuando se simula fecha y hora
    planFrom: 1, planCount: CFG.weeksVisible, planSearch: '', planContractor: '', planScroll: true,
    scoreWeek: 1, scoreTab: 'calificar', scoreDraft: {}, month: null, histContractor: '',
    cfgTab: 'proyectos',
    repTab: 'ppc', repFrom: 1, repTo: 1, repContractor: '', repActivity: '', repCause: '',
    logWho: '', logType: '', logDate: '',
    exp: null
  };
  let M = null;                      // estado del modal abierto
  let pendingConfirm = null;
  let uidSeq = 1;
  const uid = (p) => `${p}${Date.now().toString(36)}${(uidSeq++).toString(36)}`;

  /* ---------- Utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = (n) => String(n).padStart(2, '0');
  const r1 = (n) => Math.round(n * 10) / 10;
  const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (n) => Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const norm = (s) => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isNum = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const parseNum = (raw) => { const t = String(raw).trim().replace(',', '.'); return t === '' ? '' : (Number.isNaN(Number(t)) ? t : Number(t)); };
  const cmpEs = (a, b) => String(a).localeCompare(String(b), 'es');

  /* ---------- Fechas (UTC internamente, para evitar desfases de zona horaria) ---------- */
  function mondayOf(week) {
    const jan4 = Date.UTC(DB.year, 0, 4);
    const dow = new Date(jan4).getUTCDay() || 7;
    return jan4 - (dow - 1) * DAY + (week - 1) * 7 * DAY;
  }
  const isoOf = (ms) => new Date(ms).toISOString().slice(0, 10);
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const weekDates = (w) => Array.from({ length: 6 }, (_, i) => isoOf(mondayOf(w) + i * DAY));
  const dayIdx = (s) => (new Date(parseISO(s)).getUTCDay() + 6) % 7;
  const dayNum = (s) => new Date(parseISO(s)).getUTCDate();
  const addDays = (s, n) => isoOf(parseISO(s) + n * DAY);
  const prevDate = (s) => addDays(s, -1);
  function weekOfDate(s) {
    const mon = parseISO(s) - dayIdx(s) * DAY;
    return Math.round((mon - mondayOf(1)) / (7 * DAY)) + 1;
  }
  const fmtShort = (s) => { const d = new Date(parseISO(s)); return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`; };
  const fmtDay = (s) => `${DOW[dayIdx(s)]} ${fmtShort(s)}`;
  function fmtDayLong(s) {
    const d = new Date(parseISO(s));
    return `${DOW_LONG[dayIdx(s)]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
  }
  const monthOfWeek = (w) => isoOf(mondayOf(w) + 3 * DAY).slice(0, 7);   // el mes del jueves
  function monthLabel(mk) { const [y, m] = mk.split('-'); return `${cap(MONTHS[Number(m) - 1])} ${y}`; }
  const range = (a, b) => { const out = []; for (let i = a; i <= b; i++) out.push(i); return out; };

  /* ---------- Reloj (real o simulado) ---------- */
  function nowP() {
    if (S.sim) { const [h, m] = S.sim.time.split(':').map(Number); return { date: S.sim.date, min: h * 60 + m }; }
    const d = new Date();
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, min: d.getHours() * 60 + d.getMinutes() };
  }
  const today = () => nowP().date;
  const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
  const stamp = () => { const n = nowP(); return `${n.date} ${hhmm(n.min)}`; };
  const fmtStamp = (s) => (s ? `${fmtShort(s.slice(0, 10))} ${s.slice(11)}` : '—');
  const curWeek = () => clamp(weekOfDate(today()), 1, MAX_WEEK);
  // Día editable: hoy, o el día anterior hasta las 12:00
  function editableWindow(d) {
    const n = nowP();
    return d === n.date || (d === prevDate(n.date) && n.min < 720);
  }

  /* ---------- Acceso a datos ---------- */
  const project = (pid = S.projectId) => byId(DB.projects, pid);
  const contractor = (id) => byId(DB.contractors, id);
  const activity = (id) => byId(DB.activities, id);
  const cause = (id) => byId(DB.causes, id);
  const projActs = (pid = S.projectId) => DB.activities.filter((a) => a.projectId === pid)
    .sort((a, b) => cmpEs(a.name, b.name) || cmpEs((contractor(a.contractorId) || {}).name || '', (contractor(b.contractorId) || {}).name || ''));
  const sectorWord = (p = project()) => (p && p.sectorLabel === 'Departamento' ? 'Departamento' : 'Sector');
  const sectorWordPl = (p = project()) => (p && p.sectorLabel === 'Departamento' ? 'Departamentos' : 'Sectores');
  function sectorOf(c) { const p = project(c.projectId); return p ? byId(p.sectors, c.sectorId) : null; }
  const contractorIdOf = (c) => { const a = activity(c.activityId); return a ? a.contractorId : null; };
  const causeNum = (id) => { const k = cause(id); return k ? k.num : null; };
  const causeLabel = (id) => { const k = cause(id); return k ? `${k.num} · ${k.name}` : 'Sin causa'; };
  const causeBadge = (id, cls = '') => { const k = cause(id); return k ? `<span class="cause-num ${cls}" title="${esc(k.name)}">${k.num}</span>` : ''; };
  const locText = (c) => { const s = sectorOf(c); return `${c.floor} ${s ? s.code : ''}`.trim(); };
  const isOff = (pid, d) => DB.offDays.some((o) => o.projectId === pid && o.date === d);
  const isWorkDay = (pid, d) => dayIdx(d) !== 6 && !isOff(pid, d);
  const live = (list) => list.filter((c) => isWorkDay(c.projectId, c.date));

  function projectContractors(pid = S.projectId) {
    const ids = new Set(projActs(pid).map((a) => a.contractorId));
    return DB.contractors.filter((c) => ids.has(c.id)).sort((a, b) => cmpEs(a.name, b.name));
  }

  function commitmentsWhere(opts = {}) {
    const pid = opts.projectId || S.projectId;
    let dset = null;
    if (opts.weeks) dset = new Set(opts.weeks.flatMap(weekDates));
    if (opts.dates) dset = new Set(opts.dates);
    return DB.commitments.filter((c) => c.projectId === pid
      && (!dset || dset.has(c.date))
      && (!opts.contractorId || contractorIdOf(c) === opts.contractorId));
  }
  function stats(list) {
    let done = 0, fail = 0, pending = 0;
    const l = live(list);
    l.forEach((c) => { if (c.status === 'done') done++; else if (c.status === 'fail') fail++; else pending++; });
    const evaluated = done + fail;
    return { total: l.length, done, fail, pending, evaluated, ppc: evaluated ? Math.round((done / evaluated) * 100) : null };
  }
  const tone = (p) => (p == null ? 'none' : p >= CFG.meta ? 'good' : p >= 60 ? 'mid' : 'bad');
  const toneLabel = (p) => (p == null ? 'Sin datos' : p >= CFG.meta ? 'Sobre la meta' : p >= 60 ? 'Bajo la meta' : 'Crítico');
  const pctTxt = (p) => (p == null ? '—' : `${p}%`);
  const lostDays = (list, pid = S.projectId) => live(list).filter((c) => c.status === 'fail' && c.delayed === true).length * (project(pid).delayDays || 1);

  /* ---------- Calificación diaria y candados ---------- */
  const rating = (c) => DB.ratings[c.id] || null;
  const ratingComplete = (c) => { const r = rating(c); return !!r && (r.worked === false || (isNum(r.calidad) && isNum(r.limpieza))); };
  const isClosed = (c) => ratingComplete(c) && c.status !== 'pending';
  const sortByDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

  // Compromisos de hoy que aún no tienen calificación completa
  function todayToRate(pid) {
    const t = today();
    return live(DB.commitments.filter((c) => c.projectId === pid && c.date === t)).filter((c) => !ratingComplete(c));
  }
  // Compromisos de días anteriores que siguen sin cerrarse (bloquean el día de hoy)
  function blockers(pid) {
    const t = today();
    return live(DB.commitments.filter((c) => c.projectId === pid && c.date < t)).filter((c) => !isClosed(c)).sort(sortByDate);
  }

  // Estado de un compromiso según las reglas de tiempo y los candados
  function lockInfo(c) {
    const t = today();
    if (!isWorkDay(c.projectId, c.date)) return { reason: 'off' };
    if (c.date > t) return { reason: 'future' };
    if (c.date === t) {
      const b = blockers(c.projectId);
      return b.length ? { reason: 'blocked', blockers: b } : { ok: true };
    }
    // Día pasado
    if (!isClosed(c)) return { ok: true, late: true };            // cierre tardío
    if (editableWindow(c.date)) return { ok: true };              // hasta las 12:00 del día siguiente
    return { reason: 'closed' };
  }
  const canAddOn = (pid, d) => d >= today() && isWorkDay(pid, d);

  /* ---------- Promedios diarios → calificación semanal ---------- */
  const scoreKey = (cid, week = S.scoreWeek, pid = S.projectId) => `${pid}|${week}|${cid}`;
  const savedScore = (cid, week, pid = S.projectId) => DB.scores.find((s) => s.projectId === pid && s.week === week && s.contractorId === cid);

  // Promedio de Calidad y Limpieza de la semana: solo días trabajados
  function dayAvgs(pid, cid, week) {
    const cs = live(commitmentsWhere({ projectId: pid, weeks: [week], contractorId: cid }));
    const byDay = {}, withC = new Set();
    cs.forEach((c) => {
      withC.add(c.date);
      const r = rating(c);
      if (r && r.worked !== false && isNum(r.calidad) && isNum(r.limpieza)) (byDay[c.date] = byDay[c.date] || []).push(r);
    });
    const ds = Object.keys(byDay);
    if (!ds.length) return { calidad: null, limpieza: null, days: 0, total: withC.size };
    const avg = (k) => r1(ds.reduce((s, d) => s + byDay[d].reduce((a, r) => a + Number(r[k]), 0) / byDay[d].length, 0) / ds.length);
    return { calidad: avg('calidad'), limpieza: avg('limpieza'), days: ds.length, total: withC.size };
  }

  // Valores base (guardados o automáticos) y valores efectivos (con borrador)
  function baseVals(cid, week, pid = S.projectId) {
    const auto = dayAvgs(pid, cid, week), saved = savedScore(cid, week, pid) || {};
    const manual = (f) => (isNum(saved[f]) ? Number(saved[f]) : null);
    const b = (f) => (manual(f) != null ? manual(f) : (auto[f] == null ? '' : auto[f]));
    return {
      auto, saved, manual,
      calidad: b('calidad'), limpieza: b('limpieza'),
      seguridad: saved.seguridad == null ? '' : saved.seguridad,
      personal: saved.personal == null ? '' : saved.personal,
      falta: !!saved.falta
    };
  }
  function weekValues(cid, week, useDraft, pid = S.projectId) {
    const base = baseVals(cid, week, pid);
    const d = useDraft ? (S.scoreDraft[scoreKey(cid, week, pid)] || {}) : {};
    const pv = (f) => (d[f] !== undefined ? d[f] : base[f]);
    const edited = (f) => (d[f] !== undefined
      ? (isNum(d[f]) && (base.auto[f] == null || Number(d[f]) !== Number(base.auto[f])))
      : base.manual(f) != null);
    return {
      calidad: pv('calidad'), limpieza: pv('limpieza'), seguridad: pv('seguridad'), personal: pv('personal'),
      falta: d.falta !== undefined ? d.falta : base.falta,
      calidadEdited: edited('calidad'), limpiezaEdited: edited('limpieza'),
      auto: base.auto, note: base.saved.note || '', saved: !!savedScore(cid, week, pid)
    };
  }

  // Factor multiplicador según la cantidad de personal
  function fmFor(n) {
    if (!isNum(n)) return 1;
    const x = Number(n);
    const row = CFG.fm.find((r) => x >= r.min && (r.max == null || x <= r.max));
    return row ? row.fm : 1;
  }
  const weightSum = (w = CFG.weights) => Number(w.ppc) + Number(w.calidad) + Number(w.seguridad) + Number(w.limpieza);

  // Fórmula: base = suma ponderada (notas de 0 a 100) · final = base × FM × (falta grave ? factor : 1)
  function calcScore(ppc, v) {
    const complete = isNum(v.calidad) && isNum(v.seguridad) && isNum(v.limpieza) && isNum(v.personal);
    const n = (x) => (isNum(x) ? Number(x) : 0);
    const w = CFG.weights;
    const base = ((w.ppc * (ppc || 0)) + (w.calidad * n(v.calidad) * 10) + (w.seguridad * n(v.seguridad) * 10) + (w.limpieza * n(v.limpieza) * 10)) / 100;
    const fm = fmFor(v.personal);
    const factor = v.falta ? CFG.faltaFactor : 1;
    return { base: r1(base), fm, factor, final: r1(base * fm * factor), complete };
  }

  function rankRows(rows) {
    rows.forEach((r) => {
      r.winner = false;
      r.reason = '';
      if (r.st.evaluated === 0) { r.state = 'nodata'; r.reason = 'Sin compromisos evaluados'; }
      else if (r.v.falta) { r.state = 'noelig'; r.reason = 'Falta grave: fuera del ranking'; }
      else if (!r.calc.complete) { r.state = 'incomplete'; r.reason = 'Falta completar criterios'; }
      else if (r.st.evaluated < r.minComp) { r.state = 'noelig'; r.reason = `Menos de ${r.minComp} compromisos`; }
      else if (r.minWeeks && r.weeks < r.minWeeks) { r.state = 'noelig'; r.reason = `Menos de ${r.minWeeks} semanas`; }
      else if (r.calc.final < CFG.minFinal) { r.state = 'noelig'; r.reason = `Puntaje menor a ${CFG.minFinal}`; }
      else if (r.calc.final >= CFG.excFinal && r.st.ppc >= CFG.excPpc) { r.state = 'exc'; r.reason = 'Excelencia'; }
      else { r.state = 'elig'; r.reason = 'Elegible'; }
    });
    const elig = rows.filter((r) => r.state === 'elig' || r.state === 'exc')
      .sort((a, b) => b.calc.final - a.calc.final || b.st.ppc - a.st.ppc || cmpEs(a.name, b.name));
    if (elig[0]) elig[0].winner = true;
    return rows.sort((a, b) => {
      const av = a.state === 'nodata' ? -1 : a.calc.final, bv = b.state === 'nodata' ? -1 : b.calc.final;
      return bv - av || cmpEs(a.name, b.name);
    });
  }

  function weekRows(week, useDraft, pid = S.projectId) {
    const list = live(commitmentsWhere({ projectId: pid, weeks: [week] }));
    const cids = [...new Set(list.map(contractorIdOf).filter(Boolean))];
    const rows = cids.map((cid) => {
      const st = stats(list.filter((c) => contractorIdOf(c) === cid));
      const v = weekValues(cid, week, useDraft, pid);
      const c = contractor(cid);
      return { cid, name: c ? c.name : '—', specialty: c ? c.specialty : '', st, v, calc: calcScore(st.ppc, v), minComp: CFG.minCompWeek, week };
    });
    return rankRows(rows);
  }

  const dataWeeks = () => [...new Set(DB.commitments.map((c) => weekOfDate(c.date)))].sort((a, b) => a - b);
  const weeksOfMonth = (mk) => dataWeeks().filter((w) => monthOfWeek(w) === mk);
  const allMonths = () => [...new Set(dataWeeks().map(monthOfWeek).concat([monthOfWeek(curWeek())]))].sort();

  function monthRows(mk, pid = S.projectId) {
    const weeks = weeksOfMonth(mk);
    const list = live(commitmentsWhere({ projectId: pid, weeks }));
    const cids = [...new Set(list.map(contractorIdOf).filter(Boolean))];
    const rows = cids.map((cid) => {
      const mine = list.filter((c) => contractorIdOf(c) === cid);
      const st = stats(mine);
      const weeksPart = weeks.filter((w) => stats(mine.filter((c) => weekDates(w).includes(c.date))).evaluated > 0);
      const vs = weeksPart.map((w) => weekValues(cid, w, false, pid));
      const avg = (k) => { const xs = vs.map((x) => x[k]).filter(isNum); return xs.length ? r1(xs.reduce((s, x) => s + Number(x), 0) / xs.length) : ''; };
      const v = { calidad: avg('calidad'), seguridad: avg('seguridad'), limpieza: avg('limpieza'), personal: avg('personal') === '' ? '' : Math.round(avg('personal')), falta: vs.some((x) => x.falta) };
      const c = contractor(cid);
      return { cid, name: c ? c.name : '—', specialty: c ? c.specialty : '', st, v, calc: calcScore(st.ppc, v), weeks: weeksPart.length, minComp: CFG.minCompMonth, minWeeks: CFG.minWeeksMonth };
    });
    return rankRows(rows);
  }

  const STATE_LABEL = { nodata: 'Sin datos', incomplete: 'Incompleto', noelig: 'No elegible', elig: 'Elegible', exc: 'Excelencia' };
  function statePill(r) {
    if (r.winner) return `<span class="pill pill-win">${I.trophy}Ganador</span>`;
    return `<span class="pill pill-${r.state}" title="${esc(r.reason)}">${STATE_LABEL[r.state]}</span>`;
  }

  /* ---------- Bitácora (log) ---------- */
  function logAct(type, detail) {
    DB.log.unshift({ at: stamp(), who: S.operator, type, detail });
    if (DB.log.length > 3000) DB.log.length = 3000;
  }

  /* ---------- Componentes visuales ---------- */
  function pageHead(title, sub, actions = '', cls = '') {
    return `<div class="page-head ${cls}">
      <div class="ph-text">
        <h1>${title}</h1>
        ${sub ? `<p class="ph-sub">${sub}</p>` : ''}
      </div>
      ${actions ? `<div class="ph-actions">${actions}</div>` : ''}
    </div>`;
  }
  const exportBtns = (cls = '') => `<div class="export-group ${cls}" role="group" aria-label="Exportar">
      <button type="button" class="btn btn-soft btn-sm" data-action="export" data-format="PDF" aria-label="Exportar a PDF (imprimir)">${I.pdf}<span>PDF</span></button>
      <button type="button" class="btn btn-soft btn-sm" data-action="export" data-format="Excel" aria-label="Exportar a Excel">${I.xls}<span>Excel</span></button>
    </div>`;

  function statusIcon(status) {
    if (status === 'done') return I.check;
    if (status === 'fail') return I.x;
    return '<b class="dot"></b>';
  }
  function locBadge(c) {
    const s = sectorOf(c);
    return `<span class="loc" style="--c:${s ? s.color : '#64748b'}">${esc(c.floor)} <b>${esc(s ? s.code : '—')}</b></span>`;
  }

  // Chip de un compromiso dentro de la grilla del tablero
  function shortFloor(f) {
    const m = /^Piso (\d+)$/.exec(f);
    if (m) return `P${m[1]}`;
    return ({ 'Planta Baja': 'PB', 'Subsuelo': 'SS', 'Terraza': 'Terr.' })[f] || f;
  }
  function chip(c) {
    const s = sectorOf(c);
    const st = { done: 'Cumplió', fail: 'No cumplió', pending: 'Pendiente' }[c.status];
    const unrated = c.date <= today() && isWorkDay(c.projectId, c.date) && !ratingComplete(c);
    const cn = c.status === 'fail' ? causeNum(c.causeId) : null;
    return `<div class="cm">
      <button type="button" class="chip st-${c.status}" style="--c:${s ? s.color : '#64748b'}" data-action="open-commitment" data-id="${c.id}" title="${esc(c.floor)}, ${esc(s ? s.name : '')}: ${st}${cn ? `, causa ${cn}` : ''}">
        <i class="chip-st">${statusIcon(c.status)}</i><span class="chip-floor"><span class="fl-full">${esc(c.floor)}</span><span class="fl-short">${esc(shortFloor(c.floor))}</span></span><b>${esc(s ? s.code : '—')}</b>${cn ? `<em class="chip-cause" aria-label="Causa ${cn}">${cn}</em>` : ''}
      </button>
      ${c.detail ? `<span class="chip-detail">${esc(c.detail)}</span>` : ''}
      ${unrated ? '<span class="chip-flag">Sin calificar</span>' : ''}
    </div>`;
  }

  function gauge(p) {
    const r = 52, C = 2 * Math.PI * r;
    const val = p == null ? 0 : p;
    const metaAngle = (CFG.meta / 100) * 360 - 90;
    const rad = (metaAngle * Math.PI) / 180;
    const x1 = 60 + Math.cos(rad) * 42, y1 = 60 + Math.sin(rad) * 42;
    const x2 = 60 + Math.cos(rad) * 62, y2 = 60 + Math.sin(rad) * 62;
    return `<div class="gauge" role="img" aria-label="PPC ${pctTxt(p)}">
      <svg viewBox="0 0 120 120">
        <defs><linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8dc442"/><stop offset="1" stop-color="#5ebb48"/></linearGradient></defs>
        <circle cx="60" cy="60" r="${r}" class="g-track"/>
        <circle cx="60" cy="60" r="${r}" class="g-val" stroke="url(#gGrad)" stroke-dasharray="${(C * val) / 100} ${C}" transform="rotate(-90 60 60)"/>
        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="g-meta"/>
      </svg>
      <div class="g-center"><strong>${p == null ? '—' : p}<small>${p == null ? '' : '%'}</small></strong><span>PPC</span></div>
    </div>`;
  }

  const yAxis = () => `<div class="chart-y" aria-hidden="true">${[100, CFG.meta, 50, 25, 0].map((v) => `<span style="bottom:${v}%" class="${v === CFG.meta ? 'meta' : ''}">${v}</span>`).join('')}</div>`;

  function columnChart(items) {
    const n = items.length;
    return `<div class="chart" style="--n:${n}">
      ${yAxis()}
      <div class="chart-main">
        <div class="chart-plot">
          ${[25, 50, 100].map((v) => `<i class="chart-line" style="bottom:${v}%"></i>`).join('')}
          <div class="chart-target" style="bottom:${CFG.meta}%"></div>
          <div class="chart-cols">
            ${items.map((it) => `<div class="cc-col${it.active ? ' active' : ''}" title="${esc(it.title || '')}">
              ${it.value == null
                ? '<span class="cc-empty">—</span>'
                : `<div class="cc-bar tone-${tone(it.value)}" style="height:${Math.max(it.value, 2)}%"><span class="cc-val">${it.value}%</span></div>`}
            </div>`).join('')}
          </div>
        </div>
        <div class="chart-x">${items.map((it) => `<span class="${it.active ? 'active' : ''}">${esc(it.label)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>`).join('')}</div>
      </div>
    </div>`;
  }

  function lineChart(items) {
    const n = items.length;
    const pts = items.map((it, i) => ({ x: ((i + 0.5) / n) * 100, y: it.value == null ? null : 100 - it.value, it }));
    const segs = [];
    let cur = [];
    pts.forEach((p) => { if (p.y == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push(p); });
    if (cur.length) segs.push(cur);
    const lines = segs.map((s) => `<polyline points="${s.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}" class="lc-line"/>`).join('');
    const areas = segs.filter((s) => s.length > 1).map((s) => `<polygon points="${s[0].x.toFixed(2)},100 ${s.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')} ${s[s.length - 1].x.toFixed(2)},100" class="lc-area"/>`).join('');
    return `<div class="chart" style="--n:${n}">
      ${yAxis()}
      <div class="chart-main">
        <div class="chart-plot">
          ${[25, 50, 100].map((v) => `<i class="chart-line" style="bottom:${v}%"></i>`).join('')}
          <div class="chart-target" style="bottom:${CFG.meta}%"></div>
          <svg class="lc-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="lcFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ebb48" stop-opacity=".28"/><stop offset="1" stop-color="#5ebb48" stop-opacity="0"/></linearGradient></defs>
            ${areas}${lines}
          </svg>
          ${pts.filter((p) => p.y != null).map((p) => `<span class="lc-dot tone-${tone(p.it.value)}${p.it.active ? ' active' : ''}" style="left:${p.x}%;bottom:${p.it.value}%"><em>${p.it.value}%</em></span>`).join('')}
        </div>
        <div class="chart-x chart-x-flush">${items.map((it) => `<span class="${it.active ? 'active' : ''}">${esc(it.label)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>`).join('')}</div>
      </div>
    </div>`;
  }

  function donut(slices, total, centerLabel = 'no cumplidos') {
    let acc = 0;
    const segs = slices.map((s) => {
      const p = (s.count / total) * 100;
      const seg = `<circle cx="21" cy="21" r="15.915" class="d-seg" stroke="${s.color}" stroke-dasharray="${p.toFixed(3)} ${(100 - p).toFixed(3)}" stroke-dashoffset="${(25 - acc).toFixed(3)}"/>`;
      acc += p;
      return seg;
    }).join('');
    return `<div class="donut"><svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="15.915" class="d-track"/>${segs}</svg>
      <div class="donut-center"><strong>${total}</strong><span>${centerLabel}</span></div></div>`;
  }

  // Causas de incumplimiento agrupadas: [{ id, num, name, count, color }]
  function causeSlices(fails) {
    const by = {};
    fails.forEach((c) => { by[c.causeId] = (by[c.causeId] || 0) + 1; });
    const slices = Object.keys(by).map((k) => ({ id: k, num: causeNum(k), name: cause(k) ? cause(k).name : 'Sin causa', count: by[k] }))
      .sort((a, b) => b.count - a.count || a.num - b.num);
    slices.forEach((s, i) => { s.color = CAUSE_COLORS[i % CAUSE_COLORS.length]; });
    return slices;
  }

  function contractorOptions(selected, list, emptyLabel) {
    return `${emptyLabel ? `<option value="">${emptyLabel}</option>` : ''}${list.map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}`;
  }
  const weekOptions = (sel, short) => range(1, MAX_WEEK).map((w) => `<option value="${w}"${w === sel ? ' selected' : ''}>${short ? 'Sem.' : 'Semana'} ${w}${w === curWeek() ? ' •' : ''}</option>`).join('');

  function rtable(headers, rows, cls = '') {
    return `<div class="rtable-wrap"><table class="rtable ${cls}">
      <thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr class="${r.cls || ''}">${r.cells.map((c, i) => `<td data-label="${esc(headers[i])}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }
  const empty = (title, text, action = '') => `<div class="empty"><p class="empty-title">${title}</p>${text ? `<p>${text}</p>` : ''}${action}</div>`;

  function saveBar(kind, count, label) {
    if (!count) return `<div class="savebar-empty" id="${kind}Savebar"></div>`;
    return `<div class="savebar" id="${kind}Savebar">
      <p><strong>${count}</strong> ${count === 1 ? 'cambio' : 'cambios'} sin guardar</p>
      <div class="sb-btns">
        <button type="button" class="btn btn-ghost btn-sm" data-action="${kind}-discard">Descartar</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="${kind}-save">${label}</button>
      </div>
    </div>`;
  }

  /* =========================================================
     VISTA: DASHBOARD (presentación: solo lo más importante)
     ========================================================= */
  function pendingBanner(pid) {
    const t = today();
    const blk = blockers(pid);
    const todayAll = live(DB.commitments.filter((c) => c.projectId === pid && c.date === t));
    const toRate = todayAll.filter((c) => !ratingComplete(c));
    let out = '';
    if (blk.length) {
      out += `<div class="banner banner-bad">
        <span class="banner-ico">${I.lock}</span>
        <p><strong>${blk.length} ${blk.length === 1 ? 'compromiso' : 'compromisos'} de días anteriores sin cerrar</strong><span>Hasta cerrarlos no se puede evaluar ni calificar hoy. Se cierran como calificación tardía.</span></p>
        <button type="button" class="btn btn-primary btn-sm" data-action="go-blocker">Cerrar ahora</button>
      </div>`;
    }
    if (todayAll.length) {
      out += toRate.length
        ? `<div class="banner">
            <span class="banner-ico">${I.alert}</span>
            <p><strong>Faltan ${toRate.length} ${toRate.length === 1 ? 'calificación pendiente' : 'calificaciones pendientes'} hoy</strong><span>${todayAll.length - toRate.length} de ${todayAll.length} ya calificadas. Cada compromiso se califica en Calidad y Limpieza antes de evaluarlo.</span></p>
            <button type="button" class="btn btn-soft btn-sm" data-action="nav" data-view="tableros">Ir a Tableros</button>
          </div>`
        : `<div class="banner banner-info">
            <span class="banner-ico">${I.check}</span>
            <p><strong>Todo calificado hoy</strong><span>${todayAll.length} de ${todayAll.length} compromisos con calificación diaria.</span></p>
          </div>`;
    }
    return out;
  }

  function pendingStrip(pid) {
    const t = today();
    const blk = blockers(pid);
    const todayAll = live(DB.commitments.filter((c) => c.projectId === pid && c.date === t));
    const toRate = todayAll.filter((c) => !ratingComplete(c));
    const parts = [];
    if (blk.length) parts.push(`<button type="button" class="pend-chip bad" data-action="go-blocker">${I.lock}<span><b>${blk.length}</b> ${blk.length === 1 ? 'compromiso' : 'compromisos'} de días anteriores sin cerrar</span><u>Cerrar ahora</u></button>`);
    if (toRate.length) parts.push(`<span class="pend-chip warn">${I.alert}<span>Faltan <b>${toRate.length}</b> ${toRate.length === 1 ? 'actividad por calificar' : 'actividades por calificar'} hoy</span></span>`);
    else if (todayAll.length) parts.push(`<span class="pend-chip ok">${I.check}<span>Todo calificado hoy</span></span>`);
    return parts.length ? `<div class="pend-strip">${parts.join('')}</div>` : '';
  }

  function viewDashboard() {
    const t = today();
    const w = curWeek();
    const list = live(commitmentsWhere({ weeks: [w] }));
    const st = stats(list);
    const prev = stats(commitmentsWhere({ weeks: [w - 1] }));
    let delta = '';
    if (prev.ppc != null && st.ppc != null) {
      const d = st.ppc - prev.ppc;
      delta = `<p class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? I.arrowUp : d < 0 ? I.arrowDown : ''}<span>${d === 0 ? 'Igual que' : `${Math.abs(d)} puntos ${d > 0 ? 'más' : 'menos'} que`} la semana ${w - 1}</span></p>`;
    }

    const chartHtml = columnChart(weekDates(w).map((d) => {
      const s = stats(list.filter((c) => c.date === d));
      return { label: DOW[dayIdx(d)], sub: isOff(S.projectId, d) ? 'Sin obra' : String(dayNum(d)), value: s.ppc, active: d === t, title: `${s.done} de ${s.evaluated} cumplidos` };
    }));

    // Top 3 causas
    const fails = list.filter((c) => c.status === 'fail');
    const slices = causeSlices(fails).slice(0, 3);
    const top3 = slices.length
      ? `<div class="bars">${slices.map((s) => `<div class="bar-row static"><span class="bar-top"><span class="bar-name"><span class="cause-num">${s.num}</span> ${esc(s.name)}</span><strong>${s.count} <small>(${Math.round((s.count / fails.length) * 100)}%)</small></strong></span>
          <span class="bar-track"><span class="bar-fill tone-bad" style="width:${(s.count / slices[0].count) * 100}%"></span></span></div>`).join('')}</div>`
      : empty('Sin incumplimientos', st.evaluated ? 'Todo lo evaluado esta semana se cumplió.' : 'Aún no hay compromisos evaluados.');

    // Días perdidos por retraso
    const dd = project().delayDays || 1;
    const lostWeek = lostDays(list);
    const lostAll = lostDays(commitmentsWhere({}));
    const delays = list.filter((c) => c.status === 'fail' && c.delayed === true).length;

    // Contratista con más incumplimientos
    const per = {};
    fails.forEach((c) => { const k = contractorIdOf(c); per[k] = (per[k] || 0) + 1; });
    const worst = Object.keys(per).map((k) => ({ name: contractor(k) ? contractor(k).name : '—', n: per[k] })).sort((a, b) => b.n - a.n || cmpEs(a.name, b.name)).slice(0, 3);
    const worstHtml = worst.length
      ? `<div class="bars">${worst.map((r) => `<div class="bar-row static"><span class="bar-top"><span class="bar-name">${esc(r.name)}</span><strong>${r.n} ${r.n === 1 ? 'incumplimiento' : 'incumplimientos'}</strong></span>
          <span class="bar-track"><span class="bar-fill tone-bad" style="width:${(r.n / worst[0].n) * 100}%"></span></span></div>`).join('')}</div>`
      : empty('Nada que revisar', 'No hay incumplimientos esta semana.');

    const more = (tab) => `<button type="button" class="link-btn" data-action="go-report" data-tab="${tab}">Ver reporte</button>`;

    return `${pageHead('Dashboard', `${esc(project().name)}, semana ${w}: lo más importante de un vistazo`)}
      ${pendingBanner(S.projectId)}
      <div class="kpi-grid">
        <section class="kpi-hero tone-${tone(st.ppc)}">
          <svg class="hero-mark" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L96 96 L78 96 L50 38 L22 96 L4 96 Z"/></svg>
          ${gauge(st.ppc)}
          <div class="kh-text">
            <p class="kh-label">Porcentaje de plan cumplido, semana ${w}</p>
            <p class="kh-status"><span class="pill pill-tone-${tone(st.ppc)}">${toneLabel(st.ppc)}</span></p>
            <p class="kh-desc">${st.done} cumplidos de ${st.evaluated} evaluados. Meta ${CFG.meta}%.</p>
            ${delta}
          </div>
        </section>
        <section class="kpi"><span class="kpi-ico k-total">${I.calendar}</span><p class="kpi-label">Compromisos</p><p class="kpi-value">${st.total}</p><p class="kpi-foot">programados</p></section>
        <section class="kpi"><span class="kpi-ico k-done">${I.check}</span><p class="kpi-label">Cumplidos</p><p class="kpi-value">${st.done}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.done / st.evaluated) * 100) : 0}% de lo evaluado</p></section>
        <section class="kpi"><span class="kpi-ico k-fail">${I.x}</span><p class="kpi-label">No cumplidos</p><p class="kpi-value">${st.fail}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.fail / st.evaluated) * 100) : 0}% de lo evaluado</p></section>
        <section class="kpi"><span class="kpi-ico k-pend"><b class="dot"></b></span><p class="kpi-label">Pendientes</p><p class="kpi-value">${st.pending}</p><p class="kpi-foot">por evaluar</p></section>
      </div>
      <div class="dash-grid">
        <section class="card"><div class="card-head"><div><h2>PPC por día</h2><p class="card-sub">Línea punteada: meta de ${CFG.meta}%.</p></div>${more('ppc')}</div>${chartHtml}</section>
        <section class="card"><div class="card-head"><div><h2>Top 3 causas de incumplimiento</h2><p class="card-sub">Con el número de la lista de causas</p></div>${more('causas')}</div>${top3}</section>
        <section class="card"><div class="card-head"><div><h2>Días perdidos por retraso</h2><p class="card-sub">Cada «sí retrasó la obra» suma ${dd} ${dd === 1 ? 'día' : 'días'} en este proyecto</p></div>${more('causas')}</div>
          <div class="lost-grid">
            <div class="lost"><span>Esta semana</span><strong>${lostWeek}</strong><small>${delays} ${delays === 1 ? 'retraso' : 'retrasos'}</small></div>
            <div class="lost"><span>Total del proyecto</span><strong>${lostAll}</strong><small>días perdidos</small></div>
          </div></section>
        <section class="card"><div class="card-head"><div><h2>Contratistas con más incumplimientos</h2><p class="card-sub">Semana ${w}</p></div>${more('causas')}</div>${worstHtml}</section>
      </div>`;
  }

  /* =========================================================
     VISTA: TABLEROS (grilla de planificación, igual en todo tipo de pantalla)
     ========================================================= */
  function planWeeks() {
    const from = clamp(S.planFrom, 1, MAX_WEEK);
    const out = [];
    for (let i = 0; i < S.planCount && from + i <= MAX_WEEK; i++) out.push(from + i);
    return out;
  }

  function planActs() {
    let acts = projActs();
    if (S.planContractor) acts = acts.filter((a) => a.contractorId === S.planContractor);
    const q = norm(S.planSearch);
    if (q) acts = acts.filter((a) => norm(`${a.name} ${(contractor(a.contractorId) || {}).name || ''}`).includes(q));
    return acts;
  }

  function planGridHtml() {
    const pid = S.projectId, t = today();
    const weeks = planWeeks();
    const acts = planActs();
    const dates = weeks.flatMap(weekDates);
    const dset = new Set(dates);
    const map = {};
    DB.commitments.forEach((c) => {
      if (c.projectId !== pid || !dset.has(c.date)) return;
      (map[`${c.activityId}|${c.date}`] = map[`${c.activityId}|${c.date}`] || []).push(c);
    });
    const weekTh = weeks.map((w) => `<th colspan="6" scope="colgroup" class="wk-head wk-start${w === curWeek() ? ' is-current' : ''}"><span class="wk-lbl">Semana ${w}${w === curWeek() ? '<em>actual</em>' : ''}</span></th>`).join('');
    const dayTh = dates.map((d) => {
      const off = isOff(pid, d), isT = d === t;
      return `<th scope="col" class="day-th${isT ? ' is-today' : ''}${off ? ' is-off' : ''}${dayIdx(d) === 0 ? ' wk-start' : ''}">
        <div class="dth"><span class="dth-dow">${DOW[dayIdx(d)]}${isT ? '<em>Hoy</em>' : ''}</span><span class="dth-date">${fmtShort(d)}</span>
          <button type="button" class="dth-off" data-action="toggle-off" data-date="${d}" title="${off ? 'Reactivar este día' : 'Marcar como día sin obra'}" aria-label="${off ? 'Reactivar' : 'Marcar como sin obra'} el ${fmtDayLong(d)}">${I.ban}</button></div>
        ${off ? '<span class="dth-tag">Sin obra</span>' : ''}
      </th>`;
    }).join('');

    const rows = acts.map((a) => {
      const ct = contractor(a.contractorId);
      const todayC = (map[`${a.id}|${t}`] || []);
      const flag = todayC.length && todayC.some((c) => !ratingComplete(c) && isWorkDay(pid, t));
      return `<tr><th class="sticky-col act-cell" scope="row">
          <button type="button" class="act-name" data-action="open-activity" data-id="${a.id}"><span>${esc(a.name)}</span>${flag ? '<i class="act-flag" title="Tiene compromisos por calificar hoy"></i>' : ''}</button>
          <span class="act-meta">${esc(ct ? ct.name : '')}</span></th>
        ${dates.map((d) => {
          const cs = (map[`${a.id}|${d}`] || []).slice().sort((x, y) => cmpEs(x.floor, y.floor));
          const off = isOff(pid, d);
          const add = canAddOn(pid, d)
            ? `<button type="button" class="cell-add" data-action="new-commitment" data-activity="${a.id}" data-date="${d}" aria-label="Agregar compromiso de ${esc(a.name)} el ${fmtDayLong(d)}">${I.plus}</button>` : '';
          return `<td class="cell-td${d === t ? ' is-today' : ''}${off ? ' is-off' : ''}${dayIdx(d) === 0 ? ' wk-start' : ''}"><div class="cell">${cs.map(chip).join('')}${add}</div></td>`;
        }).join('')}</tr>`;
    }).join('');

    return `<table class="plan-table" style="--cols:${dates.length}">
      <thead>
        <tr class="wk-row"><th class="sticky-col corner" rowspan="2" scope="col">Actividad</th>${weekTh}</tr>
        <tr class="day-row">${dayTh}</tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="${dates.length + 1}" class="plan-empty">${empty('Sin actividades para mostrar', 'Prueba con otra búsqueda o quita el filtro de contratista.')}</td></tr>`}</tbody>
    </table>`;
  }

  function planSummaryHtml() {
    const list = commitmentsWhere({ weeks: planWeeks() });
    const st = stats(list);
    return `<span><b>${st.total}</b> compromisos</span><span class="t-good"><b>${st.done}</b> cumplidos</span>
      <span class="t-bad"><b>${st.fail}</b> no cumplidos</span><span class="t-muted"><b>${st.pending}</b> pendientes</span>`;
  }

  function viewTableros() {
    const p = project();
    const weeks = planWeeks();
    const wTxt = weeks.length ? (weeks.length === 1 ? `semana ${weeks[0]}` : `semanas ${weeks[0]} a ${weeks[weeks.length - 1]}`) : '';
    const actions = `<button type="button" class="btn btn-soft btn-sm" data-action="new-activity">${I.plus}<span>Actividad</span></button>
      <button type="button" class="btn btn-primary btn-sm" data-action="new-commitment">${I.plus}<span>Compromiso</span></button>`;

    if (!projActs().length) {
      return `${pageHead('Tableros', 'Planificación por actividad y día.', actions)}
        <section class="card">${empty('Este proyecto aún no tiene actividades', 'Crea la primera actividad para empezar a programar compromisos.', `<button type="button" class="btn btn-primary" data-action="new-activity">${I.plus}<span>Crear actividad</span></button>`)}</section>`;
    }

    const legend = `<div class="plan-legend" aria-label="Leyenda">
      ${p.sectors.map((s) => `<span style="--c:${s.color}"><i></i>${esc(s.code)}${s.code !== s.name ? ` <small>${esc(s.name)}</small>` : ''}</span>`).join('')}
      <span class="lg-sep"><i class="lg-ok">${I.check}</i>Cumplió</span>
      <span><i class="lg-ko">${I.x}</i>No cumplió</span>
      <span><em class="chip-cause lg-cause">5</em>Número de la causa</span>
    </div>`;

    return `${pageHead('Tableros', `${esc(p.name)}, ${wTxt}`, actions, 'compact')}
      ${pendingStrip(S.projectId)}
      <div class="plan-controls">
        <label class="pc-field"><span>Desde semana</span><select data-change="plan-from">${weekOptions(clamp(S.planFrom, 1, MAX_WEEK), true)}</select></label>
        <label class="pc-field"><span>Semanas</span><select data-change="plan-count">${range(1, 8).map((n) => `<option value="${n}"${n === S.planCount ? ' selected' : ''}>${n} sem.</option>`).join('')}</select></label>
        <button type="button" class="btn btn-soft pc-today" data-action="plan-today">${I.crosshair}<span>Ir a hoy</span></button>
        <label class="pc-field pc-search"><span class="sr-only">Buscar actividad</span>
          <span class="search-wrap">${I.search}<input type="search" placeholder="Buscar actividad" value="${esc(S.planSearch)}" data-input="plan-search" autocomplete="off"></span></label>
        <label class="pc-field pc-contractor"><span class="sr-only">Contratista</span>
          <select data-change="plan-contractor">${contractorOptions(S.planContractor, projectContractors(), 'Todos los contratistas')}</select></label>
      </div>
      <div class="plan-board" id="planBoard" tabindex="0" role="region" aria-label="Tablero de planificación, se desplaza en horizontal">${planGridHtml()}</div>
      <div class="stat-strip" id="planSummary">${planSummaryHtml()}</div>
      ${legend}`;
  }

  function scrollBoardToToday() {
    const board = $('#planBoard');
    if (!board) return;
    const th = board.querySelector('.day-th.is-today');
    if (!th) { board.scrollLeft = 0; return; }
    const sticky = board.querySelector('.corner');
    const stickyW = sticky ? sticky.getBoundingClientRect().width : 0;
    const b = board.getBoundingClientRect(), r = th.getBoundingClientRect();
    board.scrollLeft += r.left - b.left - stickyW - 6;
  }
  function refreshPlanGrid() {
    const board = $('#planBoard');
    if (!board) return;
    const sl = board.scrollLeft, st = board.scrollTop;
    board.innerHTML = planGridHtml();
    board.scrollLeft = sl; board.scrollTop = st;
    const sum = $('#planSummary');
    if (sum) sum.innerHTML = planSummaryHtml();
  }

  /* =========================================================
     EXPORTACIÓN (Excel = CSV con «;» · PDF = diálogo de impresión)
     ========================================================= */
  const stripHtml = (h) => String(h == null ? '' : h).replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

  function exportCSV() {
    const ex = S.exp;
    if (!ex || !ex.tables.length) { toast('No hay nada para exportar en esta pantalla.', 'info'); return; }
    const q = (v) => { const s = stripHtml(v); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [];
    lines.push(q(`Araucaria Last Planner · ${project().name} · ${ex.title}`));
    lines.push(q(`Generado ${fmtStamp(stamp())} por ${S.operator}`));
    ex.tables.forEach((t) => {
      lines.push('');
      lines.push(q(t.title));
      lines.push(t.headers.map(q).join(';'));
      t.rows.forEach((r) => lines.push(r.cells.map(q).join(';')));
    });
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${norm(ex.name).replace(/[^a-z0-9]+/g, '_')}_${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Archivo de Excel descargado (.csv).');
  }
  function exportPDF() {
    toast('Se abrirá la impresión: elige «Guardar como PDF».', 'info');
    setTimeout(() => window.print(), 350);
  }
  const printHead = (title, sub) => `<div class="print-head"><strong>Araucaria · Last Planner</strong><span>${esc(project().name)} · ${esc(title)}${sub ? ` · ${esc(sub)}` : ''} · ${esc(fmtStamp(stamp()))}</span></div>`;

  /* =========================================================
     VISTA: CALIFICACIÓN SEMANAL
     ========================================================= */
  function scoreDraftCount() {
    const prefix = `${S.projectId}|${S.scoreWeek}|`;
    return Object.keys(S.scoreDraft).filter((k) => k.startsWith(prefix)).length;
  }

  function scoreSummary(rows) {
    const win = rows.find((r) => r.winner);
    const exc = rows.filter((r) => r.state === 'exc');
    const scored = rows.filter((r) => r.calc.complete && r.state !== 'nodata');
    const avg = scored.length ? r1(scored.reduce((s, r) => s + r.calc.final, 0) / scored.length) : null;
    const mk = monthOfWeek(S.scoreWeek);
    const mWin = monthRows(mk).find((r) => r.winner);
    return `<section class="kpi win-card"><span class="kpi-ico k-win">${I.trophy}</span><p class="kpi-label">Ganador de la semana</p>
        <p class="kpi-value kpi-name">${win ? esc(win.name) : 'Sin ganador'}</p><p class="kpi-foot">${win ? `${fmt1(win.calc.final)} puntos` : 'Nadie cumple las condiciones aún'}</p></section>
      <section class="kpi"><span class="kpi-ico k-exc">${I.star}</span><p class="kpi-label">Excelencia</p><p class="kpi-value">${exc.length}</p><p class="kpi-foot">${exc.length ? esc(exc.map((r) => r.name).join(', ')) : 'Ningún contratista'}</p></section>
      <section class="kpi"><span class="kpi-ico k-total">${I.calendar}</span><p class="kpi-label">Ganador de ${esc(monthLabel(mk).toLowerCase())}</p><p class="kpi-value kpi-name">${mWin ? esc(mWin.name) : 'Aún no hay'}</p><p class="kpi-foot">${mWin ? `${fmt1(mWin.calc.final)} puntos` : `Requiere ${CFG.minWeeksMonth} semanas calificadas`}</p></section>
      <section class="kpi"><span class="kpi-ico k-done">${I.users}</span><p class="kpi-label">Promedio de la semana</p><p class="kpi-value">${avg == null ? '—' : fmt1(avg)}</p><p class="kpi-foot">${scored.length} de ${rows.length} calificados</p></section>`;
  }

  const rulesBox = () => {
    const w = CFG.weights;
    return `<details class="card rules">
    <summary>${I.info}<span>Cómo se calcula la calificación</span></summary>
    <div class="rules-body">
      <p><b>Calidad y Limpieza</b> llegan solas de la calificación diaria de cada actividad: es el promedio de los días en que sí se trabajó. Se pueden corregir a mano (queda marcado «editado»).</p>
      <p><b>Seguridad</b> y <b>Personal</b> (cantidad de personas que trajo el contratista) se cargan aquí, normalmente el sábado.</p>
      <p><b>Puntaje base</b> = PPC × ${w.ppc}% + Calidad × ${w.calidad}% + Seguridad × ${w.seguridad}% + Limpieza × ${w.limpieza}% (cada nota llevada a escala 0–100).</p>
      <p><b>Final</b> = base × FM × factor de falta grave (×${String(CFG.faltaFactor).replace('.', ',')} si hubo falta grave). El <b>FM</b> se busca según el personal semanal. Sin tope: el final puede pasar de 100.</p>
      <p><b>Falta grave:</b> el contratista queda fuera del ranking semanal y del bonus.</p>
      <p><b>Elegible</b>: criterios completos, sin falta grave, al menos ${CFG.minCompWeek} compromisos evaluados y final de ${CFG.minFinal} o más. <b>Excelencia</b>: final de ${CFG.excFinal} o más y PPC de ${CFG.excPpc}% o más.</p>
      <p class="t-muted">Todos estos valores se editan en Ajustes, sección Fórmula.</p>
    </div>
  </details>`;
  };

  function scoreCardOut(r) {
    return `<div class="sc-out" data-out="${r.cid}">
      <div><span>Base</span><strong>${fmt1(r.calc.base)}</strong></div>
      <div><span>FM</span><strong>×${fmt2(r.calc.fm)}</strong></div>
      <div class="sc-final"><span>Final${r.v.falta ? ' (falta ×' + String(r.calc.factor).replace('.', ',') + ')' : ''}</span><strong>${fmt1(r.calc.final)}</strong></div>
    </div>`;
  }

  function scoreCardHtml(r) {
    const week = S.scoreWeek;
    const auto = r.v.auto;
    const numField = (field, label, max, step, extra = '') => {
      const val = r.v[field];
      const bad = isNum(val) && (Number(val) < 0 || Number(val) > max);
      const edited = (field === 'calidad' && r.v.calidadEdited) || (field === 'limpieza' && r.v.limpiezaEdited);
      return `<label class="num-field"><span>${label}${edited ? ' <em class="ed-tag">editado</em>' : ''}</span>
        <input type="number" inputmode="decimal" min="0" max="${max}" step="${step}" value="${esc(val)}" placeholder="0–${max}"
          data-input="score" data-cid="${r.cid}" data-field="${field}" data-max="${max}" class="${bad ? 'invalid' : ''}"${r.state === 'nodata' ? ' disabled' : ''}>${extra}</label>`;
    };
    return `<article class="score-card${r.winner ? ' is-winner' : ''}${r.v.falta ? ' has-falta' : ''}" data-cid="${r.cid}">
      <header class="sc-head"><div><h3>${esc(r.name)}</h3><p>${esc(r.specialty)}</p></div><span class="sc-state" data-state="${r.cid}">${statePill(r)}</span></header>
      <div class="sc-ppc"><div><span>PPC de la semana</span><small>Se calcula de la evaluación diaria</small></div>
        <strong class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</strong><em>${r.st.done} de ${r.st.evaluated}</em></div>
      <p class="sc-auto">${auto.days ? `Calidad y Limpieza: promedio de <b>${auto.days}</b> ${auto.days === 1 ? 'día trabajado' : 'días trabajados'} de ${auto.total} con compromiso.` : 'Aún no hay días calificados esta semana.'}</p>
      <div class="sc-inputs">
        ${numField('calidad', 'Calidad', 10, 0.1)}${numField('limpieza', 'Limpieza', 10, 0.1)}
        ${numField('seguridad', 'Seguridad', 10, 0.1)}${numField('personal', 'Personal (personas)', 500, 1)}
      </div>
      <label class="switch"><input type="checkbox" data-change="score-falta" data-cid="${r.cid}"${r.v.falta ? ' checked' : ''}${r.state === 'nodata' ? ' disabled' : ''}><span class="switch-ui" aria-hidden="true"></span><span>Hubo falta grave <small>queda fuera del ranking y del bonus</small></span></label>
      ${scoreCardOut(r)}
    </article>`;
  }

  function viewCalificacion() {
    const week = S.scoreWeek;
    const rows = weekRows(week, true);
    const tabs = [['calificar', 'Calificar'], ['ranking', 'Ranking'], ['mes', 'Ganador del mes'], ['historico', 'Histórico']];
    let body = '';
    const tables = [];

    // Notas de Seguridad / Personal: aviso si hoy no es sábado
    const notSat = week === curWeek() && dayIdx(today()) !== 5;
    const notice = notSat
      ? `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Seguridad y Personal se califican los sábados</strong><span>Hoy es ${DOW_LONG[dayIdx(today())].toLowerCase()}: puedes llenarlos igual, pero lo normal es hacerlo el sábado.</span></p></div>` : '';

    if (S.scoreTab === 'calificar') {
      body = rows.length
        ? `${notice}<div class="score-grid">${rows.map(scoreCardHtml).join('')}</div>${saveBar('score', scoreDraftCount(), 'Guardar')}`
        : `<section class="card">${empty('No hay contratistas con compromisos esta semana', 'La calificación aparece cuando hay compromisos en el tablero.')}</section>`;
      tables.push({
        title: `Calificación semanal, semana ${week}`,
        headers: ['Contratista', 'PPC', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'FM', 'Falta grave', 'Final', 'Estado'],
        rows: rows.map((r) => ({ cells: [r.name, pctTxt(r.st.ppc), fmt1(r.v.calidad || 0), fmt1(r.v.seguridad || 0), fmt1(r.v.limpieza || 0), r.v.personal, fmt2(r.calc.fm), r.v.falta ? 'Sí' : 'No', fmt1(r.calc.final), r.winner ? 'Ganador' : STATE_LABEL[r.state]] }))
      });
    } else if (S.scoreTab === 'ranking') {
      const ranked = rows.filter((r) => !r.v.falta);
      const out = rows.filter((r) => r.v.falta);
      body = `${ranked.length ? `<section class="card"><div class="card-head"><div><h2>Ranking de la semana ${week}</h2><p class="card-sub">Puntaje final. Incluye cambios aún no guardados.</p></div></div>
        <ol class="rank-list">${ranked.map((r, i) => `<li class="${r.winner ? 'is-winner' : ''}">
          <span class="rank-pos">${r.state === 'nodata' ? '–' : i + 1}</span>
          <div class="rank-body"><div class="bar-top"><span class="bar-name">${esc(r.name)}<small>PPC ${pctTxt(r.st.ppc)}, ${esc(r.reason.toLowerCase())}</small></span><strong>${r.state === 'nodata' ? '—' : `${fmt1(r.calc.final)} pts`}</strong></div>
            <span class="bar-track"><span class="bar-fill ${r.state === 'noelig' || r.state === 'incomplete' ? 'tone-muted' : ''}" style="width:${Math.min(r.calc.final, 100)}%"></span></span></div>
          ${statePill(r)}
        </li>`).join('')}</ol></section>` : `<section class="card">${empty('Sin datos esta semana', '')}</section>`}
        ${out.length ? `<section class="card card-falta"><div class="card-head"><div><h2>Fuera del ranking por falta grave</h2><p class="card-sub">No participan del ranking ni del bonus semanal.</p></div></div>
          <ul class="cfg-list">${out.map((r) => `<li><div><strong>${esc(r.name)}</strong><small>${esc(r.specialty)}, puntaje ${fmt1(r.calc.final)}</small></div><span class="pill pill-noelig">Falta grave</span></li>`).join('')}</ul></section>` : ''}`;
      tables.push({
        title: `Ranking de la semana ${week}`,
        headers: ['Posición', 'Contratista', 'PPC', 'Final', 'Estado'],
        rows: ranked.map((r, i) => ({ cells: [r.state === 'nodata' ? '-' : i + 1, r.name, pctTxt(r.st.ppc), r.state === 'nodata' ? '-' : fmt1(r.calc.final), r.winner ? 'Ganador' : STATE_LABEL[r.state]] }))
          .concat(out.map((r) => ({ cells: ['Fuera', r.name, pctTxt(r.st.ppc), fmt1(r.calc.final), 'Falta grave'] })))
      });
    } else if (S.scoreTab === 'mes') {
      const months = allMonths();
      if (!S.month || !months.includes(S.month)) S.month = monthOfWeek(week);
      const mr = monthRows(S.month);
      const win = mr.find((r) => r.winner);
      const head = ['Contratista', 'Semanas', 'Compromisos', 'PPC mes', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'Final', 'Estado'];
      const trs = mr.map((r) => ({ cls: r.winner ? 'hl' : '', cells: [`<strong>${esc(r.name)}</strong>`, r.weeks, r.st.evaluated, `<span class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</span>`,
        isNum(r.v.calidad) ? fmt1(r.v.calidad) : '—', isNum(r.v.seguridad) ? fmt1(r.v.seguridad) : '—', isNum(r.v.limpieza) ? fmt1(r.v.limpieza) : '—', isNum(r.v.personal) ? r.v.personal : '—',
        `<strong>${fmt1(r.calc.final)}</strong>`, statePill(r)] }));
      body = `<section class="card">
        <div class="card-head"><div><h2>Ganador de ${esc(monthLabel(S.month).toLowerCase())}</h2><p class="card-sub">Semanas ${weeksOfMonth(S.month).join(', ') || '—'}. La semana pertenece al mes de su jueves.</p></div>
          <label class="select-inline"><span class="sr-only">Mes</span><select data-change="score-month">${months.map((m) => `<option value="${m}"${m === S.month ? ' selected' : ''}>${monthLabel(m)}</option>`).join('')}</select></label></div>
        ${win ? `<div class="winner-banner">${I.trophy}<div><strong>${esc(win.name)}</strong><span>${fmt1(win.calc.final)} puntos, PPC mensual ${pctTxt(win.st.ppc)}</span></div></div>` : `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Aún no hay ganador este mes</strong><span>Nadie cumple todas las condiciones.</span></p></div>`}
        ${mr.length ? rtable(head, trs) : empty('Sin datos en este mes', '')}
      </section>`;
      tables.push({ title: `Ganador de ${monthLabel(S.month)}`, headers: head, rows: trs });
    } else {
      const all = [];
      dataWeeks().forEach((w) => weekRows(w, false).forEach((r) => { if (r.v.saved) all.push(r); }));
      const filtered = all.filter((r) => !S.histContractor || r.cid === S.histContractor).sort((a, b) => b.week - a.week || b.calc.final - a.calc.final);
      const head = ['Contratista', 'Semana', 'PPC', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'Final', 'Estado', 'Nota'];
      const trs = filtered.map((r) => ({ cls: r.winner ? 'hl' : '', cells: [`<strong>${esc(r.name)}</strong>`, `S${r.week}`, `<span class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</span>`,
        isNum(r.v.calidad) ? fmt1(r.v.calidad) : '—', isNum(r.v.seguridad) ? fmt1(r.v.seguridad) : '—', isNum(r.v.limpieza) ? fmt1(r.v.limpieza) : '—', r.v.personal === '' ? '—' : r.v.personal,
        `<strong>${fmt1(r.calc.final)}</strong>`, statePill(r), `<span class="t-muted note-cell">${esc(r.v.note || '—')}</span>`] }));
      body = `<section class="card">
        <div class="card-head"><div><h2>Histórico de calificaciones</h2><p class="card-sub">${filtered.length} calificaciones guardadas</p></div>
          <label class="select-inline"><span class="sr-only">Contratista</span><select data-change="hist-contractor">${contractorOptions(S.histContractor, projectContractors(), 'Todos')}</select></label></div>
        ${filtered.length ? rtable(head, trs) : empty('Sin calificaciones guardadas', '')}
      </section>`;
      tables.push({ title: 'Histórico de calificaciones', headers: head, rows: trs });
    }

    S.exp = { name: `Calificacion_${S.scoreTab}_semana_${week}`, title: `Calificación, ${tabs.find((t) => t[0] === S.scoreTab)[1]}`, tables };
    const wn = `<div class="week-nav" role="group" aria-label="Semana">
        <button type="button" class="wn-btn" data-action="score-week-prev" aria-label="Semana anterior"${week <= 1 ? ' disabled' : ''}>${I.chevL}</button>
        <div class="wn-label"><strong>Semana ${week}${week === curWeek() ? ' <em>actual</em>' : ''}</strong></div>
        <button type="button" class="wn-btn" data-action="score-week-next" aria-label="Semana siguiente"${week >= MAX_WEEK ? ' disabled' : ''}>${I.chevR}</button></div>`;

    return `${pageHead('Calificación semanal', 'Calidad y Limpieza vienen de la calificación diaria. Aquí se completan Seguridad y Personal.', `${wn}${exportBtns('hide-sm')}`)}
      ${printHead('Calificación semanal', `semana ${week}`)}
      <div class="kpi-grid kpi-grid-4" id="scoreSummary">${scoreSummary(rows)}</div>
      <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button type="button" role="tab" class="${S.scoreTab === id ? 'active' : ''}" aria-selected="${S.scoreTab === id}" data-action="score-tab" data-tab="${id}">${label}</button>`).join('')}</div>
      ${S.scoreTab === 'calificar' ? rulesBox() : ''}
      ${body}
      <div class="page-foot only-sm"><p>Exportar calificación</p>${exportBtns()}</div>`;
  }

  // Recalcula puntajes sin redibujar los campos (para no perder el foco al escribir)
  function refreshScores() {
    const rows = weekRows(S.scoreWeek, true);
    rows.forEach((r) => {
      const out = document.querySelector(`[data-out="${r.cid}"]`);
      if (out) out.outerHTML = scoreCardOut(r);
      const stEl = document.querySelector(`[data-state="${r.cid}"]`);
      if (stEl) stEl.innerHTML = statePill(r);
      const card = document.querySelector(`.score-card[data-cid="${r.cid}"]`);
      if (card) { card.classList.toggle('is-winner', r.winner); card.classList.toggle('has-falta', r.v.falta); }
      // etiquetas «editado»
      ['calidad', 'limpieza'].forEach((f) => {
        const inp = document.querySelector(`.score-card[data-cid="${r.cid}"] input[data-field="${f}"]`);
        if (!inp) return;
        const lab = inp.closest('.num-field').firstElementChild;
        const has = lab.querySelector('.ed-tag');
        const ed = f === 'calidad' ? r.v.calidadEdited : r.v.limpiezaEdited;
        if (ed && !has) lab.insertAdjacentHTML('beforeend', ' <em class="ed-tag">editado</em>');
        if (!ed && has) has.remove();
      });
    });
    const sum = $('#scoreSummary');
    if (sum) sum.innerHTML = scoreSummary(rows);
    const bar = $('#scoreSavebar');
    if (bar) bar.outerHTML = saveBar('score', scoreDraftCount(), 'Guardar');
    renderNav();
  }

  /* =========================================================
     VISTA: REPORTES (toda la información, con filtros)
     ========================================================= */
  const REP_TABS = [['ppc', 'PPC'], ['causas', 'Causas'], ['calidad', 'Calidad y limpieza'], ['asistencia', 'Asistencia'], ['tardias', 'Calificaciones tardías'], ['ranking', 'Ranking'], ['log', 'Bitácora']];

  function repWeeks() {
    if (S.repTo < S.repFrom) S.repTo = S.repFrom;
    return range(S.repFrom, S.repTo);
  }
  function repList() {
    let list = live(commitmentsWhere({ weeks: repWeeks() }));
    if (S.repContractor) list = list.filter((c) => contractorIdOf(c) === S.repContractor);
    if (S.repActivity) list = list.filter((c) => (activity(c.activityId) || {}).name === S.repActivity);
    return list;
  }
  const tblCard = (t, sub = '') => `<section class="card"><div class="card-head"><div><h2>${t.title}</h2>${sub ? `<p class="card-sub">${sub}</p>` : ''}</div></div>${t.rows.length ? rtable(t.headers, t.rows) : empty('Sin datos', 'No hay registros con estos filtros.')}</section>`;
  const actName = (c) => { const a = activity(c.activityId); return a ? a.name : ''; };
  const ctName = (c) => { const x = contractor(contractorIdOf(c)); return x ? x.name : ''; };
  const yn = (v) => (v === true ? 'Sí' : v === false ? 'No' : '—');

  function repPPC(list, weeks, tables) {
    const st = stats(list);
    const kpis = `<div class="kpi-grid kpi-grid-4">
      <section class="kpi"><span class="kpi-ico k-win">${I.trophy}</span><p class="kpi-label">PPC general</p><p class="kpi-value t-${tone(st.ppc)}">${pctTxt(st.ppc)}</p><p class="kpi-foot">${st.done} de ${st.evaluated} evaluados</p></section>
      <section class="kpi"><span class="kpi-ico k-total">${I.calendar}</span><p class="kpi-label">Compromisos</p><p class="kpi-value">${st.total}</p><p class="kpi-foot">en el período</p></section>
      <section class="kpi"><span class="kpi-ico k-done">${I.check}</span><p class="kpi-label">Cumplidos</p><p class="kpi-value">${st.done}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.done / st.evaluated) * 100) : 0}%</p></section>
      <section class="kpi"><span class="kpi-ico k-fail">${I.x}</span><p class="kpi-label">No cumplidos</p><p class="kpi-value">${st.fail}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.fail / st.evaluated) * 100) : 0}%</p></section>
    </div>`;
    const wk = weeks.map((w) => { const s = stats(list.filter((c) => weekDates(w).includes(c.date))); return { label: `S${w}`, value: s.ppc, active: w === curWeek(), title: `${s.done} de ${s.evaluated} cumplidos`, s, w }; });
    const trend = weeks.length > 1 ? lineChart(wk) : columnChart(wk);
    const perDay = range(0, 5).map((i) => { const s = stats(list.filter((c) => dayIdx(c.date) === i)); return { label: DOW[i], value: s.ppc, title: `${s.done} de ${s.evaluated}` }; });
    const cRows = [...new Set(list.map(contractorIdOf).filter(Boolean))].map((id) => ({ id, name: (contractor(id) || {}).name || '—', spec: (contractor(id) || {}).specialty || '', s: stats(list.filter((c) => contractorIdOf(c) === id)) }))
      .sort((a, b) => (b.s.ppc == null ? -1 : b.s.ppc) - (a.s.ppc == null ? -1 : a.s.ppc) || cmpEs(a.name, b.name));
    const bars = cRows.length ? `<div class="bars">${cRows.map((r) => `<div class="bar-row static"><span class="bar-top"><span class="bar-name">${esc(r.name)}<small>${esc(r.spec)}, ${r.s.done} de ${r.s.evaluated}</small></span><strong class="t-${tone(r.s.ppc)}">${pctTxt(r.s.ppc)}</strong></span>
        <span class="bar-track"><span class="bar-fill tone-${tone(r.s.ppc)}" style="width:${r.s.ppc || 0}%"></span></span></div>`).join('')}</div>` : empty('Sin compromisos', '');
    tables.push({ title: 'PPC por semana', headers: ['Semana', 'Compromisos', 'Cumplidos', 'No cumplidos', 'Pendientes', 'PPC'],
      rows: wk.map((x) => ({ cells: [`Semana ${x.w}`, x.s.total, x.s.done, x.s.fail, x.s.pending, pctTxt(x.s.ppc)] })) });
    const perAct = {};
    list.forEach((c) => { (perAct[c.activityId] = perAct[c.activityId] || []).push(c); });
    tables.push({ title: 'PPC por actividad', headers: ['Actividad', 'Contratista', 'Compromisos', 'Cumplidos', 'No cumplidos', 'PPC'],
      rows: Object.keys(perAct).map((id) => { const s = stats(perAct[id]); return { cells: [esc(actName(perAct[id][0])), esc(ctName(perAct[id][0])), s.total, s.done, s.fail, `<span class="t-${tone(s.ppc)}">${pctTxt(s.ppc)}</span>`], k: s.ppc == null ? -1 : s.ppc }; })
        .sort((a, b) => a.k - b.k) });
    return `${kpis}<div class="dash-grid">
      <section class="card"><div class="card-head"><div><h2>Tendencia del PPC</h2><p class="card-sub">Por semana. Línea punteada: meta de ${CFG.meta}%.</p></div></div>${trend}</section>
      <section class="card"><div class="card-head"><div><h2>PPC por día de la semana</h2><p class="card-sub">Todas las semanas del período juntas</p></div></div>${columnChart(perDay)}</section>
      <section class="card span-2"><div class="card-head"><div><h2>PPC por contratista</h2></div></div>${bars}</section>
    </div>${tblCard(tables[0])}${tblCard(tables[1])}`;
  }

  function repCausas(list, weeks, tables) {
    let fails = list.filter((c) => c.status === 'fail');
    if (S.repCause) fails = fails.filter((c) => c.causeId === S.repCause);
    const slices = causeSlices(fails);
    const dd = project().delayDays || 1;
    const donutHtml = fails.length
      ? `<div class="donut-wrap">${donut(slices, fails.length)}<div class="legend">${slices.map((s) => `<div class="lg-item static"><i style="background:${s.color}"></i><span class="lg-name"><span class="cause-num">${s.num}</span> ${esc(s.name)}</span><span class="lg-count">${s.count}</span><strong>${Math.round((s.count / fails.length) * 100)}%</strong></div>`).join('')}</div></div>`
      : empty('Sin incumplimientos', 'No hay incumplimientos con estos filtros.');
    tables.push({ title: 'Causas de incumplimiento y días perdidos', headers: ['N.º', 'Causa', 'Incumplimientos', '% del total', 'Retrasaron la obra', 'Días perdidos'],
      rows: slices.map((s) => { const n = fails.filter((c) => c.causeId === s.id && c.delayed === true).length; return { cells: [`<span class="cause-num">${s.num}</span>`, esc(s.name), s.count, `${Math.round((s.count / fails.length) * 100)}%`, n, n * dd] }; }) });
    // Días perdidos, gráfica de barras
    const lostBars = slices.map((s) => ({ s, n: fails.filter((c) => c.causeId === s.id && c.delayed === true).length * dd })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
    const lostHtml = lostBars.length
      ? `<div class="bars">${lostBars.map((x) => `<div class="bar-row static"><span class="bar-top"><span class="bar-name"><span class="cause-num">${x.s.num}</span> ${esc(x.s.name)}</span><strong>${x.n} ${x.n === 1 ? 'día' : 'días'}</strong></span><span class="bar-track"><span class="bar-fill tone-bad" style="width:${(x.n / lostBars[0].n) * 100}%"></span></span></div>`).join('')}</div>`
      : empty('Sin días perdidos', 'Ningún incumplimiento fue marcado como «retrasó la obra».');
    // Causa × contratista
    const cids = [...new Set(fails.map(contractorIdOf).filter(Boolean))].sort((a, b) => cmpEs((contractor(a) || {}).name, (contractor(b) || {}).name));
    tables.push({ title: 'Causa por contratista', headers: ['Causa'].concat(cids.map((id) => (contractor(id) || {}).name || '—')).concat(['Total']),
      rows: slices.map((s) => ({ cells: [`<span class="cause-num">${s.num}</span> ${esc(s.name)}`].concat(cids.map((id) => fails.filter((c) => c.causeId === s.id && contractorIdOf(c) === id).length || '·')).concat([`<strong>${s.count}</strong>`]) })) });
    // Contratistas con más incumplimientos
    const all = list;
    const worst = cids.map((id) => {
      const mine = all.filter((c) => contractorIdOf(c) === id), f = fails.filter((c) => contractorIdOf(c) === id);
      const top = causeSlices(f)[0];
      return { name: (contractor(id) || {}).name || '—', f: f.length, t: stats(mine).evaluated, top };
    }).sort((a, b) => b.f - a.f || cmpEs(a.name, b.name));
    tables.push({ title: 'Contratistas con más incumplimientos', headers: ['Contratista', 'Incumplimientos', 'Evaluados', '% incumplido', 'Causa principal'],
      rows: worst.map((r) => ({ cells: [`<strong>${esc(r.name)}</strong>`, r.f, r.t, r.t ? `${Math.round((r.f / r.t) * 100)}%` : '—', r.top ? `${r.top.num} · ${esc(r.top.name)}` : '—'] })) });
    tables.push({ title: 'Detalle de incumplimientos', headers: ['Fecha', 'Contratista', 'Actividad', 'Ubicación', 'Causa', '¿Retrasó?', 'Observación'],
      rows: fails.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map((c) => ({ cells: [fmtDay(c.date), esc(ctName(c)), esc(actName(c)), esc(locText(c)), `<span class="cause-num">${causeNum(c.causeId)}</span> ${esc((cause(c.causeId) || {}).name)}`, yn(c.delayed), `<span class="t-muted note-cell">${esc(c.note || '—')}</span>`] })) });
    return `<div class="dash-grid">
      <section class="card"><div class="card-head"><div><h2>Causas generales</h2><p class="card-sub">${fails.length} incumplimientos${S.repCause ? ' (filtrado por causa)' : ''}</p></div></div>${donutHtml}</section>
      <section class="card"><div class="card-head"><div><h2>Días perdidos por causa</h2><p class="card-sub">Cada «sí retrasó» suma ${dd} ${dd === 1 ? 'día' : 'días'}. Muestra qué causa atrasa más la obra.</p></div></div>${lostHtml}</section>
    </div>${tables.map((t) => tblCard(t)).join('')}`;
  }

  function repCalidad(list, weeks, tables) {
    const rated = list.map((c) => ({ c, r: rating(c) })).filter((x) => x.r);
    const cids = [...new Set(rated.map((x) => contractorIdOf(x.c)))].sort((a, b) => cmpEs((contractor(a) || {}).name, (contractor(b) || {}).name));
    const avg = (xs) => (xs.length ? fmt1(xs.reduce((s, v) => s + Number(v), 0) / xs.length) : '—');
    tables.push({ title: 'Calidad y limpieza por contratista', headers: ['Contratista', 'Calificados', 'Calidad prom.', 'Limpieza prom.', 'No trabajó', 'Tardías'],
      rows: cids.map((id) => {
        const mine = rated.filter((x) => contractorIdOf(x.c) === id), w = mine.filter((x) => x.r.worked !== false);
        return { cells: [`<strong>${esc((contractor(id) || {}).name || '—')}</strong>`, mine.length, avg(w.map((x) => x.r.calidad)), avg(w.map((x) => x.r.limpieza)), mine.length - w.length, mine.filter((x) => x.r.late).length] };
      }) });
    tables.push({ title: 'Detalle diario de calificaciones', headers: ['Fecha', 'Contratista', 'Actividad', 'Ubicación', '¿Trabajó?', 'Calidad', 'Limpieza', 'Calificó', 'Tardía'],
      rows: rated.slice().sort((a, b) => (a.c.date < b.c.date ? 1 : -1)).map((x) => ({ cells: [fmtDay(x.c.date), esc(ctName(x.c)), esc(actName(x.c)), esc(locText(x.c)), x.r.worked === false ? 'No' : 'Sí', x.r.worked === false ? '—' : fmt1(x.r.calidad), x.r.worked === false ? '—' : fmt1(x.r.limpieza), esc(x.r.by || '—'), x.r.late ? '<span class="pill pill-incomplete">Tardía</span>' : ''] })) });
    return tables.map((t) => tblCard(t)).join('');
  }

  function attEntries() {
    const dset = new Set(repWeeks().flatMap(weekDates));
    return Object.keys(DB.attendance).map((k) => {
      const [pid, cid, date, m] = k.split('|');
      return Object.assign({ pid, cid, date, m }, DB.attendance[k]);
    }).filter((e) => e.pid === S.projectId && dset.has(e.date) && (!S.repContractor || e.cid === S.repContractor));
  }
  function repAsistencia(list, weeks, tables) {
    const es = attEntries();
    const cids = [...new Set(es.map((e) => e.cid))].sort((a, b) => cmpEs((contractor(a) || {}).name, (contractor(b) || {}).name));
    tables.push({ title: 'Llegadas tarde y faltas por contratista', headers: ['Contratista', 'Llegó', 'Tarde', 'No llegó', 'Reuniones registradas'],
      rows: cids.map((id) => { const mine = es.filter((e) => e.cid === id); const n = (s) => mine.filter((e) => e.status === s).length; return { cells: [`<strong>${esc((contractor(id) || {}).name || '—')}</strong>`, n('ok'), `<span class="${n('late') ? 't-mid' : ''}">${n('late')}</span>`, `<span class="${n('no') ? 't-bad' : ''}">${n('no')}</span>`, mine.length], k: n('late') + n('no') * 2 }; }).sort((a, b) => b.k - a.k) });
    tables.push({ title: 'Detalle de asistencia', headers: ['Fecha', 'Reunión', 'Contratista', 'Estado', 'Registró'],
      rows: es.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.m < b.m ? 1 : -1))).map((e) => ({ cells: [fmtDay(e.date), MEETINGS[e.m], esc((contractor(e.cid) || {}).name || '—'), `<span class="pill ${e.status === 'ok' ? 'pill-elig' : e.status === 'late' ? 'pill-incomplete' : 'pill-noelig'}">${ATT[e.status]}</span>`, esc(e.by || '—')] })) });
    return `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Solo se cuentan llegadas tarde y faltas</strong><span>El sistema no calcula multas ni el refrigerio; eso se define con el cliente.</span></p></div>${tables.map((t) => tblCard(t)).join('')}`;
  }

  function repTardias(list, weeks, tables) {
    const t = today();
    const late = list.map((c) => ({ c, r: rating(c) })).filter((x) => x.r && x.r.late).sort((a, b) => (a.c.date < b.c.date ? 1 : -1));
    tables.push({ title: 'Calificaciones tardías', headers: ['Fecha del compromiso', 'Contratista', 'Actividad', 'Ubicación', 'Calificada el', 'Por'],
      rows: late.map((x) => ({ cells: [fmtDay(x.c.date), esc(ctName(x.c)), esc(actName(x.c)), esc(locText(x.c)), fmtStamp(x.r.at), esc(x.r.by || '—')] })) });
    const pend = list.filter((c) => c.date <= t && !ratingComplete(c)).sort(sortByDate);
    tables.push({ title: 'Compromisos sin calificar', headers: ['Fecha', 'Contratista', 'Actividad', 'Ubicación', 'Días de atraso'],
      rows: pend.map((c) => { const d = Math.round((parseISO(t) - parseISO(c.date)) / DAY); return { cells: [fmtDay(c.date), esc(ctName(c)), esc(actName(c)), esc(locText(c)), d === 0 ? 'Hoy' : `<span class="t-bad">${d} ${d === 1 ? 'día' : 'días'}</span>`] }; }) });
    const ops = DB.operators.map((o) => {
      const mine = list.map((c) => rating(c)).filter((r) => r && r.by === o);
      return { cells: [`<strong>${esc(o)}</strong>`, mine.length, mine.filter((r) => r.late).length] };
    });
    tables.push({ title: 'Quién calificó', headers: ['Operador', 'Calificaciones registradas', 'Tardías'], rows: ops });
    return `${tables.map((x) => tblCard(x)).join('')}`;
  }

  function repRanking(list, weeks, tables) {
    const rowsW = [];
    weeks.forEach((w) => weekRows(w, false).forEach((r) => { if (!S.repContractor || r.cid === S.repContractor) rowsW.push(r); }));
    rowsW.sort((a, b) => b.week - a.week || (a.v.falta - b.v.falta) || b.calc.final - a.calc.final);
    tables.push({ title: 'Ranking semanal', headers: ['Semana', 'Contratista', 'PPC', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'FM', 'Final', 'Estado'],
      rows: rowsW.map((r) => ({ cls: r.winner ? 'hl' : '', cells: [`S${r.week}`, `<strong>${esc(r.name)}</strong>`, pctTxt(r.st.ppc), isNum(r.v.calidad) ? fmt1(r.v.calidad) : '—', isNum(r.v.seguridad) ? fmt1(r.v.seguridad) : '—', isNum(r.v.limpieza) ? fmt1(r.v.limpieza) : '—', r.v.personal === '' ? '—' : r.v.personal, `×${fmt2(r.calc.fm)}`, `<strong>${fmt1(r.calc.final)}</strong>`, statePill(r)] })) });
    const months = [...new Set(weeks.map(monthOfWeek))].sort();
    tables.push({ title: 'Ganadores', headers: ['Período', 'Ganador', 'Puntaje'],
      rows: weeks.map((w) => { const win = weekRows(w, false).find((r) => r.winner); return { cells: [`Semana ${w}`, win ? esc(win.name) : '—', win ? fmt1(win.calc.final) : '—'] }; })
        .concat(months.map((mk) => { const win = monthRows(mk).find((r) => r.winner); return { cls: 'hl', cells: [esc(monthLabel(mk)), win ? esc(win.name) : '—', win ? fmt1(win.calc.final) : '—'] }; })) });
    return `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Falta grave</strong><span>Un contratista con falta grave queda fuera del ranking y del bonus de esa semana.</span></p></div>${tables.map((x) => tblCard(x)).join('')}`;
  }

  function repLog(tables) {
    let es = DB.log.slice();
    if (S.logWho) es = es.filter((e) => e.who === S.logWho);
    if (S.logType) es = es.filter((e) => e.type === S.logType);
    if (S.logDate) es = es.filter((e) => e.at.slice(0, 10) === S.logDate);
    const types = [...new Set(DB.log.map((e) => e.type))].sort();
    tables.push({ title: 'Bitácora de actividad', headers: ['Fecha y hora', 'Operador', 'Tipo', 'Detalle'],
      rows: es.map((e) => ({ cells: [fmtStamp(e.at), esc(e.who), esc(e.type), `<span class="note-cell">${esc(e.detail)}</span>`] })) });
    const shown = { title: tables[0].title, headers: tables[0].headers, rows: tables[0].rows.slice(0, 300) };
    return `<section class="card">
      <div class="rep-filters rep-filters-log">
        <label class="field"><span>Operador</span><select data-change="log-who"><option value="">Todos</option>${DB.operators.map((o) => `<option${o === S.logWho ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
        <label class="field"><span>Tipo de acción</span><select data-change="log-type"><option value="">Todas</option>${types.map((o) => `<option${o === S.logType ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
        <label class="field"><span>Fecha</span><input type="date" value="${esc(S.logDate)}" data-change="log-date"></label>
      </div>
      <p class="card-sub">${es.length} ${es.length === 1 ? 'registro' : 'registros'}${es.length > 300 ? ' (se muestran los 300 más recientes; el Excel incluye todos)' : ''}. Quién hizo qué y cuándo, incluyendo calificaciones tardías.</p>
      ${shown.rows.length ? rtable(shown.headers, shown.rows) : empty('Sin registros', 'Todavía no hay acciones con estos filtros.')}
    </section>`;
  }

  function viewReportes() {
    S.repFrom = clamp(S.repFrom, 1, MAX_WEEK);
    S.repTo = clamp(S.repTo, 1, MAX_WEEK);
    const weeks = repWeeks();
    const tables = [];
    const list = repList();
    let body = '';
    switch (S.repTab) {
      case 'ppc': body = repPPC(list, weeks, tables); break;
      case 'causas': body = repCausas(list, weeks, tables); break;
      case 'calidad': body = repCalidad(list, weeks, tables); break;
      case 'asistencia': body = repAsistencia(list, weeks, tables); break;
      case 'tardias': body = repTardias(list, weeks, tables); break;
      case 'ranking': body = repRanking(list, weeks, tables); break;
      default: body = repLog(tables);
    }
    const tabName = REP_TABS.find((t) => t[0] === S.repTab)[1];
    S.exp = { name: `Reporte_${tabName}`, title: `Reporte: ${tabName}`, tables };
    const acts = [...new Set(projActs().map((a) => a.name))].sort(cmpEs);
    const rangeTxt = `semanas ${weeks[0]} a ${weeks[weeks.length - 1]}`;
    const filters = S.repTab === 'log' ? '' : `<section class="card rep-card">
      <div class="rep-filters">
        <label class="field"><span>Desde semana</span><select data-change="rep-from">${weekOptions(S.repFrom)}</select></label>
        <label class="field"><span>Hasta semana</span><select data-change="rep-to">${weekOptions(S.repTo)}</select></label>
        <label class="field"><span>Contratista</span><select data-change="rep-contractor">${contractorOptions(S.repContractor, projectContractors(), 'Todos')}</select></label>
        <label class="field"><span>Actividad</span><select data-change="rep-activity"><option value="">Todas</option>${acts.map((n) => `<option${n === S.repActivity ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
        <label class="field"><span>Causa</span><select data-change="rep-cause"><option value="">Todas</option>${DB.causes.slice().sort((a, b) => a.num - b.num).map((k) => `<option value="${k.id}"${k.id === S.repCause ? ' selected' : ''}>${k.num} · ${esc(k.name)}</option>`).join('')}</select></label>
      </div>
      ${(S.repContractor || S.repActivity || S.repCause) ? `<button type="button" class="link-btn" data-action="rep-clear">Quitar filtros</button>` : ''}
    </section>`;
    return `${pageHead('Reportes', `${esc(project().name)}, ${rangeTxt}`, exportBtns('hide-sm'))}
      ${printHead(`Reporte: ${tabName}`, S.repTab === 'log' ? '' : rangeTxt)}
      <div class="tabs" role="tablist">${REP_TABS.map(([id, label]) => `<button type="button" role="tab" class="${S.repTab === id ? 'active' : ''}" aria-selected="${S.repTab === id}" data-action="rep-tab" data-tab="${id}">${label}</button>`).join('')}</div>
      ${filters}
      <div class="rep-body">${body}</div>
      <div class="page-foot only-sm"><p>Exportar reporte</p>${exportBtns()}</div>`;
  }

  /* =========================================================
     VISTA: AJUSTES
     ========================================================= */
  const CFG_TABS = [['proyectos', 'Proyectos'], ['contratistas', 'Contratistas'], ['sectores', 'Sectores'], ['pisos', 'Pisos'], ['causas', 'Causas'], ['especialidades', 'Especialidades'],
    ['formula', 'Fórmula'], ['tablero', 'Tableros'], ['sinobra', 'Días sin obra'], ['simulador', 'Simulador']];

  function formulaModel() {
    return S.fdraft || { weights: Object.assign({}, CFG.weights), faltaFactor: CFG.faltaFactor,
      th: { meta: CFG.meta, minFinal: CFG.minFinal, excFinal: CFG.excFinal, excPpc: CFG.excPpc, minCompWeek: CFG.minCompWeek, minWeeksMonth: CFG.minWeeksMonth, minCompMonth: CFG.minCompMonth },
      fm: CFG.fm.map((r) => Object.assign({}, r)) };
  }
  function readFormulaForm(form) {
    const g = (n) => { const el = form.elements[n]; return el ? el.value : ''; };
    const w = { ppc: parseNum(g('w_ppc')), calidad: parseNum(g('w_calidad')), seguridad: parseNum(g('w_seguridad')), limpieza: parseNum(g('w_limpieza')) };
    const th = {};
    ['meta', 'minFinal', 'excFinal', 'excPpc', 'minCompWeek', 'minWeeksMonth', 'minCompMonth'].forEach((k) => { th[k] = parseNum(g(k)); });
    const fm = [];
    for (let i = 0; form.elements[`fm_min_${i}`]; i++) fm.push({ min: parseNum(g(`fm_min_${i}`)), max: g(`fm_max_${i}`).trim() === '' ? null : parseNum(g(`fm_max_${i}`)), fm: parseNum(g(`fm_val_${i}`)) });
    return { weights: w, faltaFactor: parseNum(g('faltaFactor')), th, fm };
  }

  function viewAjustes() {
    const p = project();
    const delBtn = (action, id, label) => `<button type="button" class="tag-del" data-action="${action}" data-id="${esc(id)}" aria-label="Eliminar ${esc(label)}">${I.x}</button>`;
    let body = '';

    switch (S.cfgTab) {
      case 'proyectos':
        body = `<section class="card"><div class="card-head"><div><h2>Proyectos</h2><p class="card-sub">Cada edificio tiene sus propios sectores, pisos, actividades y compromisos. No se pueden duplicar: un proyecto nuevo se crea con sus propios datos.</p></div></div>
          <form class="inline-form" data-form="add-project"><label class="field grow"><span class="sr-only">Nombre del proyecto</span><input name="name" placeholder="Ej.: Edificio Distrito Parque" maxlength="60" autocomplete="off"></label><button type="submit" class="btn btn-primary">${I.plus}<span>Agregar proyecto</span></button></form>
          <ul class="cfg-list">${DB.projects.map((x) => {
            const nA = DB.activities.filter((a) => a.projectId === x.id).length;
            const nC = DB.commitments.filter((c) => c.projectId === x.id).length;
            return `<li class="cfg-proj${x.id === S.projectId ? ' current' : ''}">
              <div class="cp-top"><div><strong>${esc(x.name)}</strong><small>${nA} actividades, ${nC} compromisos, ${x.sectors.length} ${sectorWordPl(x).toLowerCase()}</small></div>
                <div class="cfg-actions">${x.id === S.projectId ? '<span class="pill pill-elig">En uso</span>' : `<button type="button" class="btn btn-soft btn-sm" data-action="cfg-use-project" data-id="${x.id}">Abrir</button>`}${delBtn('cfg-del-project', x.id, x.name)}</div></div>
              <div class="cp-fields">
                <label class="field"><span>Días de retraso por cada «sí retrasó la obra»</span><input type="number" min="0" max="30" step="1" value="${x.delayDays}" data-change="proj-delay" data-id="${x.id}"></label>
                <label class="field"><span>Nombre de las zonas</span><select data-change="proj-label" data-id="${x.id}"><option value="Sector"${x.sectorLabel !== 'Departamento' ? ' selected' : ''}>Sectores (obra)</option><option value="Departamento"${x.sectorLabel === 'Departamento' ? ' selected' : ''}>Departamentos (Post-Venta)</option></select></label>
              </div></li>`;
          }).join('')}</ul></section>`;
        break;
      case 'contratistas':
        body = `<section class="card"><div class="card-head"><div><h2>Contratistas y sus actividades</h2><p class="card-sub">Cada contratista tiene su lista de actividades. Cada actividad + contratista es una fila del tablero. Dos contratistas pueden compartir una actividad.</p></div></div>
          <form class="inline-form" data-form="add-contractor">
            <label class="field grow"><span class="sr-only">Nombre</span><input name="name" placeholder="Nombre completo" maxlength="60" autocomplete="off"></label>
            <label class="field"><span class="sr-only">Especialidad</span><select name="specialty">${DB.specialties.map((s) => `<option>${esc(s)}</option>`).join('')}</select></label>
            <button type="submit" class="btn btn-primary">${I.plus}<span>Agregar</span></button></form>
          <ul class="cfg-list">${DB.contractors.slice().sort((a, b) => cmpEs(a.name, b.name)).map((c) => {
            const acts = DB.activities.filter((a) => a.contractorId === c.id).sort((a, b) => cmpEs(a.name, b.name));
            return `<li class="cfg-contractor"><div class="cp-top"><div><strong>${esc(c.name)}</strong><small>${esc(c.specialty)}${c.phone ? `, ${esc(c.phone)}` : ''}, ${acts.length} ${acts.length === 1 ? 'actividad' : 'actividades'}</small></div><div class="cfg-actions">${delBtn('cfg-del-contractor', c.id, c.name)}</div></div>
              <div class="tag-list">${acts.map((a) => `<span class="tag">${esc(project(a.projectId) ? project(a.projectId).name.replace('Edificio ', '') : '')}: ${esc(a.name)}<button type="button" class="tag-del" data-action="activity-delete" data-id="${a.id}" aria-label="Quitar ${esc(a.name)}">${I.x}</button></span>`).join('') || '<small class="t-muted">Sin actividades asignadas.</small>'}</div>
              <form class="inline-form ic-form" data-form="add-cact" data-cid="${c.id}">
                <label class="field"><span class="sr-only">Proyecto</span><select name="projectId">${DB.projects.map((x) => `<option value="${x.id}"${x.id === S.projectId ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
                <label class="field grow"><span class="sr-only">Actividad</span><input name="name" placeholder="Nueva actividad para ${esc(c.name.split(' ')[0])}" maxlength="60" autocomplete="off"></label>
                <button type="submit" class="btn btn-soft">${I.plus}<span>Agregar</span></button></form></li>`;
          }).join('')}</ul></section>`;
        break;
      case 'sectores':
        body = `<section class="card"><div class="card-head"><div><h2>${sectorWordPl(p)} de ${esc(p.name)}</h2><p class="card-sub">El color identifica a cada ${sectorWord(p).toLowerCase()} en el tablero. Para Post-Venta cambia «Nombre de las zonas» a Departamentos en la sección Proyectos.</p></div></div>
          <form class="stack-form" data-form="add-sector">
            <div class="field-row">
              <label class="field"><span>Código corto</span><input name="code" placeholder="Ej.: S4 o 4A" maxlength="6" autocomplete="off"></label>
              <label class="field"><span>Nombre</span><input name="name" placeholder="Ej.: ${sectorWord(p)} 4" maxlength="30" autocomplete="off"></label>
            </div>
            <fieldset class="field"><legend>Color</legend><div class="swatches">${SECTOR_COLORS.map((col, i) => `<label class="swatch" style="--c:${col}"><input type="radio" name="color" value="${col}"${i === p.sectors.length % SECTOR_COLORS.length ? ' checked' : ''}><span></span><b class="sr-only">${col}</b></label>`).join('')}</div></fieldset>
            <button type="submit" class="btn btn-primary">${I.plus}<span>Agregar ${sectorWord(p).toLowerCase()}</span></button>
          </form>
          <div class="sector-tiles">${p.sectors.map((s) => `<div class="sector-tile" style="--c:${s.color}"><div><strong>${esc(s.code)}</strong><span>${esc(s.name)}</span></div>${delBtn('cfg-del-sector', s.id, s.name)}</div>`).join('')}</div></section>`;
        break;
      case 'pisos':
        body = simpleListCard(`Pisos y ubicaciones de ${esc(p.name)}`, 'Se usan para indicar dónde se hará cada compromiso.', 'add-floor', 'Ej.: Piso 13, Fachada, Lobby', p.floors, 'cfg-del-floor');
        break;
      case 'causas':
        body = `<section class="card"><div class="card-head"><div><h2>Causas de incumplimiento</h2><p class="card-sub">Las 12 causas oficiales tienen número y nombre fijos: son los de la lista de la pizarra y no se pueden cambiar ni borrar. Solo se pueden agregar causas nuevas, que reciben el siguiente número libre. Las causas se gestionan únicamente aquí.</p></div></div>
          <form class="inline-form" data-form="add-cause"><label class="field grow"><span class="sr-only">Nueva causa</span><input name="name" placeholder="Nueva causa (recibirá el número ${Math.max(...DB.causes.map((k) => k.num)) + 1})" maxlength="60" autocomplete="off"></label><button type="submit" class="btn btn-primary">${I.plus}<span>Agregar causa</span></button></form>
          <ul class="cause-list">${DB.causes.slice().sort((a, b) => a.num - b.num).map((k) => `<li><span class="cause-num big">${k.num}</span><span class="cl-name">${esc(k.name)}</span>
            ${k.fixed ? `<span class="cl-lock" title="Causa oficial: bloqueada">${I.lock}<small>Bloqueada</small></span>` : `<span class="cfg-actions"><button type="button" class="btn btn-soft btn-sm" data-action="cfg-edit-cause" data-id="${k.id}">${I.edit}<span>Editar</span></button>${delBtn('cfg-del-cause', k.id, k.name)}</span>`}</li>`).join('')}</ul></section>`;
        break;
      case 'especialidades':
        body = simpleListCard('Especialidades', 'Sirven para clasificar a los contratistas y sus actividades.', 'add-specialty', 'Ej.: Impermeabilización', DB.specialties, 'cfg-del-specialty');
        break;
      case 'formula': {
        const f = formulaModel();
        const sum = weightSum(f.weights);
        const wField = (k, label) => `<label class="num-field"><span>${label}</span><input type="number" name="w_${k}" min="0" max="100" step="1" value="${esc(f.weights[k])}" data-input="formula-live" inputmode="numeric"></label>`;
        const tField = (k, label, max, step = 1) => `<label class="num-field"><span>${label}</span><input type="number" name="${k}" min="0" max="${max}" step="${step}" value="${esc(f.th[k])}" inputmode="decimal"></label>`;
        body = `<section class="card"><div class="card-head"><div><h2>Fórmula de calificación</h2><p class="card-sub">Cada cliente puede tener una fórmula distinta: todo se edita aquí. Los pesos deben sumar 100 para poder guardar.</p></div></div>
          <form class="stack-form formula-form" data-form="formula" novalidate>
            <fieldset class="field"><legend>Peso de cada criterio (%)</legend>
              <div class="weights-grid">${wField('ppc', 'PPC (cumplimiento)')}${wField('calidad', 'Calidad')}${wField('seguridad', 'Seguridad')}${wField('limpieza', 'Limpieza')}</div>
              <p class="wsum ${sum === 100 ? 'ok' : 'bad'}" id="wSum">${sum === 100 ? `Suma: 100 ${I.check}` : `Suma: ${sum}. Debe ser exactamente 100`}</p>
            </fieldset>
            <fieldset class="field"><legend>Falta grave</legend>
              <div class="weights-grid"><label class="num-field"><span>Factor que multiplica el puntaje (0 a 1)</span><input type="number" name="faltaFactor" min="0" max="1" step="0.05" value="${esc(f.faltaFactor)}" inputmode="decimal"></label></div>
            </fieldset>
            <fieldset class="field"><legend>Factor multiplicador (FM) según el personal semanal</legend>
              <p class="t-muted small">Tabla de ejemplo hasta recibir la tabla real del cliente. «Hasta» vacío = sin límite (solo en el último rango).</p>
              <div class="fm-table">${f.fm.map((r, i) => `<div class="fm-row">
                <label class="num-field"><span>Desde (personas)</span><input type="number" name="fm_min_${i}" min="0" step="1" value="${esc(r.min)}" inputmode="numeric"></label>
                <label class="num-field"><span>Hasta</span><input type="number" name="fm_max_${i}" min="0" step="1" value="${r.max == null ? '' : esc(r.max)}" placeholder="sin límite" inputmode="numeric"></label>
                <label class="num-field"><span>FM</span><input type="number" name="fm_val_${i}" min="0.5" max="3" step="0.01" value="${esc(r.fm)}" inputmode="decimal"></label>
                <button type="button" class="tag-del" data-action="fm-del" data-i="${i}" aria-label="Quitar rango">${I.x}</button></div>`).join('')}</div>
              <button type="button" class="btn btn-soft btn-sm" data-action="fm-add">${I.plus}<span>Agregar rango</span></button>
            </fieldset>
            <fieldset class="field"><legend>Metas y umbrales</legend>
              <div class="weights-grid">
                ${tField('meta', 'Meta de PPC (%)', 100)}${tField('minFinal', 'Puntaje mínimo elegible', 200)}${tField('excFinal', 'Puntaje de excelencia', 200)}${tField('excPpc', 'PPC para excelencia (%)', 100)}
                ${tField('minCompWeek', 'Compromisos mínimos (semana)', 50)}${tField('minWeeksMonth', 'Semanas mínimas (mes)', 6)}${tField('minCompMonth', 'Compromisos mínimos (mes)', 200)}
              </div>
            </fieldset>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" data-action="formula-reset">Descartar cambios</button>
              <button type="submit" class="btn btn-primary" id="formulaSave"${sum === 100 ? '' : ' disabled'}>Guardar fórmula</button>
            </div>
          </form></section>`;
        break;
      }
      case 'tablero':
        body = `<section class="card"><div class="card-head"><div><h2>Tableros</h2><p class="card-sub">Cuántas semanas se muestran seguidas por defecto en la grilla de Tableros. También se puede cambiar desde la propia pantalla.</p></div></div>
          <label class="field" style="max-width:320px"><span>Semanas visibles por defecto</span><select data-change="cfg-weeks">${range(1, 8).map((n) => `<option value="${n}"${n === CFG.weeksVisible ? ' selected' : ''}>${n} ${n === 1 ? 'semana' : 'semanas'}</option>`).join('')}</select></label></section>`;
        break;
      case 'sinobra': {
        const offs = DB.offDays.filter((o) => o.projectId === S.projectId).sort((a, b) => (a.date < b.date ? 1 : -1));
        body = `<section class="card"><div class="card-head"><div><h2>Días sin obra de ${esc(p.name)}</h2><p class="card-sub">Un día sin obra (feriado o sábado sin trabajo) no se puede calificar ni evaluar, no cuenta en el PPC ni en los promedios y no dispara el bloqueo. También se puede marcar desde la cabecera del día en Tableros.</p></div></div>
          <form class="inline-form" data-form="add-off"><label class="field grow"><span class="sr-only">Fecha</span><input type="date" name="date" min="${DB.year}-01-01" max="${DB.year}-12-31"></label><button type="submit" class="btn btn-primary">${I.plus}<span>Marcar sin obra</span></button></form>
          ${offs.length ? `<ul class="cfg-list">${offs.map((o) => `<li><div><strong>${fmtDayLong(o.date)}</strong><small>Semana ${weekOfDate(o.date)}</small></div><div class="cfg-actions"><button type="button" class="btn btn-soft btn-sm" data-action="off-remove" data-date="${o.date}">Reactivar</button></div></li>`).join('')}</ul>` : empty('No hay días sin obra', 'Los domingos no cuentan como día de obra.')}</section>`;
        break;
      }
      default: {
        const n = nowP();
        body = `<section class="card"><div class="card-head"><div><h2>Simulador de fecha y hora</h2><p class="card-sub">Sirve para demostrar el sábado, el corte de las 12:00 y los bloqueos sin esperar al día real. Todo el sistema usa esta fecha y hora mientras esté activo.</p></div></div>
          <div class="sim-now">${I.clock}<div><strong>${cap(fmtDayLong(n.date))}, ${hhmm(n.min)}</strong><small>${S.sim ? 'Fecha y hora simuladas' : 'Fecha y hora reales'}</small></div></div>
          <form class="stack-form" data-form="sim">
            <div class="field-row">
              <label class="field"><span>Fecha</span><input type="date" name="date" value="${n.date}" min="${DB.year}-01-01" max="${DB.year}-12-31"></label>
              <label class="field"><span>Hora</span><input type="time" name="time" value="${hhmm(n.min)}"></label>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" data-action="sim-reset"${S.sim ? '' : ' disabled'}>Volver a hoy</button>
              <button type="submit" class="btn btn-primary">Aplicar fecha y hora</button>
            </div>
          </form>
          <div class="sim-quick"><span>Atajos:</span>
            <button type="button" class="btn btn-soft btn-sm" data-action="sim-jump" data-add="1" data-time="09:00">Mañana 09:00</button>
            <button type="button" class="btn btn-soft btn-sm" data-action="sim-jump" data-add="1" data-time="12:01">Mañana 12:01</button>
            <button type="button" class="btn btn-soft btn-sm" data-action="sim-sat">Próximo sábado</button></div></section>`;
      }
    }
    return `${pageHead('Ajustes', 'Catálogos y reglas que usa todo el sistema.')}
      <div class="tabs" role="tablist">${CFG_TABS.map(([id, label]) => `<button type="button" role="tab" class="${S.cfgTab === id ? 'active' : ''}" aria-selected="${S.cfgTab === id}" data-action="cfg-tab" data-tab="${id}">${label}</button>`).join('')}</div>
      ${body}
      <p class="cfg-note">${I.info}<span>Los cambios se mantienen mientras la página esté abierta. Al recargar vuelven los datos de demostración.</span></p>`;

    function simpleListCard(title, sub, form, placeholder, items, delAction) {
      return `<section class="card"><div class="card-head"><div><h2>${title}</h2><p class="card-sub">${sub}</p></div></div>
        <form class="inline-form" data-form="${form}"><label class="field grow"><span class="sr-only">Nuevo</span><input name="name" placeholder="${esc(placeholder)}" maxlength="50" autocomplete="off"></label><button type="submit" class="btn btn-primary">${I.plus}<span>Agregar</span></button></form>
        <div class="tag-list">${items.map((it) => {
          const id = typeof it === 'string' ? it : it.id;
          const name = typeof it === 'string' ? it : it.name;
          return `<span class="tag">${esc(name)}${delBtn(delAction, id, name)}</span>`;
        }).join('')}</div></section>`;
    }
  }

  /* =========================================================
     MODALES
     ========================================================= */
  function setModal(title, bodyHtml, opts = {}) {
    const root = $('#modalRoot');
    const inner = `<div class="modal-grab" aria-hidden="true"></div>
      <div class="modal-head"><div class="mh-text"><h2 id="modalTitle">${title}</h2>${opts.sub ? `<p>${opts.sub}</p>` : ''}</div><button type="button" class="icon-btn" data-action="modal-close" aria-label="Cerrar">${I.x}</button></div>
      ${opts.tabs || ''}<div class="modal-body">${bodyHtml}</div>`;
    const existing = root.firstElementChild;
    if (existing) {
      const m = existing.querySelector('.modal');
      const st = m.scrollTop;
      m.className = `modal${opts.wide ? ' modal-wide' : ''}`;
      m.innerHTML = inner;
      m.scrollTop = st;
      return;
    }
    root.innerHTML = `<div class="overlay"><div class="modal${opts.wide ? ' modal-wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">${inner}</div></div>`;
    document.body.classList.add('modal-open');
    const ov = root.firstElementChild;
    requestAnimationFrame(() => ov.classList.add('show'));
  }
  function closeModal() {
    $('#modalRoot').innerHTML = '';
    document.body.classList.remove('modal-open');
    pendingConfirm = null;
    M = null;
  }
  function confirmDialog(title, message, okLabel, onOk) {
    M = { type: 'confirm' };
    setModal(title, `<p class="confirm-msg">${message}</p>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button><button type="button" class="btn btn-danger" data-action="confirm-ok">${okLabel}</button></div>`);
    pendingConfirm = onOk;
  }
  function showFormError(form, msg) {
    const el = form.querySelector('.form-err');
    if (el) { el.textContent = msg; el.hidden = false; } else toast(msg, 'error');
  }
  const notice = (kind, ico, title, text, btn = '') => `<div class="banner ${kind ? `banner-${kind}` : ''}"><span class="banner-ico">${ico}</span><p><strong>${title}</strong>${text ? `<span>${text}</span>` : ''}</p>${btn}</div>`;
  const fixedField = (label, main, sub) => `<div class="fixed-field"><span>${label}</span><strong>${esc(main)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  const yesNo = (action, id, val) => `<div class="seg-2 seg-sm" role="group">
      <button type="button" class="seg-btn${val === true ? ' on ko' : ''}" data-action="${action}" data-id="${id}" data-val="yes" aria-pressed="${val === true}">Sí</button>
      <button type="button" class="seg-btn${val === false ? ' on ok' : ''}" data-action="${action}" data-id="${id}" data-val="no" aria-pressed="${val === false}">No</button></div>`;
  const causeOptions = (sel) => `<option value="">Elige la causa</option>${DB.causes.slice().sort((a, b) => a.num - b.num).map((k) => `<option value="${k.id}"${k.id === sel ? ' selected' : ''}>${k.num} · ${esc(k.name)}</option>`).join('')}`;

  /* ---------- Compromiso: Evaluar día / Editar ---------- */
  function initEvalDraft(c) {
    const r = rating(c);
    return { status: c.status === 'pending' ? (r && r.worked === false ? 'fail' : null) : c.status, causeId: c.causeId || '', delayed: c.delayed, note: c.note || '' };
  }
  function openCommitment(id, tab = 'eval') {
    const c = byId(DB.commitments, id);
    if (!c) return;
    M = { type: 'commitment', id, tab, draft: initEvalDraft(c), err: {} };
    renderModal();
  }

  function commitmentModal() {
    const c = byId(DB.commitments, M.id);
    if (!c) { closeModal(); return; }
    const a = activity(c.activityId), ct = contractor(a.contractorId);
    const tabs = `<div class="mtabs" role="tablist">
      <button type="button" role="tab" class="${M.tab === 'eval' ? 'active' : ''}" aria-selected="${M.tab === 'eval'}" data-action="m-tab" data-tab="eval">Evaluar día</button>
      <button type="button" role="tab" class="${M.tab === 'edit' ? 'active' : ''}" aria-selected="${M.tab === 'edit'}" data-action="m-tab" data-tab="edit">Editar compromiso</button></div>`;
    const summary = `<div class="cm-summary">${locBadge(c)}<span>${esc(fmtDayLong(c.date))}</span>${c.detail ? `<em>${esc(c.detail)}</em>` : ''}</div>`;
    setModal(esc(a.name), summary + (M.tab === 'eval' ? evalPane(c) : editPane(c)), { sub: `${esc(ct ? ct.name : '')}, ${esc(project(c.projectId).name)}`, tabs, wide: true });
  }

  function evalPane(c) {
    const lock = lockInfo(c), r = rating(c), d = M.draft, err = M.err || {};
    const rated = ratingComplete(c);
    const editable = !!lock.ok && rated;
    const forcedFail = !!r && r.worked === false;
    if (forcedFail) d.status = 'fail';
    let top = '';
    if (lock.reason === 'future') top = notice('info', I.info, 'Este día aún no llega', 'Solo se puede evaluar el día de hoy.');
    else if (lock.reason === 'off') top = notice('info', I.ban, 'Día sin obra', 'No se puede evaluar ni calificar este día.');
    else if (lock.reason === 'blocked') top = notice('bad', I.lock, `Hay ${lock.blockers.length} ${lock.blockers.length === 1 ? 'compromiso' : 'compromisos'} de días anteriores sin cerrar`, 'Ciérralos primero (calificación tardía) para poder evaluar hoy.', '<button type="button" class="btn btn-primary btn-sm" data-action="go-blocker">Cerrar ahora</button>');
    else if (lock.reason === 'closed') top = notice('info', I.lock, 'Día cerrado', 'Pasaron las 12:00 del día siguiente: solo lectura.');
    else if (lock.late) top = notice('info', I.clock, 'Cierre tardío', 'Este día ya pasó: se cerrará como calificación tardía y quedará en la bitácora.');
    else if (c.date !== today() && lock.ok) top = notice('info', I.clock, 'Puedes corregir hasta las 12:00 de hoy', '');

    let rateLine = '';
    if (rated) {
      rateLine = `<div class="rate-line">${I.check}<span>${r.worked === false ? '<b>No trabajó</b>: este día no entra al promedio.' : `Calificación del día: Calidad <b>${fmt1(r.calidad)}</b>, Limpieza <b>${fmt1(r.limpieza)}</b>.`}</span></div>`;
    } else if (lock.ok) {
      rateLine = notice('', I.alert, 'Falta calificar Calidad y Limpieza', 'No se puede marcar Cumplió / No cumplió sin la calificación del día.', `<button type="button" class="btn btn-primary btn-sm" data-action="ev-go-rate">Calificar ahora</button>`);
    }

    const attNo = ['am', 'pm'].filter((m) => { const e = DB.attendance[`${c.projectId}|${contractorIdOf(c)}|${c.date}|${m}`]; return e && e.status === 'no'; });
    const attWarn = d.status === 'done' && attNo.length
      ? notice('', I.alert, 'Ojo con la asistencia', `${esc((contractor(contractorIdOf(c)) || {}).name || '')} figura «No llegó» en la reunión de la ${attNo.map((m) => MEETINGS[m].toLowerCase()).join(' y de la ')}. Puedes marcar Cumplió igual.`) : '';

    const dis = editable ? '' : ' disabled';
    const fail = d.status === 'fail' ? `<div class="ec-fail">
        <label class="field"><span>Causa de incumplimiento</span><select data-change="ev-cause" class="${err.cause ? 'invalid' : ''}"${dis}>${causeOptions(d.causeId)}</select></label>
        ${err.cause ? '<p class="field-err">Elige la causa para poder guardar.</p>' : ''}
        <div class="field"><span>¿Retrasó la obra?</span>${yesNo('ev-delay', c.id, d.delayed).replace(/<button /g, `<button${dis} `)}
          ${err.delay ? '<p class="field-err">Indica si retrasó la obra.</p>' : ''}</div>
      </div>` : '';
    const note = d.status ? `<label class="field"><span>Observación <small>opcional</small></span><textarea rows="2" data-input="ev-note" placeholder="Qué pasó en obra"${dis}>${esc(d.note)}</textarea></label>` : '';

    return `${top}${rateLine}
      <div class="seg-2" role="group" aria-label="Resultado">
        <button type="button" class="seg-btn ok${d.status === 'done' ? ' on' : ''}" data-action="ev-status" data-status="done" aria-pressed="${d.status === 'done'}"${editable && !forcedFail ? '' : ' disabled'}>${I.check}<span>Cumplió</span></button>
        <button type="button" class="seg-btn ko${d.status === 'fail' ? ' on' : ''}" data-action="ev-status" data-status="fail" aria-pressed="${d.status === 'fail'}"${editable ? '' : ' disabled'}>${I.x}<span>No cumplió</span></button>
      </div>
      ${forcedFail ? '<p class="small t-muted">Como no trabajó, el compromiso queda como «No cumplió» con su causa.</p>' : ''}
      ${attWarn}${fail}${note}
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cerrar</button>
        <button type="button" class="btn btn-primary" data-action="ev-save"${editable ? '' : ' disabled'}>Guardar evaluación</button></div>`;
  }

  function editPane(c) {
    const p = project(c.projectId);
    const a = activity(c.activityId), ct = contractor(a.contractorId);
    const evaluated = c.status !== 'pending';
    const locked = evaluated || c.date < today();
    const dates = allowedDates(c.projectId, c.date);
    return `<form class="stack-form" data-form="commitment" data-id="${c.id}" novalidate>
      ${locked ? notice('info', I.lock, evaluated ? 'Compromiso ya evaluado' : 'Día ya cerrado para cambios', 'No se puede mover ni eliminar. Solo se puede corregir el detalle.') : ''}
      ${fixedField('Actividad', a.name, ct ? ct.name : '')}
      <div class="field-row">
        <label class="field"><span>Día</span><select name="date"${locked ? ' disabled' : ''}>${dates.map((d) => `<option value="${d}"${d === c.date ? ' selected' : ''}>${fmtDayLong(d)}</option>`).join('')}</select></label>
        <label class="field"><span>Piso o ubicación</span><select name="floor"${locked ? ' disabled' : ''}>${p.floors.map((f) => `<option${f === c.floor ? ' selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
      </div>
      <fieldset class="field"${locked ? ' disabled' : ''}><legend>${sectorWord(p)}</legend><div class="sector-pick">${p.sectors.map((s) => `<label class="sector-opt" style="--c:${s.color}"><input type="radio" name="sectorId" value="${s.id}"${s.id === c.sectorId ? ' checked' : ''}><span>${esc(s.code)}</span></label>`).join('')}</div></fieldset>
      <label class="field"><span>Detalle <small>se muestra en el tablero, ej.: gas, papel picado</small></span><input name="detail" value="${esc(c.detail || '')}" maxlength="40" placeholder="Anotación corta" autocomplete="off"></label>
      <p class="form-err" hidden></p>
      <div class="modal-actions">
        ${!locked ? `<button type="button" class="btn btn-danger-soft" data-action="commitment-delete" data-id="${c.id}">${I.trash}<span>Eliminar</span></button><span class="spacer"></span>` : ''}
        <button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar cambios</button>
      </div>
    </form>`;
  }

  // Días donde se puede programar (hoy o futuros, con obra), dentro de lo que se ve o las próximas semanas
  function allowedDates(pid, include) {
    const cw = curWeek();
    const ws = new Set(planWeeks().concat(range(cw, Math.min(MAX_WEEK, cw + 3))));
    const ds = [...ws].sort((a, b) => a - b).flatMap(weekDates).filter((d) => canAddOn(pid, d));
    if (include && !ds.includes(include)) ds.push(include);
    return ds.sort();
  }

  function openNewCommitment(opts = {}) {
    const acts = projActs();
    if (!acts.length) { M = { type: 'newa' }; renderModal(); return; }
    const filtered = planActs();
    M = { type: 'newc', activityId: opts.activity || null, pick: (filtered[0] || acts[0]).id, date: opts.date || null };
    renderModal();
  }
  function newCommitmentModal() {
    const p = project();
    const fixed = !!M.activityId;
    const actId = fixed ? M.activityId : (M.actSel || M.pick);
    const dates = allowedDates(S.projectId);
    const date = M.date && dates.includes(M.date) ? M.date : (dates.includes(today()) ? today() : dates[0]);
    const last = DB.commitments.filter((c) => c.activityId === actId).sort((a, b) => (a.date > b.date ? -1 : 1))[0];
    const floor = last ? last.floor : p.floors[0];
    const sectorId = last ? last.sectorId : p.sectors[0].id;
    const a = activity(actId);
    const actField = fixed
      ? `${fixedField('Actividad', a.name, (contractor(a.contractorId) || {}).name)}<input type="hidden" name="activityId" value="${actId}">`
      : `<label class="field"><span>Actividad</span><select name="activityId" data-change="newc-activity">${projActs().map((x) => `<option value="${x.id}"${x.id === actId ? ' selected' : ''}>${esc(x.name)}, ${esc((contractor(x.contractorId) || {}).name || '')}</option>`).join('')}</select></label>`;
    setModal('Agregar compromiso', `<form class="stack-form" data-form="commitment" data-id="" novalidate>
      ${notice('info', I.info, 'Solo hoy o días futuros', 'El plan se define en la mañana: los días pasados quedan cerrados.')}
      ${actField}
      <div class="field-row">
        <label class="field"><span>Día</span><select name="date">${dates.map((d) => `<option value="${d}"${d === date ? ' selected' : ''}>${fmtDayLong(d)}</option>`).join('')}</select></label>
        <label class="field"><span>Piso o ubicación</span><select name="floor">${p.floors.map((f) => `<option${f === floor ? ' selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
      </div>
      <fieldset class="field"><legend>${sectorWord(p)}</legend><div class="sector-pick">${p.sectors.map((s) => `<label class="sector-opt" style="--c:${s.color}"><input type="radio" name="sectorId" value="${s.id}"${s.id === sectorId ? ' checked' : ''}><span>${esc(s.code)}</span></label>`).join('')}</div></fieldset>
      <label class="field"><span>Detalle <small>opcional, ej.: gas, papel picado</small></span><input name="detail" maxlength="40" placeholder="Anotación corta" autocomplete="off"></label>
      <p class="form-err" hidden></p>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button><button type="submit" class="btn btn-primary">Agregar compromiso</button></div>
    </form>`, { wide: true });
  }

  /* ---------- Actividad: Calificar / Asistencia / Editar ---------- */
  function openActivity(id, opts = {}) {
    if (!activity(id)) return;
    M = { type: 'activity', id, tab: opts.tab || 'rate', day: opts.day || null, rd: null, err: {} };
    renderModal();
  }

  function rateCandidates(a) {
    const t = today();
    const cs = DB.commitments.filter((c) => c.activityId === a.id && c.date <= t && isWorkDay(c.projectId, c.date));
    const dates = [...new Set(cs.map((c) => c.date))].filter((d) => d === t || cs.some((c) => c.date === d && lockInfo(c).ok));
    if (!dates.includes(t)) dates.push(t);
    return dates.sort((x, y) => (x < y ? 1 : -1));
  }
  function defaultRateDay(a, cands) {
    const t = today();
    if (DB.commitments.some((c) => c.activityId === a.id && c.date === t)) return t;
    const pend = cands.filter((d) => d !== t && DB.commitments.some((c) => c.activityId === a.id && c.date === d && !isClosed(c)));
    return pend.length ? pend[pend.length - 1] : t;
  }
  function initRate(c) {
    const r = rating(c);
    if (!r) return { worked: true, calidad: '', limpieza: '', causeId: c.causeId || '', delayed: c.delayed, note: c.note || '' };
    return { worked: r.worked !== false, calidad: r.calidad == null ? '' : r.calidad, limpieza: r.limpieza == null ? '' : r.limpieza, causeId: c.causeId || '', delayed: c.delayed, note: c.note || '' };
  }

  function activityModal() {
    if (M.type === 'newa') {
      setModal('Nueva actividad', activityForm(null), { wide: false });
      return;
    }
    const a = activity(M.id);
    if (!a) { closeModal(); return; }
    const ct = contractor(a.contractorId);
    const tabs = `<div class="mtabs" role="tablist">
      <button type="button" role="tab" class="${M.tab === 'rate' ? 'active' : ''}" aria-selected="${M.tab === 'rate'}" data-action="m-tab" data-tab="rate">Calificar</button>
      <button type="button" role="tab" class="${M.tab === 'att' ? 'active' : ''}" aria-selected="${M.tab === 'att'}" data-action="m-tab" data-tab="att">Asistencia</button>
      <button type="button" role="tab" class="${M.tab === 'edit' ? 'active' : ''}" aria-selected="${M.tab === 'edit'}" data-action="m-tab" data-tab="edit">Editar actividad</button></div>`;
    const body = M.tab === 'rate' ? ratePane(a) : M.tab === 'att' ? attPane(a) : activityForm(a);
    setModal(esc(a.name), body, { sub: `${esc(ct ? ct.name : '')}, ${esc(a.specialty)}`, tabs, wide: true });
  }

  function rateBlock(c) {
    const d = M.rd[c.id], lock = lockInfo(c), err = (M.err && M.err[c.id]) || {};
    const can = !!lock.ok, dis = can ? '' : ' disabled';
    const st = { done: 'Cumplió', fail: 'No cumplió', pending: 'Pendiente' }[c.status];
    const evalBtn = can && ratingComplete(c) && c.status === 'pending'
      ? `<button type="button" class="btn btn-soft btn-sm btn-block" data-action="rt-eval" data-id="${c.id}">Ahora marcar Cumplió / No cumplió</button>` : '';
    return `<article class="rate-block st-${c.status}">
      <header class="rb-head">${locBadge(c)}${c.detail ? `<small>${esc(c.detail)}</small>` : ''}<span class="rb-st"><i class="chip-st st-${c.status}">${statusIcon(c.status)}</i>${st}</span></header>
      <div class="seg-2 seg-sm" role="group" aria-label="¿Trabajó?">
        <button type="button" class="seg-btn ok${d.worked ? ' on' : ''}" data-action="rt-worked" data-id="${c.id}" data-val="yes" aria-pressed="${d.worked}"${dis}>${I.check}<span>Trabajó</span></button>
        <button type="button" class="seg-btn ko${!d.worked ? ' on' : ''}" data-action="rt-worked" data-id="${c.id}" data-val="no" aria-pressed="${!d.worked}"${dis}>${I.x}<span>No trabajó</span></button>
      </div>
      ${d.worked ? `<div class="rate-fields">
          <label class="num-field"><span>Calidad <small>0 a 10</small></span><input type="number" inputmode="decimal" min="0" max="10" step="0.1" value="${esc(d.calidad)}" placeholder="0–10" data-input="rt-num" data-id="${c.id}" data-field="calidad" class="${err.calidad ? 'invalid' : ''}"${dis}></label>
          <label class="num-field"><span>Limpieza <small>0 a 10</small></span><input type="number" inputmode="decimal" min="0" max="10" step="0.1" value="${esc(d.limpieza)}" placeholder="0–10" data-input="rt-num" data-id="${c.id}" data-field="limpieza" class="${err.limpieza ? 'invalid' : ''}"${dis}></label>
        </div>${err.calidad || err.limpieza ? '<p class="field-err">Califica Calidad y Limpieza de 0 a 10.</p>' : ''}`
      : `<div class="ec-fail">
          <p class="small">No trabajó: ese día no entra al promedio y el compromiso queda como No cumplió.</p>
          <label class="field"><span>Causa</span><select data-change="rt-cause" data-id="${c.id}" class="${err.cause ? 'invalid' : ''}"${dis}>${causeOptions(d.causeId)}</select></label>
          ${err.cause ? '<p class="field-err">Elige la causa.</p>' : ''}
          <div class="field"><span>¿Retrasó la obra?</span>${yesNo('rt-delay', c.id, d.delayed).replace(/<button /g, `<button${dis} `)}${err.delay ? '<p class="field-err">Indica si retrasó la obra.</p>' : ''}</div>
          <label class="field"><span>Observación <small>opcional</small></span><textarea rows="2" data-input="rt-note" data-id="${c.id}" placeholder="Qué pasó en obra"${dis}>${esc(d.note)}</textarea></label>
        </div>`}
      ${evalBtn}
    </article>`;
  }

  function ratePane(a) {
    const t = today();
    const cands = rateCandidates(a);
    if (!M.day || !cands.includes(M.day)) M.day = defaultRateDay(a, cands);
    const day = M.day;
    const cs = DB.commitments.filter((c) => c.activityId === a.id && c.date === day).sort((x, y) => cmpEs(x.floor, y.floor));
    M.rd = M.rd || {};
    cs.forEach((c) => { if (!M.rd[c.id]) M.rd[c.id] = initRate(c); });
    const dayLbl = (d) => (d === t ? `Hoy, ${fmtDay(d)}` : `${fmtDayLong(d)}`);
    const head = cands.length > 1
      ? `<label class="field"><span>Día a calificar</span><select data-change="rt-day">${cands.map((d) => `<option value="${d}"${d === day ? ' selected' : ''}>${dayLbl(d)}${d !== t ? (DB.commitments.some((c) => c.activityId === a.id && c.date === d && !isClosed(c)) ? ' (sin cerrar)' : ' (corregir)') : ''}</option>`).join('')}</select></label>`
      : `<p class="rate-day"><b>${dayLbl(day)}</b> <small>la calificación es diaria y del día actual</small></p>`;

    if (!isWorkDay(a.projectId, day)) return `${head}${notice('info', I.ban, 'Día sin obra', 'No se califica un día sin obra.')}`;
    if (!cs.length) return `${head}${notice('info', I.info, day === t ? 'Esta actividad no tiene compromiso hoy' : 'Sin compromisos este día', 'Solo se califican actividades con compromiso en el día. Programa uno en el tablero.')}
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cerrar</button><button type="button" class="btn btn-primary" disabled>Guardar calificación</button></div>`;

    const locks = cs.map(lockInfo);
    const anyOk = locks.some((l) => l.ok), anyLate = locks.some((l) => l.late);
    let top = '';
    if (!anyOk) {
      const l = locks[0];
      top = l.reason === 'blocked'
        ? notice('bad', I.lock, `Hay ${l.blockers.length} ${l.blockers.length === 1 ? 'compromiso' : 'compromisos'} de días anteriores sin cerrar`, 'Ciérralos primero (calificación tardía) para poder calificar hoy.', '<button type="button" class="btn btn-primary btn-sm" data-action="go-blocker">Cerrar ahora</button>')
        : notice('info', I.lock, 'Día cerrado', 'Pasaron las 12:00 del día siguiente: solo lectura.');
    } else if (anyLate) top = notice('info', I.clock, 'Cierre tardío', 'Este día ya pasó: la calificación quedará marcada como «tardía» y registrada en la bitácora.');
    else if (day !== t) top = notice('info', I.clock, 'Corrección permitida hasta las 12:00', 'Después de esa hora el día queda cerrado.');
    const multi = cs.length > 1 ? `<p class="small t-muted">Esta actividad tiene ${cs.length} compromisos este día: se califica cada uno. El promedio del día es el promedio de las notas.</p>` : '';
    return `${head}${top}${multi}${cs.map(rateBlock).join('')}
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cerrar</button>
        <button type="button" class="btn btn-primary" data-action="rt-save"${anyOk ? '' : ' disabled'}>Guardar calificación</button></div>`;
  }

  function attPane(a) {
    const t = today(), pid = a.projectId, cid = a.contractorId;
    const ct = contractor(cid);
    const work = isWorkDay(pid, t);
    const ms = dayIdx(t) === 5 ? ['am'] : ['am', 'pm'];
    const others = [...new Set(DB.commitments.filter((c) => c.projectId === pid && c.date === t && contractorIdOf(c) === cid && c.activityId !== a.id).map((c) => activity(c.activityId).name))];
    if (!work) return notice('info', I.ban, 'Hoy no es día de obra', 'La asistencia se registra en las reuniones de los días de obra.');
    return `<p class="rate-day"><b>Asistencia de ${esc(ct ? ct.name : '')}</b> <small>${cap(fmtDayLong(t))}</small></p>
      <p class="small t-muted">Es del contratista responsable de la actividad. Se marca una vez por reunión${others.length ? ` y se comparte con sus otras actividades de hoy (${esc(others.join(', '))})` : ''}. ${dayIdx(t) === 5 ? 'El sábado hay una sola reunión.' : 'Hay dos reuniones: mañana y tarde.'}</p>
      ${ms.map((m) => {
        const e = DB.attendance[`${pid}|${cid}|${t}|${m}`];
        const btn = (s, cls) => `<button type="button" class="seg-btn att-btn ${cls}${e && e.status === s ? ' on' : ''}" data-action="att-set" data-m="${m}" data-status="${s}" aria-pressed="${!!(e && e.status === s)}">${ATT[s]}</button>`;
        return `<div class="att-row"><div class="att-head"><strong>Reunión de la ${MEETINGS[m].toLowerCase()}</strong>${e ? `<small>${esc(e.by)}, ${esc(e.at.slice(11))}</small>` : '<small>Sin registrar</small>'}</div>
          <div class="att-btns">${btn('ok', 'ok')}${btn('late', 'mid')}${btn('no', 'ko')}</div></div>`;
      }).join('')}
      <p class="small t-muted">Cada toque se guarda al instante. Toca de nuevo el mismo botón para borrar el registro.</p>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cerrar</button></div>`;
  }

  function activityForm(a) {
    const cs = DB.contractors.slice().sort((x, y) => cmpEs(x.name, y.name));
    const cid = a ? a.contractorId : cs[0].id;
    const spec = a ? a.specialty : contractor(cid).specialty;
    const n = a ? DB.commitments.filter((c) => c.activityId === a.id).length : 0;
    return `<form class="stack-form" data-form="activity" data-id="${a ? a.id : ''}" novalidate>
      <label class="field"><span>Nombre de la actividad</span><input name="name" value="${a ? esc(a.name) : ''}" placeholder="Ej.: Revoque interior" maxlength="60" autocomplete="off"></label>
      <label class="field"><span>Contratista</span><select name="contractorId" data-change="act-contractor">${contractorOptions(cid, cs)}</select></label>
      <label class="field"><span>Especialidad</span><select name="specialty">${DB.specialties.map((s) => `<option${s === spec ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      ${a ? `<p class="t-muted small">Tiene ${n} ${n === 1 ? 'compromiso programado' : 'compromisos programados'} en total. Cada actividad + contratista es una fila del tablero.</p>` : ''}
      <p class="form-err" hidden></p>
      <div class="modal-actions">
        ${a ? `<button type="button" class="btn btn-danger-soft" data-action="activity-delete" data-id="${a.id}">${I.trash}<span>Eliminar</span></button><span class="spacer"></span>` : ''}
        <button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button>
        <button type="submit" class="btn btn-primary">${a ? 'Guardar cambios' : 'Crear actividad'}</button>
      </div>
    </form>`;
  }

  function causeModal(id) {
    const k = cause(id);
    if (!k) return;
    M = { type: 'cause', id };
    setModal(`Editar causa ${k.num}`, `<form class="stack-form" data-form="edit-cause" data-id="${k.id}" novalidate>
      <label class="field"><span>Nombre</span><input name="name" value="${esc(k.name)}" maxlength="60" autocomplete="off"></label>
      <p class="t-muted small">El número ${k.num} no se puede cambiar.</p>
      <p class="form-err" hidden></p>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
  }

  function renderModal() {
    if (!M) return;
    if (M.type === 'commitment') commitmentModal();
    else if (M.type === 'newc') newCommitmentModal();
    else if (M.type === 'activity' || M.type === 'newa') activityModal();
  }

  /* =========================================================
     AVISOS
     ========================================================= */
  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `${type === 'error' ? I.alert : type === 'info' ? I.info : I.check}<span>${esc(msg)}</span>`;
    const root = $('#toastRoot');
    root.appendChild(el);
    while (root.children.length > 3) root.firstElementChild.remove();
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3200);
  }

  /* =========================================================
     NAVEGACIÓN Y RENDER
     ========================================================= */
  function renderNav() {
    const badge = blockers(S.projectId).length + todayToRate(S.projectId).length;
    const dot = (id) => (id === 'tableros' && badge ? '<i class="nav-dot" aria-hidden="true"></i>' : '');
    const item = (n, cls, showLabel) => `<button type="button" class="${cls}${S.view === n.id ? ' active' : ''}" data-action="nav" data-view="${n.id}"${S.view === n.id ? ' aria-current="page"' : ''}>
      <span class="nav-ico">${n.icon}${dot(n.id)}</span><span>${showLabel === 'short' ? n.short : n.label}</span></button>`;
    $('#sideNav').innerHTML = NAV.map((n) => item(n, 'sb-item', 'long')).join('');
    $('#bottomNav').innerHTML = NAV.map((n) => item(n, 'bn-item', 'short')).join('');
  }

  function renderChrome() {
    const ps = $('#projectSelect');
    ps.innerHTML = DB.projects.map((p) => `<option value="${p.id}"${p.id === S.projectId ? ' selected' : ''}>${esc(p.name)}</option>`).join('');
    const os = $('#operatorSelect');
    os.innerHTML = DB.operators.map((o) => `<option${o === S.operator ? ' selected' : ''}>${esc(o)}</option>`).join('');
    const badge = $('#simBadge');
    if (S.sim) {
      badge.hidden = false;
      badge.innerHTML = `${I.clock}<span><b>Fecha simulada</b> ${esc(fmtDay(S.sim.date))} ${esc(S.sim.time)}</span>`;
    } else { badge.hidden = true; badge.innerHTML = ''; }
    const sb = $('#sbToday');
    if (sb) sb.textContent = `${cap(fmtDayLong(today()))}${S.sim ? ' (simulado)' : ''}`;
    renderNav();
  }

  const VIEWS = { dashboard: viewDashboard, tableros: viewTableros, calificacion: viewCalificacion, reportes: viewReportes, ajustes: viewAjustes };

  function render(opts = {}) {
    const root = $('#view');
    S.exp = null;
    root.innerHTML = VIEWS[S.view]();
    if (opts.enter !== false) { root.classList.remove('enter'); void root.offsetWidth; root.classList.add('enter'); }
    renderChrome();
    if (S.view === 'tableros' && S.planScroll) { S.planScroll = false; requestAnimationFrame(scrollBoardToToday); }
  }
  // Redibuja conservando el scroll de la página (tras guardar algo)
  function rerender() {
    const y = window.scrollY;
    const board = $('#planBoard');
    const bl = board ? board.scrollLeft : 0, bt = board ? board.scrollTop : 0;
    render({ enter: false });
    window.scrollTo(0, y);
    const nb = $('#planBoard');
    if (nb) { nb.scrollLeft = bl; nb.scrollTop = bt; }
  }
  function goto(view) {
    S.view = view;
    document.title = `${NAV.find((n) => n.id === view).label} · Araucaria Last Planner`;
    if (view === 'tableros') S.planScroll = true;
    render();
    window.scrollTo(0, 0);
  }
  function syncClock() {
    const w = curWeek();
    S.planFrom = w; S.scoreWeek = w; S.repTo = w; S.repFrom = Math.max(1, w - 3);
    S.month = monthOfWeek(w);
    S.planScroll = true;
  }

  /* =========================================================
     ACCIONES (click)
     ========================================================= */
  function commitLabel(c) { const a = activity(c.activityId); return `${a ? a.name : ''} · ${locText(c)} · ${fmtShort(c.date)}`; }

  function saveEvaluation(c, d) {
    const prev = c.status;
    c.status = d.status;
    c.causeId = d.status === 'fail' ? d.causeId : null;
    c.delayed = d.status === 'fail' ? d.delayed : null;
    c.note = (d.note || '').trim();
    logAct('Evaluación', `${commitLabel(c)} · ${prev === 'pending' ? '' : (prev === 'done' ? 'Cumplió' : 'No cumplió') + ' → '}${d.status === 'done' ? 'Cumplió' : `No cumplió (${causeLabel(d.causeId)}${d.delayed ? ', retrasó la obra' : ''})`}${lockInfo(c).late ? ' (cierre tardío)' : ''}`);
  }

  function saveRatings(a) {
    const cs = DB.commitments.filter((c) => c.activityId === a.id && c.date === M.day && lockInfo(c).ok);
    const errs = {};
    const num = (v) => { const n = parseNum(v); return typeof n === 'number' && n >= 0 && n <= 10 ? r1(n) : null; };
    cs.forEach((c) => {
      const d = M.rd[c.id], e = {};
      if (d.worked) { if (num(d.calidad) == null) e.calidad = true; if (num(d.limpieza) == null) e.limpieza = true; }
      else { if (!d.causeId) e.cause = true; if (d.delayed == null) e.delay = true; }
      if (Object.keys(e).length) errs[c.id] = e;
    });
    if (Object.keys(errs).length) {
      M.err = errs; renderModal();
      toast('Completa los datos marcados en rojo.', 'error');
      return;
    }
    M.err = {};
    cs.forEach((c) => {
      const d = M.rd[c.id], prev = rating(c);
      const late = prev ? prev.late : c.date < today();
      DB.ratings[c.id] = { commitmentId: c.id, worked: !!d.worked, calidad: d.worked ? num(d.calidad) : null, limpieza: d.worked ? num(d.limpieza) : null, late, by: S.operator, at: stamp() };
      if (!d.worked) {
        c.status = 'fail'; c.causeId = d.causeId; c.delayed = d.delayed; c.note = (d.note || '').trim();
      }
      const r = DB.ratings[c.id];
      logAct('Calificación', `${commitLabel(c)} · ${d.worked ? `Calidad ${fmt1(r.calidad)}, Limpieza ${fmt1(r.limpieza)}` : `No trabajó (${causeLabel(d.causeId)})`}${!prev && late ? ' (tardía)' : ''}${prev ? ' (editada)' : ''}`);
    });
    delete M.rd;
    M.rd = null;
    toast(cs.length > 1 ? 'Calificaciones guardadas.' : 'Calificación guardada.');
    rerender();
    renderModal();
  }

  function removeActivity(id) {
    const a = activity(id);
    if (!a) return;
    const n = DB.commitments.filter((c) => c.activityId === id).length;
    const run = () => {
      DB.commitments.filter((c) => c.activityId === id).forEach((c) => { delete DB.ratings[c.id]; });
      DB.commitments = DB.commitments.filter((c) => c.activityId !== id);
      DB.activities = DB.activities.filter((x) => x.id !== id);
      logAct('Ajustes', `Actividad eliminada: ${a.name} (${(contractor(a.contractorId) || {}).name || ''})`);
      closeModal(); rerender(); toast('Actividad eliminada.');
    };
    confirmDialog('¿Eliminar la actividad?', `Se eliminará «${esc(a.name)}»${n ? ` y sus ${n} compromisos` : ''}. No se puede deshacer.`, 'Sí, eliminar', run);
  }

  const ACTIONS = {
    nav: (el) => goto(el.dataset.view),
    'toggle-theme': () => {
      const dark = document.documentElement.dataset.theme !== 'dark';
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    },
    export: (el) => { if (el.dataset.format === 'Excel') exportCSV(); else exportPDF(); },
    'go-blocker': () => {
      const b = blockers(S.projectId)[0];
      if (!b) { closeModal(); return; }
      if (!ratingComplete(b)) openActivity(b.activityId, { tab: 'rate', day: b.date });
      else openCommitment(b.id, 'eval');     // ya está calificado: falta marcar Cumplió / No cumplió
    },
    'rt-eval': (el) => openCommitment(el.dataset.id, 'eval'),
    'go-report': (el) => { S.repTab = el.dataset.tab; goto('reportes'); },
    'plan-today': () => { S.planFrom = curWeek(); S.planScroll = true; render({ enter: false }); },
    'toggle-off': (el) => {
      const d = el.dataset.date, pid = S.projectId;
      if (isOff(pid, d)) {
        DB.offDays = DB.offDays.filter((o) => !(o.projectId === pid && o.date === d));
        logAct('Ajustes', `Día reactivado: ${fmtDayLong(d)}`);
        toast('Día reactivado.');
      } else {
        DB.offDays.push({ projectId: pid, date: d });
        logAct('Ajustes', `Día sin obra: ${fmtDayLong(d)}`);
        toast('Día marcado sin obra. No cuenta en el PPC ni bloquea.', 'info');
      }
      rerender();
    },
    'new-commitment': (el) => openNewCommitment({ activity: el.dataset.activity, date: el.dataset.date }),
    'open-commitment': (el) => openCommitment(el.dataset.id, 'eval'),
    'open-activity': (el) => openActivity(el.dataset.id, { tab: 'rate' }),
    'new-activity': () => { M = { type: 'newa' }; renderModal(); },
    'm-tab': (el) => {
      if (!M) return;
      M.tab = el.dataset.tab; M.err = {};
      if (M.type === 'commitment' && M.tab === 'eval') { const c = byId(DB.commitments, M.id); if (c) M.draft = initEvalDraft(c); }
      renderModal();
    },
    'ev-status': (el) => { M.draft.status = el.dataset.status; if (M.draft.status === 'done') { M.draft.causeId = ''; M.draft.delayed = null; } M.err = {}; renderModal(); },
    'ev-delay': (el) => { M.draft.delayed = el.dataset.val === 'yes'; M.err.delay = false; renderModal(); },
    'ev-go-rate': () => { const c = byId(DB.commitments, M.id); openActivity(c.activityId, { tab: 'rate', day: c.date }); },
    'ev-save': () => {
      const c = byId(DB.commitments, M.id), d = M.draft;
      if (!c || !lockInfo(c).ok || !ratingComplete(c)) { toast('Primero califica Calidad y Limpieza de este día.', 'error'); return; }
      if (!d.status) { toast('Elige Cumplió o No cumplió.', 'error'); return; }
      const e = {};
      if (d.status === 'fail') { if (!d.causeId) e.cause = true; if (d.delayed == null) e.delay = true; }
      if (Object.keys(e).length) { M.err = e; renderModal(); toast('Falta la causa y si retrasó la obra.', 'error'); return; }
      saveEvaluation(c, d);
      closeModal(); rerender();
      toast(d.status === 'done' ? 'Evaluación guardada: cumplió.' : 'Evaluación guardada: no cumplió.');
    },
    'commitment-delete': (el) => {
      const c = byId(DB.commitments, el.dataset.id);
      if (!c || c.status !== 'pending') return;
      confirmDialog('¿Eliminar el compromiso?', `Se eliminará ${esc(commitLabel(c))}.`, 'Sí, eliminar', () => {
        DB.commitments = DB.commitments.filter((x) => x.id !== c.id);
        delete DB.ratings[c.id];
        logAct('Plan', `Compromiso eliminado: ${commitLabel(c)}`);
        closeModal(); rerender(); toast('Compromiso eliminado.');
      });
    },
    'activity-delete': (el) => removeActivity(el.dataset.id),

    // Calificación diaria (por compromiso)
    'rt-worked': (el) => { M.rd[el.dataset.id].worked = el.dataset.val === 'yes'; M.err = {}; renderModal(); },
    'rt-delay': (el) => { M.rd[el.dataset.id].delayed = el.dataset.val === 'yes'; renderModal(); },
    'rt-save': () => saveRatings(activity(M.id)),
    'att-set': (el) => {
      const a = activity(M.id), t = today(), m = el.dataset.m, s = el.dataset.status;
      const key = `${a.projectId}|${a.contractorId}|${t}|${m}`, ctn = (contractor(a.contractorId) || {}).name;
      if (DB.attendance[key] && DB.attendance[key].status === s) {
        delete DB.attendance[key];
        logAct('Asistencia', `${ctn} · ${MEETINGS[m]} · registro borrado`);
      } else {
        const prev = DB.attendance[key];
        DB.attendance[key] = { status: s, by: S.operator, at: stamp() };
        logAct('Asistencia', `${ctn} · ${MEETINGS[m]} · ${prev ? `${ATT[prev.status]} → ` : ''}${ATT[s]}`);
      }
      renderModal();
    },

    // Calificación semanal
    'score-tab': (el) => { S.scoreTab = el.dataset.tab; render({ enter: false }); },
    'score-week-prev': () => { S.scoreWeek = Math.max(1, S.scoreWeek - 1); render({ enter: false }); },
    'score-week-next': () => { S.scoreWeek = Math.min(MAX_WEEK, S.scoreWeek + 1); render({ enter: false }); },
    'score-discard': () => {
      Object.keys(S.scoreDraft).filter((k) => k.startsWith(`${S.projectId}|${S.scoreWeek}|`)).forEach((k) => delete S.scoreDraft[k]);
      render({ enter: false }); toast('Cambios descartados.', 'info');
    },
    'score-save': () => {
      const keys = Object.keys(S.scoreDraft).filter((k) => k.startsWith(`${S.projectId}|${S.scoreWeek}|`));
      let bad = 0;
      keys.forEach((k) => {
        const cid = k.split('|')[2], d = S.scoreDraft[k];
        ['calidad', 'limpieza', 'seguridad'].forEach((f) => { if (d[f] !== undefined && isNum(d[f]) && (Number(d[f]) < 0 || Number(d[f]) > 10)) bad++; });
        if (d.personal !== undefined && isNum(d.personal) && (Number(d.personal) < 0 || Number(d.personal) > 500)) bad++;
      });
      if (bad) { toast('Hay valores fuera de rango (0 a 10).', 'error'); return; }
      keys.forEach((k) => {
        const cid = k.split('|')[2], d = S.scoreDraft[k];
        let rec = savedScore(cid, S.scoreWeek);
        if (!rec) { rec = { projectId: S.projectId, week: S.scoreWeek, contractorId: cid, calidad: null, limpieza: null, seguridad: null, personal: null, falta: false, note: '' }; DB.scores.push(rec); }
        const auto = dayAvgs(S.projectId, cid, S.scoreWeek);
        const nm = (contractor(cid) || {}).name;
        ['calidad', 'limpieza'].forEach((f) => {
          if (d[f] === undefined) return;
          const prevVal = isNum(rec[f]) ? rec[f] : auto[f];
          if (isNum(d[f])) {
            const v = r1(Number(d[f]));
            rec[f] = auto[f] != null && v === auto[f] ? null : v;
            if (rec[f] != null) logAct('Promedio manual', `${nm} · semana ${S.scoreWeek} · ${cap(f)}: ${prevVal == null ? '—' : fmt1(prevVal)} → ${fmt1(v)} (editado)`);
          } else rec[f] = null;
        });
        if (d.seguridad !== undefined) { const before = rec.seguridad; rec.seguridad = isNum(d.seguridad) ? r1(Number(d.seguridad)) : null; logAct('Calificación semanal', `${nm} · semana ${S.scoreWeek} · Seguridad ${before == null ? '—' : fmt1(before)} → ${rec.seguridad == null ? '—' : fmt1(rec.seguridad)}`); }
        if (d.personal !== undefined) { const before = rec.personal; rec.personal = isNum(d.personal) ? Math.round(Number(d.personal)) : null; logAct('Calificación semanal', `${nm} · semana ${S.scoreWeek} · Personal ${before == null ? '—' : before} → ${rec.personal == null ? '—' : rec.personal} personas`); }
        if (d.falta !== undefined) { const before = !!rec.falta; rec.falta = !!d.falta; if (before !== rec.falta) logAct('Calificación semanal', `${nm} · semana ${S.scoreWeek} · Falta grave: ${rec.falta ? 'sí' : 'no'}`); }
        delete S.scoreDraft[k];
      });
      render({ enter: false });
      toast(`Calificación guardada (${keys.length}).`);
    },

    // Reportes
    'rep-tab': (el) => { S.repTab = el.dataset.tab; render({ enter: false }); },
    'rep-clear': () => { S.repContractor = ''; S.repActivity = ''; S.repCause = ''; render({ enter: false }); },

    // Ajustes
    'cfg-tab': (el) => { S.cfgTab = el.dataset.tab; S.fdraft = null; render({ enter: false }); },
    'cfg-use-project': (el) => { S.projectId = el.dataset.id; S.planContractor = ''; S.repContractor = ''; S.repActivity = ''; render({ enter: false }); toast(`Proyecto: ${project().name}`, 'info'); },
    'cfg-del-project': (el) => {
      if (DB.projects.length < 2) { toast('Debe existir al menos un proyecto.', 'error'); return; }
      const p = project(el.dataset.id);
      confirmDialog('¿Eliminar el proyecto?', `Se eliminarán «${esc(p.name)}», sus actividades y sus compromisos.`, 'Sí, eliminar', () => {
        const ids = new Set(DB.activities.filter((a) => a.projectId === p.id).map((a) => a.id));
        DB.commitments.filter((c) => c.projectId === p.id).forEach((c) => delete DB.ratings[c.id]);
        DB.commitments = DB.commitments.filter((c) => c.projectId !== p.id);
        DB.activities = DB.activities.filter((a) => !ids.has(a.id));
        DB.scores = DB.scores.filter((s) => s.projectId !== p.id);
        DB.offDays = DB.offDays.filter((o) => o.projectId !== p.id);
        DB.projects = DB.projects.filter((x) => x.id !== p.id);
        if (S.projectId === p.id) S.projectId = DB.projects[0].id;
        logAct('Ajustes', `Proyecto eliminado: ${p.name}`);
        closeModal(); render({ enter: false });
      });
    },
    'cfg-del-contractor': (el) => {
      const c = contractor(el.dataset.id);
      if (DB.activities.some((a) => a.contractorId === c.id)) { toast('Primero quita sus actividades.', 'error'); return; }
      DB.contractors = DB.contractors.filter((x) => x.id !== c.id);
      logAct('Ajustes', `Contratista eliminado: ${c.name}`);
      render({ enter: false });
    },
    'cfg-del-sector': (el) => {
      const p = project(), s = byId(p.sectors, el.dataset.id);
      if (p.sectors.length < 2) { toast('Debe quedar al menos un elemento.', 'error'); return; }
      if (DB.commitments.some((c) => c.sectorId === s.id)) { toast(`«${s.name}» está en uso en compromisos.`, 'error'); return; }
      p.sectors = p.sectors.filter((x) => x.id !== s.id);
      logAct('Ajustes', `${sectorWord(p)} eliminado: ${s.name}`);
      render({ enter: false });
    },
    'cfg-del-floor': (el) => {
      const p = project(), f = el.dataset.id;
      if (p.floors.length < 2) { toast('Debe quedar al menos una ubicación.', 'error'); return; }
      if (DB.commitments.some((c) => c.projectId === p.id && c.floor === f)) { toast(`«${f}» está en uso en compromisos.`, 'error'); return; }
      p.floors = p.floors.filter((x) => x !== f);
      logAct('Ajustes', `Ubicación eliminada: ${f}`);
      render({ enter: false });
    },
    'cfg-del-cause': (el) => {
      const k = cause(el.dataset.id);
      if (!k || k.fixed) return;
      if (DB.commitments.some((c) => c.causeId === k.id)) { toast('Esa causa está en uso y no se puede borrar.', 'error'); return; }
      DB.causes = DB.causes.filter((x) => x.id !== k.id);
      logAct('Ajustes', `Causa eliminada: ${k.num} · ${k.name}`);
      render({ enter: false });
    },
    'cfg-del-specialty': (el) => {
      const s = el.dataset.id;
      if (DB.contractors.some((c) => c.specialty === s) || DB.activities.some((a) => a.specialty === s)) { toast(`«${s}» está en uso.`, 'error'); return; }
      if (DB.specialties.length < 2) { toast('Debe quedar al menos una especialidad.', 'error'); return; }
      DB.specialties = DB.specialties.filter((x) => x !== s);
      logAct('Ajustes', `Especialidad eliminada: ${s}`);
      render({ enter: false });
    },
    'cfg-edit-cause': (el) => causeModal(el.dataset.id),
    'fm-add': () => {
      S.fdraft = readFormulaForm($('.formula-form'));
      const last = S.fdraft.fm[S.fdraft.fm.length - 1];
      if (last && last.max == null) last.max = (Number(last.min) || 0) + 3;
      S.fdraft.fm.push({ min: last ? (Number(last.max) || 0) + 1 : 1, max: null, fm: last ? r1(Number(last.fm) * 100 + 1) / 100 : 1.01 });
      render({ enter: false });
    },
    'fm-del': (el) => {
      S.fdraft = readFormulaForm($('.formula-form'));
      if (S.fdraft.fm.length < 2) { toast('Debe quedar al menos un rango.', 'error'); return; }
      S.fdraft.fm.splice(Number(el.dataset.i), 1);
      render({ enter: false });
    },
    'formula-reset': () => { S.fdraft = null; render({ enter: false }); },
    'off-remove': (el) => {
      DB.offDays = DB.offDays.filter((o) => !(o.projectId === S.projectId && o.date === el.dataset.date));
      logAct('Ajustes', `Día reactivado: ${fmtDayLong(el.dataset.date)}`);
      render({ enter: false });
    },
    'sim-reset': () => { S.sim = null; syncClock(); render({ enter: false }); toast('Vuelves a la fecha y hora reales.', 'info'); },
    'sim-jump': (el) => {
      const n = nowP();
      S.sim = { date: addDays(n.date, Number(el.dataset.add)), time: el.dataset.time };
      syncClock(); render({ enter: false }); toast(`Simulando ${fmtDay(S.sim.date)} ${S.sim.time}.`, 'info');
    },
    'sim-sat': () => {
      let d = today();
      while (dayIdx(d) !== 5) d = addDays(d, 1);
      S.sim = { date: d, time: '09:00' };
      syncClock(); render({ enter: false }); toast(`Simulando el sábado ${fmtShort(d)}.`, 'info');
    },
    'modal-close': () => closeModal(),
    'confirm-ok': () => { const cb = pendingConfirm; closeModal(); if (cb) cb(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && ACTIONS[el.dataset.action]) {
      if (el.disabled) return;
      e.preventDefault();
      ACTIONS[el.dataset.action](el);
      return;
    }
    if (e.target.classList && e.target.classList.contains('overlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && M) closeModal(); });

  /* =========================================================
     CAMBIOS DE SELECTORES / CAMPOS
     ========================================================= */
  const CHANGES = {
    project: (el) => { S.projectId = el.value; S.planContractor = ''; S.repContractor = ''; S.repActivity = ''; S.histContractor = ''; S.fdraft = null; render({ enter: false }); },
    operator: (el) => { S.operator = el.value; toast(`Operando como ${S.operator}.`, 'info'); },
    'plan-from': (el) => { S.planFrom = Number(el.value); render({ enter: false }); },
    'plan-count': (el) => { S.planCount = Number(el.value); render({ enter: false }); },
    'plan-contractor': (el) => { S.planContractor = el.value; render({ enter: false }); },
    'score-falta': (el) => {
      const key = scoreKey(el.dataset.cid);
      (S.scoreDraft[key] = S.scoreDraft[key] || {}).falta = el.checked;
      cleanScoreDraft(el.dataset.cid);
      refreshScores();
    },
    'score-month': (el) => { S.month = el.value; render({ enter: false }); },
    'hist-contractor': (el) => { S.histContractor = el.value; render({ enter: false }); },
    'rep-from': (el) => { S.repFrom = Number(el.value); if (S.repTo < S.repFrom) S.repTo = S.repFrom; if (S.repTo - S.repFrom > 11) S.repTo = S.repFrom + 11; render({ enter: false }); },
    'rep-to': (el) => { S.repTo = Number(el.value); if (S.repTo < S.repFrom) S.repFrom = S.repTo; if (S.repTo - S.repFrom > 11) S.repFrom = S.repTo - 11; render({ enter: false }); },
    'rep-contractor': (el) => { S.repContractor = el.value; render({ enter: false }); },
    'rep-activity': (el) => { S.repActivity = el.value; render({ enter: false }); },
    'rep-cause': (el) => { S.repCause = el.value; render({ enter: false }); },
    'log-who': (el) => { S.logWho = el.value; render({ enter: false }); },
    'log-type': (el) => { S.logType = el.value; render({ enter: false }); },
    'log-date': (el) => { S.logDate = el.value; render({ enter: false }); },
    'proj-delay': (el) => {
      const p = project(el.dataset.id), v = Math.max(0, Math.min(30, Math.round(Number(el.value) || 0)));
      logAct('Ajustes', `${p.name}: días por retraso ${p.delayDays} → ${v}`);
      p.delayDays = v; el.value = v; toast('Guardado.');
    },
    'proj-label': (el) => {
      const p = project(el.dataset.id);
      p.sectorLabel = el.value;
      logAct('Ajustes', `${p.name}: zonas se llaman «${el.value}»`);
      render({ enter: false }); toast('Guardado.');
    },
    'cfg-weeks': (el) => {
      CFG.weeksVisible = Number(el.value); S.planCount = CFG.weeksVisible;
      logAct('Ajustes', `Semanas visibles en Tableros: ${CFG.weeksVisible}`);
      toast(`Tableros mostrará ${CFG.weeksVisible} ${CFG.weeksVisible === 1 ? 'semana' : 'semanas'}.`);
    },
    'rt-day': (el) => { M.day = el.value; M.rd = null; M.err = {}; renderModal(); },
    'rt-cause': (el) => { M.rd[el.dataset.id].causeId = el.value; M.err = {}; },
    'ev-cause': (el) => { M.draft.causeId = el.value; if (M.err) M.err.cause = false; },
    'newc-activity': (el) => { M.actSel = el.value; M.date = $('#modalRoot select[name="date"]').value; renderModal(); },
    'act-contractor': (el) => {
      const c = contractor(el.value), sel = $('#modalRoot select[name="specialty"]');
      if (c && sel) sel.value = c.specialty;
    }
  };
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el);
    else if (e.target.id === 'projectSelect') CHANGES.project(e.target);
    else if (e.target.id === 'operatorSelect') CHANGES.operator(e.target);
  });

  // Quita del borrador lo que ya coincide con lo guardado
  function cleanScoreDraft(cid) {
    const key = scoreKey(cid), d = S.scoreDraft[key];
    if (!d) return;
    const base = baseVals(cid, S.scoreWeek);
    ['calidad', 'limpieza', 'seguridad', 'personal', 'falta'].forEach((f) => {
      if (d[f] === undefined) return;
      const b = base[f];
      const same = f === 'falta' ? d[f] === b : (String(d[f]) === String(b) || (isNum(d[f]) && isNum(b) && Number(d[f]) === Number(b)));
      if (same) delete d[f];
    });
    if (!Object.keys(d).length) delete S.scoreDraft[key];
  }

  const INPUTS = {
    'plan-search': (el) => { S.planSearch = el.value; refreshPlanGrid(); },
    score: (el) => {
      const key = scoreKey(el.dataset.cid);
      const raw = parseNum(el.value);
      (S.scoreDraft[key] = S.scoreDraft[key] || {})[el.dataset.field] = raw;
      const max = Number(el.dataset.max);
      el.classList.toggle('invalid', isNum(raw) && (Number(raw) < 0 || Number(raw) > max));
      cleanScoreDraft(el.dataset.cid);
      refreshScores();
    },
    'ev-note': (el) => { M.draft.note = el.value; },
    'rt-num': (el) => { M.rd[el.dataset.id][el.dataset.field] = el.value; el.classList.remove('invalid'); },
    'rt-note': (el) => { M.rd[el.dataset.id].note = el.value; },
    'formula-live': () => {
      const form = $('.formula-form');
      const g = (n) => Number(form.elements[n].value) || 0;
      const sum = g('w_ppc') + g('w_calidad') + g('w_seguridad') + g('w_limpieza');
      const out = $('#wSum');
      out.className = `wsum ${sum === 100 ? 'ok' : 'bad'}`;
      out.innerHTML = sum === 100 ? `Suma: 100 ${I.check}` : `Suma: ${sum}. Debe ser exactamente 100`;
      $('#formulaSave').disabled = sum !== 100;
    }
  };
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el);
  });

  /* =========================================================
     FORMULARIOS
     ========================================================= */
  const FORMS = {
    commitment: (form) => {
      const fd = new FormData(form);
      const id = form.dataset.id;
      const detail = String(fd.get('detail') || '').trim();
      if (id) {
        const c = byId(DB.commitments, id);
        if (!c) return;
        if (c.status !== 'pending' || c.date < today()) {
          if (detail !== (c.detail || '')) { logAct('Plan', `Detalle cambiado: ${commitLabel(c)} · «${c.detail || ''}» → «${detail}»`); c.detail = detail; }
          closeModal(); rerender(); toast('Cambios guardados.');
          return;
        }
        const date = fd.get('date'), floor = fd.get('floor'), sectorId = fd.get('sectorId');
        if (!canAddOn(c.projectId, date)) return showFormError(form, 'Solo se puede programar hoy o días futuros con obra.');
        if (DB.commitments.some((x) => x.id !== c.id && x.activityId === c.activityId && x.date === date && x.floor === floor && x.sectorId === sectorId)) return showFormError(form, 'Ya existe ese compromiso para esa actividad, día y ubicación.');
        const before = commitLabel(c);
        Object.assign(c, { date, floor, sectorId, detail });
        logAct('Plan', `Compromiso modificado: ${before} → ${commitLabel(c)}`);
        closeModal(); rerender(); toast('Cambios guardados.');
        return;
      }
      const activityId = fd.get('activityId'), date = fd.get('date'), floor = fd.get('floor'), sectorId = fd.get('sectorId');
      if (!activityId || !date) return showFormError(form, 'Elige la actividad y el día.');
      if (!canAddOn(S.projectId, date)) return showFormError(form, 'Solo se puede programar hoy o días futuros con obra.');
      if (!sectorId) return showFormError(form, `Elige un ${sectorWord().toLowerCase()}.`);
      if (DB.commitments.some((x) => x.activityId === activityId && x.date === date && x.floor === floor && x.sectorId === sectorId)) return showFormError(form, 'Ya existe ese compromiso para esa actividad, día y ubicación.');
      const c = { id: uid('m'), projectId: S.projectId, activityId, date, floor, sectorId, status: 'pending', causeId: null, delayed: null, note: '', detail };
      DB.commitments.push(c);
      logAct('Plan', `Compromiso agregado: ${commitLabel(c)}`);
      closeModal(); rerender(); toast('Compromiso agregado.');
    },
    activity: (form) => {
      const fd = new FormData(form), id = form.dataset.id;
      const name = String(fd.get('name') || '').trim(), contractorId = fd.get('contractorId'), specialty = fd.get('specialty');
      if (!name) return showFormError(form, 'Escribe el nombre de la actividad.');
      if (DB.activities.some((a) => a.id !== id && a.projectId === S.projectId && a.contractorId === contractorId && norm(a.name) === norm(name))) return showFormError(form, 'Ese contratista ya tiene esa actividad en este proyecto.');
      if (id) {
        const a = activity(id);
        logAct('Ajustes', `Actividad modificada: ${a.name} → ${name}`);
        Object.assign(a, { name, contractorId, specialty });
        closeModal(); rerender(); toast('Actividad actualizada.');
      } else {
        DB.activities.push({ id: uid('a'), projectId: S.projectId, name, contractorId, specialty });
        logAct('Ajustes', `Actividad creada: ${name} (${(contractor(contractorId) || {}).name})`);
        closeModal(); rerender(); toast('Actividad creada.');
      }
    },
    'add-project': (form) => {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) return toast('Escribe el nombre del proyecto.', 'error');
      if (DB.projects.some((p) => norm(p.name) === norm(name))) return toast('Ya existe un proyecto con ese nombre.', 'error');
      const id = uid('p');
      DB.projects.push({ id, name, sectorLabel: 'Sector', delayDays: 1,
        sectors: [{ id: `${id}s1`, code: 'S1', name: 'Sector 1', color: '#3b82f6' }, { id: `${id}s2`, code: 'S2', name: 'Sector 2', color: '#14b8a6' }, { id: `${id}s3`, code: 'Gral', name: 'General', color: '#64748b' }],
        floors: ['Planta Baja', 'Piso 1', 'Piso 2', 'Piso 3'] });
      logAct('Ajustes', `Proyecto creado: ${name}`);
      render({ enter: false }); toast('Proyecto creado.');
    },
    'add-contractor': (form) => {
      const fd = new FormData(form), name = String(fd.get('name') || '').trim();
      if (!name) return toast('Escribe el nombre.', 'error');
      if (DB.contractors.some((c) => norm(c.name) === norm(name))) return toast('Ya existe ese contratista.', 'error');
      DB.contractors.push({ id: uid('c'), name, specialty: fd.get('specialty'), phone: '' });
      logAct('Ajustes', `Contratista creado: ${name}`);
      render({ enter: false }); toast('Contratista agregado.');
    },
    'add-cact': (form) => {
      const fd = new FormData(form), name = String(fd.get('name') || '').trim(), cid = form.dataset.cid, pid = fd.get('projectId');
      if (!name) return toast('Escribe el nombre de la actividad.', 'error');
      if (DB.activities.some((a) => a.projectId === pid && a.contractorId === cid && norm(a.name) === norm(name))) return toast('Ya tiene esa actividad en ese proyecto.', 'error');
      DB.activities.push({ id: uid('a'), projectId: pid, name, contractorId: cid, specialty: (contractor(cid) || {}).specialty || DB.specialties[0] });
      logAct('Ajustes', `Actividad agregada: ${name} (${(contractor(cid) || {}).name})`);
      render({ enter: false }); toast('Actividad agregada.');
    },
    'add-sector': (form) => {
      const fd = new FormData(form), p = project();
      const code = String(fd.get('code') || '').trim(), name = String(fd.get('name') || '').trim() || code;
      if (!code) return toast('Escribe un código corto.', 'error');
      if (p.sectors.some((s) => norm(s.code) === norm(code) || norm(s.name) === norm(name))) return toast('Ya existe ese código o nombre.', 'error');
      p.sectors.push({ id: uid('s'), code, name, color: fd.get('color') || SECTOR_COLORS[0] });
      logAct('Ajustes', `${sectorWord(p)} creado: ${code}`);
      render({ enter: false }); toast('Agregado.');
    },
    'add-floor': (form) => {
      const name = String(new FormData(form).get('name') || '').trim(), p = project();
      if (!name) return toast('Escribe el nombre.', 'error');
      if (p.floors.some((f) => norm(f) === norm(name))) return toast('Ya existe.', 'error');
      p.floors.push(name);
      logAct('Ajustes', `Ubicación creada: ${name}`);
      render({ enter: false }); toast('Agregado.');
    },
    'add-cause': (form) => {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) return toast('Escribe el nombre de la causa.', 'error');
      if (DB.causes.some((k) => norm(k.name) === norm(name))) return toast('Ya existe una causa con ese nombre.', 'error');
      const num = Math.max(...DB.causes.map((k) => k.num)) + 1;
      DB.causes.push({ id: uid('k'), num, name, fixed: false });
      logAct('Ajustes', `Causa creada: ${num} · ${name}`);
      render({ enter: false }); toast(`Causa ${num} agregada.`);
    },
    'edit-cause': (form) => {
      const k = cause(form.dataset.id), name = String(new FormData(form).get('name') || '').trim();
      if (!k || k.fixed) return;
      if (!name) return showFormError(form, 'Escribe el nombre.');
      if (DB.causes.some((x) => x.id !== k.id && norm(x.name) === norm(name))) return showFormError(form, 'Ya existe una causa con ese nombre.');
      logAct('Ajustes', `Causa ${k.num} renombrada: ${k.name} → ${name}`);
      k.name = name;
      closeModal(); render({ enter: false }); toast('Guardado.');
    },
    'add-specialty': (form) => {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) return toast('Escribe el nombre.', 'error');
      if (DB.specialties.some((s) => norm(s) === norm(name))) return toast('Ya existe.', 'error');
      DB.specialties.push(name);
      logAct('Ajustes', `Especialidad creada: ${name}`);
      render({ enter: false }); toast('Agregado.');
    },
    'add-off': (form) => {
      const d = String(new FormData(form).get('date') || '');
      if (!d) return toast('Elige una fecha.', 'error');
      if (dayIdx(d) === 6) return toast('Los domingos ya no cuentan como día de obra.', 'info');
      if (isOff(S.projectId, d)) return toast('Ese día ya está sin obra.', 'info');
      DB.offDays.push({ projectId: S.projectId, date: d });
      logAct('Ajustes', `Día sin obra: ${fmtDayLong(d)}`);
      render({ enter: false }); toast('Día marcado sin obra.');
    },
    formula: (form) => {
      const f = readFormulaForm(form);
      const bad = (m) => toast(m, 'error');
      const wk = ['ppc', 'calidad', 'seguridad', 'limpieza'];
      if (wk.some((k) => !isNum(f.weights[k]) || f.weights[k] < 0 || f.weights[k] > 100)) return bad('Cada peso debe estar entre 0 y 100.');
      if (weightSum(f.weights) !== 100) return bad('Los pesos deben sumar exactamente 100.');
      if (!isNum(f.faltaFactor) || f.faltaFactor < 0 || f.faltaFactor > 1) return bad('El factor de falta grave va de 0 a 1.');
      if (Object.keys(f.th).some((k) => !isNum(f.th[k]) || f.th[k] < 0)) return bad('Revisa las metas y umbrales.');
      if (f.th.meta > 100 || f.th.excPpc > 100) return bad('Las metas de PPC no pueden pasar de 100.');
      if (!f.fm.length) return bad('Agrega al menos un rango de FM.');
      if (f.fm.some((r) => !isNum(r.min) || !isNum(r.fm) || r.fm <= 0 || (r.max != null && (!isNum(r.max) || r.max < r.min)))) return bad('Revisa la tabla de FM: desde, hasta y factor.');
      f.fm.sort((a, b) => a.min - b.min);
      for (let i = 0; i < f.fm.length; i++) {
        if (f.fm[i].max == null && i < f.fm.length - 1) return bad('Solo el último rango puede quedar sin límite.');
        if (i > 0 && f.fm[i].min <= f.fm[i - 1].max) return bad('Los rangos de personal no pueden superponerse.');
      }
      CFG.weights = { ppc: f.weights.ppc, calidad: f.weights.calidad, seguridad: f.weights.seguridad, limpieza: f.weights.limpieza };
      CFG.faltaFactor = f.faltaFactor;
      Object.assign(CFG, f.th);
      CFG.fm = f.fm.map((r) => ({ min: r.min, max: r.max, fm: r.fm }));
      logAct('Ajustes', `Fórmula actualizada: pesos ${wk.map((k) => CFG.weights[k]).join('/')}, falta ×${CFG.faltaFactor}, meta ${CFG.meta}%`);
      S.fdraft = null;
      render({ enter: false }); toast('Fórmula guardada.');
    },
    sim: (form) => {
      const fd = new FormData(form), date = String(fd.get('date') || ''), time = String(fd.get('time') || '');
      if (!date || !time) return toast('Elige fecha y hora.', 'error');
      S.sim = { date, time };
      syncClock(); render({ enter: false });
      toast(`Fecha simulada: ${fmtDay(date)} ${time}.`, 'info');
    }
  };
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    if (FORMS[form.dataset.form]) FORMS[form.dataset.form](form);
  });

  /* =========================================================
     ARRANQUE
     ========================================================= */
  syncClock();
  S.planCount = CFG.weeksVisible;
  $('.ico-sun').innerHTML = I.sun;
  $('.ico-moon').innerHTML = I.moon;
  goto('dashboard');
  window.__AR = { DB, S, CFG, today, lockInfo, calcScore, weekRows, stats };   // solo para pruebas
})();
