/* =========================================================
   Araucaria · Last Planner — Aplicación
   JavaScript puro, sin librerías. Los datos viven en memoria:
   al recargar la página vuelven los datos de demostración.
   ========================================================= */
(function () {
  'use strict';

  const DB = JSON.parse(JSON.stringify(window.DEMO_DATA));

  /* ---------- Reglas de calificación (ejemplo para validar con el cliente) ---------- */
  const RULES = {
    meta: 80,            // PPC objetivo
    minFinal: 70,        // puntaje mínimo para ser elegible
    excFinal: 90,        // puntaje para excelencia
    excPpc: 90,          // PPC para excelencia
    minCompWeek: 2,      // compromisos evaluados mínimos en la semana
    faltaFactor: 0.5,    // multiplicador por falta grave
    minWeeksMonth: 2,    // semanas mínimas para ganador mensual
    minCompMonth: 4      // compromisos mínimos en el mes
  };

  const DAY = 864e5;
  const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const DOW_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const CAUSE_COLORS = ['#e5484d', '#f59e0b', '#3b82f6', '#a855f7', '#14b8a6', '#ec4899', '#64748b', '#0ea5e9', '#f97316', '#6366f1', '#84cc16', '#d946ef'];
  const SECTOR_COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#a855f7', '#ec4899', '#64748b', '#0ea5e9', '#f97316'];

  /* ---------- Íconos (SVG en línea) ---------- */
  const svg = (p, extra = '') => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
  const I = {
    home: svg('<path d="M3 13h8V3H3z"/><path d="M13 21h8V11h-8z"/><path d="M13 3h8v5h-8z"/><path d="M3 21h8v-5H3z"/>'),
    plan: svg('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 14h3M8 17h6"/>'),
    eval: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
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
    calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')
  };

  const NAV = [
    { id: 'inicio', label: 'Tablero', short: 'Tablero', icon: I.home },
    { id: 'plan', label: 'Plan semanal', short: 'Plan', icon: I.plan },
    { id: 'evaluar', label: 'Evaluar día', short: 'Evaluar', icon: I.eval },
    { id: 'calificacion', label: 'Calificación', short: 'Calificar', icon: I.trophy },
    { id: 'config', label: 'Configuración', short: 'Ajustes', icon: I.cog }
  ];

  /* ---------- Estado de la interfaz ---------- */
  const S = {
    view: 'inicio',
    projectId: DB.projects[0].id,
    week: DB.currentWeek,
    period: 'week',
    dashContractor: '',
    dashCause: '',
    planDay: null,
    planContractor: '',
    evalDay: null,
    evalDraft: {},
    evalErrors: {},
    scoreTab: 'calificar',
    scoreDraft: {},
    month: null,
    histContractor: '',
    cfgTab: 'proyectos'
  };
  let pendingConfirm = null;
  let uidSeq = 1;
  const uid = (p) => `${p}${Date.now().toString(36)}${(uidSeq++).toString(36)}`;

  /* ---------- Utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const r1 = (n) => Math.round(n * 10) / 10;
  const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const norm = (s) => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  /* ---------- Fechas (todo en UTC para evitar desfases de zona horaria) ---------- */
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
  function fmtDay(s) {
    const d = new Date(parseISO(s));
    return `${DOW[dayIdx(s)]} ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  function fmtDayLong(s) {
    const d = new Date(parseISO(s));
    return `${DOW_LONG[dayIdx(s)]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
  }
  function weekRange(w) {
    const d = weekDates(w);
    const a = new Date(parseISO(d[0])), b = new Date(parseISO(d[5]));
    if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS_SHORT[b.getUTCMonth()]}`;
    return `${a.getUTCDate()} ${MONTHS_SHORT[a.getUTCMonth()]} – ${b.getUTCDate()} ${MONTHS_SHORT[b.getUTCMonth()]}`;
  }
  const monthOfWeek = (w) => isoOf(mondayOf(w) + 3 * DAY).slice(0, 7);   // el mes del jueves
  const weeksOfMonth = (mk) => DB.weeks.filter((w) => monthOfWeek(w) === mk);
  const allMonths = () => [...new Set(DB.weeks.map(monthOfWeek))].sort();
  function monthLabel(mk) { const [y, m] = mk.split('-'); return `${cap(MONTHS[Number(m) - 1])} ${y}`; }
  function defaultDay(week) {
    const dates = weekDates(week);
    return dates.includes(DB.today) ? DB.today : dates[0];
  }

  /* ---------- Acceso a datos ---------- */
  const project = () => byId(DB.projects, S.projectId);
  const contractor = (id) => byId(DB.contractors, id);
  const activity = (id) => byId(DB.activities, id);
  const cause = (id) => byId(DB.causes, id);
  const projActs = (pid = S.projectId) => DB.activities.filter((a) => a.projectId === pid)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  function sectorOf(c) {
    const p = byId(DB.projects, c.projectId);
    return p ? byId(p.sectors, c.sectorId) : null;
  }
  const contractorIdOf = (c) => { const a = activity(c.activityId); return a ? a.contractorId : null; };

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
    list.forEach((c) => { if (c.status === 'done') done++; else if (c.status === 'fail') fail++; else pending++; });
    const evaluated = done + fail;
    return { total: list.length, done, fail, pending, evaluated, ppc: evaluated ? Math.round((done / evaluated) * 100) : null };
  }
  const tone = (p) => (p == null ? 'none' : p >= RULES.meta ? 'good' : p >= 60 ? 'mid' : 'bad');
  const toneLabel = (p) => (p == null ? 'Sin datos' : p >= RULES.meta ? 'Sobre la meta' : p >= 60 ? 'Bajo la meta' : 'Crítico');
  const pctTxt = (p) => (p == null ? '—' : `${p}%`);

  /* ---------- Calificación semanal ---------- */
  const isNum = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(Number(v));
  function calcScore(ppc, v) {
    const complete = isNum(v.calidad) && isNum(v.seguridad) && isNum(v.limpieza) && isNum(v.personal);
    const n = (x) => (isNum(x) ? Number(x) : 0);
    const base = (ppc || 0) * 0.5 + n(v.calidad) * 2 + n(v.seguridad) * 2 + n(v.limpieza) * 1;
    const factor = v.falta ? RULES.faltaFactor : 1;
    return { base: r1(base), factor, final: r1(base * factor), complete };
  }
  const scoreKey = (cid, week = S.week, pid = S.projectId) => `${pid}|${week}|${cid}`;
  const savedScore = (cid, week, pid = S.projectId) => DB.scores.find((s) => s.projectId === pid && s.week === week && s.contractorId === cid);
  const pickVal = (d, s) => (d !== undefined ? d : (s === undefined || s === null ? '' : s));

  function scoreValues(cid, week, useDraft) {
    const saved = savedScore(cid, week) || {};
    const d = useDraft ? (S.scoreDraft[scoreKey(cid, week)] || {}) : {};
    return {
      calidad: pickVal(d.calidad, saved.calidad),
      seguridad: pickVal(d.seguridad, saved.seguridad),
      limpieza: pickVal(d.limpieza, saved.limpieza),
      personal: pickVal(d.personal, saved.personal),
      falta: d.falta !== undefined ? d.falta : !!saved.falta,
      note: saved.note || '',
      saved: !!savedScore(cid, week)
    };
  }

  function rankRows(rows) {
    rows.forEach((r) => {
      r.winner = false;
      r.reason = '';
      if (r.st.evaluated === 0) { r.state = 'nodata'; r.reason = 'Sin compromisos evaluados'; }
      else if (!r.calc.complete) { r.state = 'incomplete'; r.reason = 'Falta completar criterios'; }
      else if (r.v.falta) { r.state = 'noelig'; r.reason = 'Falta grave'; }
      else if (r.st.evaluated < r.minComp) { r.state = 'noelig'; r.reason = `Menos de ${r.minComp} compromisos`; }
      else if (r.minWeeks && r.weeks < r.minWeeks) { r.state = 'noelig'; r.reason = `Menos de ${r.minWeeks} semanas`; }
      else if (r.calc.final < RULES.minFinal) { r.state = 'noelig'; r.reason = `Puntaje menor a ${RULES.minFinal}`; }
      else if (r.calc.final >= RULES.excFinal && r.st.ppc >= RULES.excPpc) { r.state = 'exc'; r.reason = 'Excelencia'; }
      else { r.state = 'elig'; r.reason = 'Elegible'; }
    });
    const elig = rows.filter((r) => r.state === 'elig' || r.state === 'exc')
      .sort((a, b) => b.calc.final - a.calc.final || b.st.ppc - a.st.ppc || a.name.localeCompare(b.name));
    if (elig[0]) elig[0].winner = true;
    return rows.sort((a, b) => {
      const av = a.state === 'nodata' ? -1 : a.calc.final, bv = b.state === 'nodata' ? -1 : b.calc.final;
      return bv - av || a.name.localeCompare(b.name);
    });
  }

  function weekRows(week, useDraft) {
    const list = commitmentsWhere({ weeks: [week] });
    const cids = [...new Set(list.map(contractorIdOf).filter(Boolean))];
    const rows = cids.map((cid) => {
      const st = stats(list.filter((c) => contractorIdOf(c) === cid));
      const v = scoreValues(cid, week, useDraft);
      const c = contractor(cid);
      return { cid, name: c ? c.name : '—', specialty: c ? c.specialty : '', st, v, calc: calcScore(st.ppc, v), minComp: RULES.minCompWeek, week };
    });
    return rankRows(rows);
  }

  function monthRows(mk) {
    const weeks = weeksOfMonth(mk);
    const list = commitmentsWhere({ weeks });
    const cids = [...new Set(list.map(contractorIdOf).filter(Boolean))];
    const rows = cids.map((cid) => {
      const mine = list.filter((c) => contractorIdOf(c) === cid);
      const st = stats(mine);
      const weeksPart = weeks.filter((w) => stats(mine.filter((c) => weekDates(w).includes(c.date))).evaluated > 0);
      const scs = weeksPart.map((w) => savedScore(cid, w)).filter(Boolean);
      const avg = (k) => (scs.length ? r1(scs.reduce((s, x) => s + Number(x[k]), 0) / scs.length) : '');
      const v = { calidad: avg('calidad'), seguridad: avg('seguridad'), limpieza: avg('limpieza'), personal: scs.length ? Math.round(avg('personal')) : '', falta: scs.some((x) => x.falta) };
      const c = contractor(cid);
      return { cid, name: c ? c.name : '—', specialty: c ? c.specialty : '', st, v, calc: calcScore(st.ppc, v), weeks: weeksPart.length, minComp: RULES.minCompMonth, minWeeks: RULES.minWeeksMonth };
    });
    return rankRows(rows);
  }

  const STATE_LABEL = { nodata: 'Sin datos', incomplete: 'Incompleto', noelig: 'No elegible', elig: 'Elegible', exc: 'Excelencia' };
  function statePill(r) {
    if (r.winner) return `<span class="pill pill-win">${I.trophy}Ganador</span>`;
    return `<span class="pill pill-${r.state}" title="${esc(r.reason)}">${STATE_LABEL[r.state]}</span>`;
  }

  /* ---------- Componentes visuales ---------- */
  function pageHead(title, sub, actions = '') {
    return `<div class="page-head">
      <div class="ph-text">
        <h1>${title}</h1>
        ${sub ? `<p class="ph-sub">${sub}</p>` : ''}
      </div>
      ${actions ? `<div class="ph-actions">${actions}</div>` : ''}
    </div>`;
  }
  const exportBtns = (cls = '') => `<div class="export-group ${cls}" role="group" aria-label="Exportar">
      <button type="button" class="btn btn-soft btn-sm" data-action="export" data-format="PDF" aria-label="Exportar a PDF">${I.pdf}<span>PDF</span></button>
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
  function chip(c) {
    const s = sectorOf(c);
    const st = { done: 'Cumplió', fail: 'No cumplió', pending: 'Pendiente' }[c.status];
    return `<button type="button" class="chip st-${c.status}" style="--c:${s ? s.color : '#64748b'}" data-action="edit-commitment" data-id="${c.id}" title="${esc(c.floor)}, ${esc(s ? s.name : '')}: ${st}">
      <i class="chip-st">${statusIcon(c.status)}</i><span>${esc(c.floor)}</span><b>${esc(s ? s.code : '—')}</b>
    </button>`;
  }

  function gauge(p) {
    const r = 52, C = 2 * Math.PI * r;
    const val = p == null ? 0 : p;
    const metaAngle = (RULES.meta / 100) * 360 - 90;
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

  const yAxis = () => `<div class="chart-y" aria-hidden="true">${[100, RULES.meta, 50, 25, 0].map((v) => `<span style="bottom:${v}%" class="${v === RULES.meta ? 'meta' : ''}">${v}</span>`).join('')}</div>`;

  // Gráfico de columnas en HTML/CSS: se adapta a cualquier ancho sin deformar el texto
  function columnChart(items) {
    const n = items.length;
    return `<div class="chart" style="--n:${n}">
      ${yAxis()}
      <div class="chart-main">
        <div class="chart-plot">
          ${[25, 50, 100].map((v) => `<i class="chart-line" style="bottom:${v}%"></i>`).join('')}
          <div class="chart-target" style="bottom:${RULES.meta}%"></div>
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

  // Gráfico de línea: SVG estirable para el trazo + puntos y etiquetas en HTML
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
          <div class="chart-target" style="bottom:${RULES.meta}%"></div>
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

  function donut(slices, total) {
    let acc = 0;
    const segs = slices.map((s) => {
      const p = (s.count / total) * 100;
      const seg = `<circle cx="21" cy="21" r="15.915" class="d-seg${S.dashCause && S.dashCause !== s.id ? ' dim' : ''}" stroke="${s.color}" stroke-dasharray="${p.toFixed(3)} ${(100 - p).toFixed(3)}" stroke-dashoffset="${(25 - acc).toFixed(3)}"/>`;
      acc += p;
      return seg;
    }).join('');
    return `<div class="donut"><svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="15.915" class="d-track"/>${segs}</svg>
      <div class="donut-center"><strong>${total}</strong><span>no cumplidos</span></div></div>`;
  }

  function dayTabs(dates, active, action, badgeFn, badgeTone) {
    return `<div class="day-tabs" role="tablist">${dates.map((d) => {
      const n = badgeFn ? badgeFn(d) : 0;
      const isToday = d === DB.today;
      return `<button type="button" role="tab" aria-selected="${d === active}" class="day-tab${d === active ? ' active' : ''}${isToday ? ' today' : ''}${d > DB.today ? ' future' : ''}" data-action="${action}" data-date="${d}">
        <span class="dt-dow">${isToday ? 'Hoy' : DOW[dayIdx(d)]}</span><span class="dt-num">${dayNum(d)}</span>
        ${n ? `<span class="dt-badge badge-${badgeTone}">${n}</span>` : ''}
      </button>`;
    }).join('')}</div>`;
  }

  function contractorOptions(selected, list, emptyLabel) {
    return `${emptyLabel ? `<option value="">${emptyLabel}</option>` : ''}${list.map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}`;
  }
  function projectContractors() {
    const ids = new Set(projActs().map((a) => a.contractorId));
    return DB.contractors.filter((c) => ids.has(c.id)).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function rtable(headers, rows, cls = '') {
    return `<div class="rtable-wrap"><table class="rtable ${cls}">
      <thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr class="${r.cls || ''}">${r.cells.map((c, i) => `<td data-label="${esc(headers[i])}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }
  const empty = (title, text, action = '') => `<div class="empty"><p class="empty-title">${title}</p>${text ? `<p>${text}</p>` : ''}${action}</div>`;

  /* =========================================================
     VISTA: TABLERO
     ========================================================= */
  function viewInicio() {
    const weeks = S.period === 'week' ? [S.week] : weeksOfMonth(monthOfWeek(S.week));
    const cid = S.dashContractor;
    const list = commitmentsWhere({ weeks, contractorId: cid });
    const st = stats(list);

    // Comparación con el período anterior
    let prevSt = null, prevLabel = '';
    if (S.period === 'week') {
      if (DB.weeks.includes(S.week - 1)) { prevSt = stats(commitmentsWhere({ weeks: [S.week - 1], contractorId: cid })); prevLabel = `semana ${S.week - 1}`; }
    } else {
      const ms = allMonths(), i = ms.indexOf(monthOfWeek(S.week));
      if (i > 0) { prevSt = stats(commitmentsWhere({ weeks: weeksOfMonth(ms[i - 1]), contractorId: cid })); prevLabel = monthLabel(ms[i - 1]).toLowerCase(); }
    }
    let delta = '';
    if (prevSt && prevSt.ppc != null && st.ppc != null) {
      const d = st.ppc - prevSt.ppc;
      delta = `<p class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? I.arrowUp : d < 0 ? I.arrowDown : ''}<span>${d === 0 ? 'Igual que' : `${Math.abs(d)} puntos ${d > 0 ? 'más' : 'menos'} que`} ${esc(prevLabel)}</span></p>`;
    }

    const periodTxt = S.period === 'week'
      ? `Cumplimiento del plan del ${weekRange(S.week)}`
      : `${monthLabel(monthOfWeek(S.week))}, semanas ${weeks[0]} a ${weeks[weeks.length - 1]}`;

    const evaluable = list.filter((c) => c.status === 'pending' && c.date <= DB.today).sort((a, b) => (a.date < b.date ? -1 : 1));
    const banner = evaluable.length
      ? `<div class="banner">
          <span class="banner-ico">${I.alert}</span>
          <p><strong>${evaluable.length} ${evaluable.length === 1 ? 'compromiso espera' : 'compromisos esperan'} evaluación</strong><span>${evaluable[0].date === DB.today ? 'Programados para hoy' : `Desde el ${fmtDayLong(evaluable[0].date).toLowerCase()}`}</span></p>
          <button type="button" class="btn btn-primary btn-sm" data-action="go-eval" data-date="${evaluable[0].date}">Evaluar</button>
        </div>`
      : '';

    // Gráfico por día o por semana
    let chartTitle, chartHtml;
    if (S.period === 'week') {
      chartTitle = 'PPC por día';
      chartHtml = columnChart(weekDates(S.week).map((d) => {
        const s = stats(list.filter((c) => c.date === d));
        return { label: DOW[dayIdx(d)], sub: String(dayNum(d)), value: s.ppc, active: d === DB.today, title: `${s.done} de ${s.evaluated} cumplidos` };
      }));
    } else {
      chartTitle = 'PPC por semana del mes';
      chartHtml = columnChart(weeks.map((w) => {
        const s = stats(list.filter((c) => weekDates(w).includes(c.date)));
        return { label: `S${w}`, sub: weekRange(w), value: s.ppc, active: w === S.week, title: `${s.done} de ${s.evaluated} cumplidos` };
      }));
    }
    const trend = lineChart(DB.weeks.map((w) => ({
      label: `S${w}`, value: stats(commitmentsWhere({ weeks: [w], contractorId: cid })).ppc, active: w === S.week
    })));

    // Causas
    const fails = list.filter((c) => c.status === 'fail');
    const byCause = {};
    fails.forEach((c) => { byCause[c.causeId] = (byCause[c.causeId] || 0) + 1; });
    const slices = Object.keys(byCause).map((k) => ({ id: k, name: cause(k) ? cause(k).name : 'Sin causa', count: byCause[k] }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    slices.forEach((s, i) => { s.color = CAUSE_COLORS[i % CAUSE_COLORS.length]; });
    if (S.dashCause && !byCause[S.dashCause]) S.dashCause = '';

    const causesHtml = fails.length
      ? `<div class="donut-wrap">${donut(slices, fails.length)}
          <div class="legend">${slices.map((s) => `<button type="button" class="lg-item${S.dashCause === s.id ? ' active' : ''}" data-action="dash-cause" data-id="${s.id}" aria-pressed="${S.dashCause === s.id}">
            <i style="background:${s.color}"></i><span class="lg-name">${esc(s.name)}</span><span class="lg-count">${s.count}</span><strong>${Math.round((s.count / fails.length) * 100)}%</strong>
          </button>`).join('')}</div></div>`
      : empty('Sin incumplimientos', st.evaluated ? 'Todo lo evaluado en este período se cumplió.' : 'Aún no hay compromisos evaluados.');

    // PPC por contratista (siempre todos, para poder filtrar tocando)
    const listAll = commitmentsWhere({ weeks });
    const cRows = [...new Set(listAll.map(contractorIdOf).filter(Boolean))].map((id) => {
      const s = stats(listAll.filter((c) => contractorIdOf(c) === id));
      return { id, name: contractor(id) ? contractor(id).name : '—', specialty: contractor(id) ? contractor(id).specialty : '', s };
    }).sort((a, b) => (b.s.ppc == null ? -1 : b.s.ppc) - (a.s.ppc == null ? -1 : a.s.ppc) || a.name.localeCompare(b.name));
    const contractorsHtml = cRows.length
      ? `<div class="bars">${cRows.map((r) => `<button type="button" class="bar-row${cid === r.id ? ' active' : ''}" data-action="dash-contractor" data-id="${r.id}" aria-pressed="${cid === r.id}">
          <span class="bar-top"><span class="bar-name">${esc(r.name)}<small>${esc(r.specialty)}, ${r.s.done} de ${r.s.evaluated}</small></span><strong class="t-${tone(r.s.ppc)}">${pctTxt(r.s.ppc)}</strong></span>
          <span class="bar-track"><span class="bar-fill tone-${tone(r.s.ppc)}" style="width:${r.s.ppc || 0}%"></span></span>
        </button>`).join('')}</div>`
      : empty('Sin compromisos', 'No hay compromisos programados en este período.');

    // Detalle de una causa seleccionada
    let causeDetail = '';
    if (S.dashCause) {
      const cf = fails.filter((c) => c.causeId === S.dashCause);
      const per = {};
      cf.forEach((c) => { const k = contractorIdOf(c); per[k] = (per[k] || 0) + 1; });
      const rows = Object.keys(per).map((k) => ({ name: contractor(k) ? contractor(k).name : '—', n: per[k] })).sort((a, b) => b.n - a.n);
      causeDetail = `<section class="card span-2 cause-detail">
        <div class="card-head"><div><h2>Quién tuvo «${esc(cause(S.dashCause) ? cause(S.dashCause).name : '')}»</h2><p class="card-sub">${cf.length} de ${fails.length} incumplimientos del período</p></div>
        <button type="button" class="btn btn-ghost btn-sm" data-action="dash-cause" data-id="${S.dashCause}">${I.x}<span>Quitar filtro</span></button></div>
        <div class="bars">${rows.map((r) => `<div class="bar-row static"><span class="bar-top"><span class="bar-name">${esc(r.name)}</span><strong>${r.n} (${Math.round((r.n / cf.length) * 100)}%)</strong></span>
          <span class="bar-track"><span class="bar-fill tone-bad" style="width:${(r.n / cf.length) * 100}%"></span></span></div>`).join('')}</div>
      </section>`;
    }

    // Últimos incumplimientos
    const recent = fails.filter((c) => !S.dashCause || c.causeId === S.dashCause)
      .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)).slice(0, 6);
    const recentHtml = recent.length
      ? `<ul class="fail-list">${recent.map((c) => {
          const a = activity(c.activityId), ct = contractor(contractorIdOf(c));
          return `<li><div class="fl-top"><strong>${esc(a ? a.name : '')}</strong>${locBadge(c)}</div>
            <p class="fl-meta">${fmtDay(c.date)}, ${esc(ct ? ct.name : '')}</p>
            <p class="fl-cause"><span class="pill pill-noelig">${esc(cause(c.causeId) ? cause(c.causeId).name : 'Sin causa')}</span></p>
            ${c.note ? `<p class="fl-note">${esc(c.note)}</p>` : ''}</li>`;
        }).join('')}</ul>`
      : empty('Nada que revisar', 'No hay incumplimientos registrados.');

    const cName = cid && contractor(cid) ? contractor(cid).name : '';
    const seg = `<div class="segmented" role="tablist" aria-label="Período">
        <button type="button" class="${S.period === 'week' ? 'active' : ''}" data-action="period" data-period="week" aria-selected="${S.period === 'week'}">Semana</button>
        <button type="button" class="${S.period === 'month' ? 'active' : ''}" data-action="period" data-period="month" aria-selected="${S.period === 'month'}">Mes</button>
      </div>`;
    return `${pageHead('Tablero', periodTxt, seg + exportBtns('hide-sm'))}
      <div class="toolbar">
        <label class="select-inline select-wide"><span class="sr-only">Contratista</span>
          <select data-change="dash-contractor">${contractorOptions(cid, projectContractors(), 'Todos los contratistas')}</select>
        </label>
      </div>
      ${cName ? `<div class="filter-note">${I.filter}<span>Mostrando solo <b>${esc(cName)}</b></span><button type="button" class="link-btn" data-action="dash-contractor" data-id="${cid}">Ver todos</button></div>` : ''}
      ${banner}
      <div class="kpi-grid">
        <section class="kpi-hero tone-${tone(st.ppc)}">
          <svg class="hero-mark" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 L96 96 L78 96 L50 38 L22 96 L4 96 Z"/></svg>
          ${gauge(st.ppc)}
          <div class="kh-text">
            <p class="kh-label">Porcentaje de plan cumplido</p>
            <p class="kh-status"><span class="pill pill-tone-${tone(st.ppc)}">${toneLabel(st.ppc)}</span></p>
            <p class="kh-desc">${st.done} cumplidos de ${st.evaluated} evaluados. Meta ${RULES.meta}%.</p>
            ${delta}
          </div>
        </section>
        <section class="kpi"><span class="kpi-ico k-total">${I.calendar}</span><p class="kpi-label">Compromisos</p><p class="kpi-value">${st.total}</p><p class="kpi-foot">programados</p></section>
        <section class="kpi"><span class="kpi-ico k-done">${I.check}</span><p class="kpi-label">Cumplidos</p><p class="kpi-value">${st.done}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.done / st.evaluated) * 100) : 0}% de lo evaluado</p></section>
        <section class="kpi"><span class="kpi-ico k-fail">${I.x}</span><p class="kpi-label">No cumplidos</p><p class="kpi-value">${st.fail}</p><p class="kpi-foot">${st.evaluated ? Math.round((st.fail / st.evaluated) * 100) : 0}% de lo evaluado</p></section>
        <section class="kpi"><span class="kpi-ico k-pend"><b class="dot"></b></span><p class="kpi-label">Pendientes</p><p class="kpi-value">${st.pending}</p><p class="kpi-foot">por evaluar</p></section>
      </div>
      <div class="dash-grid">
        <section class="card"><div class="card-head"><div><h2>${chartTitle}</h2><p class="card-sub">Línea punteada: meta de ${RULES.meta}%. Verde sobre la meta, ámbar de 60 a 79%, rojo bajo 60%.</p></div></div>${chartHtml}</section>
        <section class="card"><div class="card-head"><div><h2>Tendencia semanal</h2><p class="card-sub">PPC de las ${DB.weeks.length} semanas registradas${cName ? ` de ${esc(cName)}` : ''}</p></div></div>${trend}</section>
        <section class="card"><div class="card-head"><div><h2>Causas de incumplimiento</h2><p class="card-sub">Toca una causa para ver a quién afectó</p></div></div>${causesHtml}</section>
        <section class="card"><div class="card-head"><div><h2>PPC por contratista</h2><p class="card-sub">Toca un contratista para filtrar el tablero</p></div></div>${contractorsHtml}</section>
        ${causeDetail}
        <section class="card span-2"><div class="card-head"><div><h2>Últimos incumplimientos</h2><p class="card-sub">Con la observación registrada en obra</p></div></div>${recentHtml}</section>
      </div>
      <div class="page-foot only-sm"><p>Exportar tablero</p>${exportBtns()}</div>`;
  }

  /* =========================================================
     VISTA: PLAN SEMANAL
     ========================================================= */
  function viewPlan() {
    const dates = weekDates(S.week);
    if (!dates.includes(S.planDay)) S.planDay = defaultDay(S.week);
    let acts = projActs();
    if (S.planContractor) acts = acts.filter((a) => a.contractorId === S.planContractor);
    const list = commitmentsWhere({ weeks: [S.week], contractorId: S.planContractor });
    const st = stats(list);
    const p = project();

    const actions = `<button type="button" class="btn btn-soft btn-sm" data-action="new-activity">${I.plus}<span>Actividad</span></button>
      <button type="button" class="btn btn-primary btn-sm" data-action="new-commitment">${I.plus}<span>Compromiso</span></button>`;

    const summary = `<div class="stat-strip">
      <span><b>${st.total}</b> compromisos</span><span class="t-good"><b>${st.done}</b> cumplidos</span>
      <span class="t-bad"><b>${st.fail}</b> no cumplidos</span><span class="t-muted"><b>${st.pending}</b> pendientes</span>
    </div>`;

    const legend = `<div class="sector-legend" aria-label="Sectores">${p.sectors.map((s) => `<span style="--c:${s.color}"><i></i>${esc(s.code)}${s.code !== s.name ? ` <small>${esc(s.name)}</small>` : ''}</span>`).join('')}</div>`;

    const toolbar = `<div class="toolbar">
      <label class="select-inline select-wide"><span class="sr-only">Contratista</span>
        <select data-change="plan-contractor">${contractorOptions(S.planContractor, projectContractors(), 'Todos los contratistas')}</select>
      </label>${summary}
    </div>${legend}`;

    if (!projActs().length) {
      return `${pageHead('Plan semanal', 'Programa qué hará cada contratista, dónde y qué día.', actions)}
        <section class="card">${empty('Este proyecto aún no tiene actividades', 'Crea la primera actividad para empezar a programar compromisos.', `<button type="button" class="btn btn-primary" data-action="new-activity">${I.plus}<span>Crear actividad</span></button>`)}</section>`;
    }

    // Escritorio: grilla actividad × día
    const desktop = `<div class="plan-desktop"><div class="table-scroll">
      <table class="plan-table">
        <thead><tr><th class="sticky-col" scope="col">Actividad</th>${dates.map((d) => `<th scope="col" class="${d === DB.today ? 'is-today' : ''}"><span class="th-dow">${DOW_LONG[dayIdx(d)]}</span><span class="th-date">${fmtDay(d).split(' ')[1]}${d === DB.today ? ' <em>Hoy</em>' : ''}</span></th>`).join('')}</tr></thead>
        <tbody>${acts.length ? acts.map((a) => {
          const ct = contractor(a.contractorId);
          return `<tr><th class="sticky-col act-cell" scope="row">
              <button type="button" class="act-name" data-action="edit-activity" data-id="${a.id}">${esc(a.name)}${I.edit}</button>
              <span class="act-meta">${esc(ct ? ct.name : '')}, ${esc(a.specialty)}</span></th>
            ${dates.map((d) => {
              const cs = list.filter((c) => c.activityId === a.id && c.date === d);
              return `<td class="${d === DB.today ? 'is-today' : ''}"><div class="cell">${cs.map(chip).join('')}
                <button type="button" class="cell-add" data-action="new-commitment" data-activity="${a.id}" data-date="${d}" aria-label="Agregar compromiso de ${esc(a.name)} el ${fmtDayLong(d)}">${I.plus}</button></div></td>`;
            }).join('')}</tr>`;
        }).join('') : `<tr><td colspan="7">${empty('Sin actividades para este contratista', '')}</td></tr>`}</tbody>
      </table></div></div>`;

    // Teléfono: pestañas por día + tarjetas
    const dayList = list.filter((c) => c.date === S.planDay).sort((a, b) => (activity(a.activityId).name).localeCompare(activity(b.activityId).name, 'es'));
    const mobile = `<div class="plan-mobile">
      ${dayTabs(dates, S.planDay, 'plan-day', (d) => list.filter((c) => c.date === d).length, 'neutral')}
      <div class="day-head"><h2>${fmtDayLong(S.planDay)}</h2><span>${dayList.length} ${dayList.length === 1 ? 'compromiso' : 'compromisos'}</span></div>
      ${dayList.length ? `<div class="plan-list">${dayList.map((c) => {
        const a = activity(c.activityId), ct = contractor(a.contractorId);
        return `<button type="button" class="plan-item st-${c.status}" data-action="edit-commitment" data-id="${c.id}">
          <span class="pi-status">${statusIcon(c.status)}</span>
          <span class="pi-main"><strong>${esc(a.name)}</strong><small>${esc(ct ? ct.name : '')}, ${esc(a.specialty)}</small></span>
          ${locBadge(c)}
        </button>`;
      }).join('')}</div>` : empty('Día sin compromisos', 'Agrega lo que se hará este día.')}
      <button type="button" class="btn btn-dashed btn-block" data-action="new-commitment" data-date="${S.planDay}">${I.plus}<span>Agregar compromiso para el ${DOW_LONG[dayIdx(S.planDay)].toLowerCase()}</span></button>
      <details class="card acts-card">
        <summary><span>Actividades del proyecto</span><b>${acts.length}</b></summary>
        <ul class="acts-list">${acts.map((a) => {
          const ct = contractor(a.contractorId);
          const n = list.filter((c) => c.activityId === a.id).length;
          return `<li><button type="button" data-action="edit-activity" data-id="${a.id}"><span><strong>${esc(a.name)}</strong><small>${esc(ct ? ct.name : '')}, ${esc(a.specialty)}</small></span><em>${n} esta semana</em>${I.edit}</button></li>`;
        }).join('')}</ul>
      </details>
    </div>`;

    return `${pageHead('Plan semanal', 'Programa qué hará cada contratista, dónde y qué día.', actions)}
      ${toolbar}${desktop}${mobile}
      <div class="page-foot">${exportBtns()}</div>`;
  }

  /* =========================================================
     VISTA: EVALUAR DÍA
     ========================================================= */
  function effective(c) {
    const d = S.evalDraft[c.id];
    return d ? Object.assign({}, c, d) : c;
  }
  function evalDraftCount() { return Object.keys(S.evalDraft).length; }

  function viewEvaluar() {
    const dates = weekDates(S.week);
    if (!dates.includes(S.evalDay)) S.evalDay = defaultDay(S.week);
    const day = S.evalDay;
    const future = day > DB.today;
    const list = commitmentsWhere({ dates: [day] }).sort((a, b) => activity(a.activityId).name.localeCompare(activity(b.activityId).name, 'es'));
    const effList = list.map(effective);
    const st = stats(effList);
    const weekList = commitmentsWhere({ weeks: [S.week] });

    const pendingOf = (d) => (d > DB.today ? 0 : weekList.filter((c) => c.date === d && effective(c).status === 'pending').length);
    const progress = list.length ? Math.round((st.evaluated / list.length) * 100) : 0;

    const head = `<div class="eval-summary card">
      <div class="es-top">
        <div><h2>${fmtDayLong(day)}</h2><p class="card-sub">${future ? 'Día futuro' : day === DB.today ? 'Hoy' : 'Día pasado'}, ${list.length} ${list.length === 1 ? 'compromiso programado' : 'compromisos programados'}</p></div>
        <div class="es-ppc"><span>PPC del día</span><strong class="t-${tone(st.ppc)}">${pctTxt(st.ppc)}</strong></div>
      </div>
      <div class="progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <div class="es-foot"><span>${st.evaluated} de ${list.length} evaluados</span>
        ${!future && st.pending ? `<button type="button" class="link-btn" data-action="eval-all-done">Marcar pendientes como cumplidos</button>` : ''}</div>
    </div>`;

    const futureNote = future ? `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Este día aún no llega</strong><span>Hoy es ${fmtDayLong(DB.today).toLowerCase()}. Podrás evaluarlo cuando corresponda.</span></p></div>` : '';

    const causeOpts = (sel) => `<option value="">Selecciona una causa</option>${DB.causes.map((k) => `<option value="${k.id}"${k.id === sel ? ' selected' : ''}>${esc(k.name)}</option>`).join('')}`;

    const cards = list.length ? `<div class="eval-grid">${list.map((c) => {
      const e = effective(c), a = activity(c.activityId), ct = contractor(a.contractorId);
      const changed = !!S.evalDraft[c.id];
      const dis = future ? ' disabled' : '';
      return `<article class="eval-card st-${e.status}${changed ? ' changed' : ''}">
        <header class="ec-head"><div><h3>${esc(a.name)}</h3><p>${esc(ct ? ct.name : '')}, ${esc(a.specialty)}</p></div>${locBadge(c)}</header>
        <div class="seg-2" role="group" aria-label="Resultado">
          <button type="button" class="seg-btn ok${e.status === 'done' ? ' on' : ''}" data-action="eval-set" data-id="${c.id}" data-status="done" aria-pressed="${e.status === 'done'}"${dis}>${I.check}<span>Cumplió</span></button>
          <button type="button" class="seg-btn ko${e.status === 'fail' ? ' on' : ''}" data-action="eval-set" data-id="${c.id}" data-status="fail" aria-pressed="${e.status === 'fail'}"${dis}>${I.x}<span>No cumplió</span></button>
        </div>
        ${e.status === 'fail' ? `<div class="ec-fail">
          <label class="field"><span>Causa de incumplimiento</span>
            <select data-change="eval-cause" data-id="${c.id}" class="${S.evalErrors[c.id] ? 'invalid' : ''}"${dis}>${causeOpts(e.causeId)}</select></label>
          ${S.evalErrors[c.id] ? '<p class="field-err">Elige la causa para poder guardar.</p>' : ''}
          <label class="field"><span>Observación <small>opcional</small></span>
            <textarea rows="2" data-input="eval-note" data-id="${c.id}" placeholder="Qué pasó en obra"${dis}>${esc(e.note)}</textarea></label>
        </div>` : ''}
        ${changed ? '<p class="ec-changed">Cambio sin guardar</p>' : ''}
      </article>`;
    }).join('')}</div>`
      : `<section class="card">${empty('No hay compromisos este día', 'Prográmalos en el plan semanal.', `<button type="button" class="btn btn-soft" data-action="nav" data-view="plan">${I.plan}<span>Ir al plan semanal</span></button>`)}</section>`;

    return `${pageHead('Evaluar día', 'Marca si cada compromiso se cumplió. Si no, registra la causa.')}
      ${dayTabs(dates, day, 'eval-day', pendingOf, 'warn')}
      ${futureNote}${head}${cards}
      ${saveBar('eval', evalDraftCount(), 'Guardar')}`;
  }

  function saveBar(kind, count, label) {
    if (!count) return `<div class="savebar-empty" id="${kind}Savebar"></div>`;
    return `<div class="savebar${count ? '' : ' clean'}" id="${kind}Savebar">
      <p><strong>${count}</strong> ${count === 1 ? 'cambio' : 'cambios'} sin guardar</p>
      <div class="sb-btns">
        ${count ? `<button type="button" class="btn btn-ghost btn-sm" data-action="${kind}-discard">Descartar</button>` : ''}
        <button type="button" class="btn btn-primary btn-sm" data-action="${kind}-save"${count ? '' : ' disabled'}>${label}</button>
      </div>
    </div>`;
  }

  /* =========================================================
     VISTA: CALIFICACIÓN SEMANAL
     ========================================================= */
  function scoreDraftCount() {
    const prefix = `${S.projectId}|${S.week}|`;
    return Object.keys(S.scoreDraft).filter((k) => k.startsWith(prefix)).length;
  }

  function scoreSummary(rows) {
    const win = rows.find((r) => r.winner);
    const exc = rows.filter((r) => r.state === 'exc');
    const scored = rows.filter((r) => r.calc.complete && r.state !== 'nodata');
    const avg = scored.length ? r1(scored.reduce((s, r) => s + r.calc.final, 0) / scored.length) : null;
    const mk = monthOfWeek(S.week);
    const mWin = monthRows(mk).find((r) => r.winner);
    return `<section class="kpi win-card"><span class="kpi-ico k-win">${I.trophy}</span><p class="kpi-label">Ganador de la semana</p>
        <p class="kpi-value kpi-name">${win ? esc(win.name) : 'Sin ganador'}</p><p class="kpi-foot">${win ? `${fmt1(win.calc.final)} puntos` : 'Nadie cumple las condiciones aún'}</p></section>
      <section class="kpi"><span class="kpi-ico k-exc">${I.star}</span><p class="kpi-label">Excelencia</p><p class="kpi-value">${exc.length}</p><p class="kpi-foot">${exc.length ? esc(exc.map((r) => r.name).join(', ')) : 'Ningún contratista'}</p></section>
      <section class="kpi"><span class="kpi-ico k-total">${I.calendar}</span><p class="kpi-label">Ganador de ${esc(monthLabel(mk).toLowerCase())}</p><p class="kpi-value kpi-name">${mWin ? esc(mWin.name) : 'Aún no hay'}</p><p class="kpi-foot">${mWin ? `${fmt1(mWin.calc.final)} puntos` : `Requiere ${RULES.minWeeksMonth} semanas calificadas`}</p></section>
      <section class="kpi"><span class="kpi-ico k-done">${I.users}</span><p class="kpi-label">Promedio de la semana</p><p class="kpi-value">${avg == null ? '—' : fmt1(avg)}</p><p class="kpi-foot">${scored.length} de ${rows.length} calificados</p></section>`;
  }

  const rulesBox = () => `<details class="card rules">
    <summary>${I.info}<span>Cómo se calcula la calificación</span></summary>
    <div class="rules-body">
      <p><b>Puntaje base (0 a 100)</b> = PPC × 0,5 + Calidad × 2 + Seguridad × 2 + Limpieza × 1. Los criterios se califican de 0 a 10.</p>
      <p><b>Factor</b>: ×1,00 normalmente y ×${String(RULES.faltaFactor).replace('.', ',')} si hubo una falta grave. <b>Final</b> = base × factor.</p>
      <p><b>Personal promedio</b> es un dato de control: se registra, pero no suma puntaje.</p>
      <p><b>Elegible</b>: criterios completos, sin falta grave, al menos ${RULES.minCompWeek} compromisos evaluados y final de ${RULES.minFinal} o más. <b>Excelencia</b>: final de ${RULES.excFinal} o más y PPC de ${RULES.excPpc}% o más.</p>
      <p><b>Ganador semanal</b>: el mayor puntaje entre elegibles. <b>Ganador mensual</b>: igual, con el PPC del mes y el promedio de sus criterios; requiere ${RULES.minWeeksMonth} semanas y ${RULES.minCompMonth} compromisos.</p>
      <p class="t-muted">Reglas de ejemplo para el prototipo; se ajustan con el cliente.</p>
    </div>
  </details>`;

  function scoreCardOut(r) {
    return `<div class="sc-out" data-out="${r.cid}">
      <div><span>Base</span><strong>${fmt1(r.calc.base)}</strong></div>
      <div><span>Factor</span><strong class="${r.v.falta ? 't-bad' : ''}">×${r.calc.factor.toFixed(2).replace('.', ',')}</strong></div>
      <div class="sc-final"><span>Final</span><strong>${fmt1(r.calc.final)}</strong></div>
    </div>`;
  }

  function viewCalificacion() {
    const rows = weekRows(S.week, true);
    const tabs = [['calificar', 'Calificar'], ['ranking', 'Ranking'], ['mes', 'Ganador del mes'], ['historico', 'Histórico']];
    let body = '';

    if (S.scoreTab === 'calificar') {
      const numField = (r, field, label, max, step) => {
        const val = r.v[field];
        const bad = isNum(val) && (Number(val) < 0 || Number(val) > max);
        return `<label class="num-field"><span>${label}</span>
          <input type="number" inputmode="decimal" min="0" max="${max}" step="${step}" value="${esc(val)}" placeholder="0–${max}"
            data-input="score" data-cid="${r.cid}" data-field="${field}" data-max="${max}" class="${bad ? 'invalid' : ''}"${r.state === 'nodata' ? ' disabled' : ''}></label>`;
      };
      body = rows.length ? `<div class="score-grid">${rows.map((r) => `<article class="score-card${r.winner ? ' is-winner' : ''}" data-cid="${r.cid}">
          <header class="sc-head"><div><h3>${esc(r.name)}</h3><p>${esc(r.specialty)}</p></div><span class="sc-state" data-state="${r.cid}">${statePill(r)}</span></header>
          <div class="sc-ppc"><div><span>PPC de la semana</span><small>Se calcula de la evaluación diaria</small></div>
            <strong class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</strong><em>${r.st.done} de ${r.st.evaluated}</em></div>
          <div class="sc-inputs">
            ${numField(r, 'calidad', 'Calidad', 10, 0.1)}${numField(r, 'seguridad', 'Seguridad', 10, 0.1)}
            ${numField(r, 'limpieza', 'Limpieza', 10, 0.1)}${numField(r, 'personal', 'Personal prom.', 200, 1)}
          </div>
          <label class="switch"><input type="checkbox" data-change="score-falta" data-cid="${r.cid}"${r.v.falta ? ' checked' : ''}${r.state === 'nodata' ? ' disabled' : ''}><span class="switch-ui" aria-hidden="true"></span><span>Hubo falta grave <small>reduce el puntaje a la mitad</small></span></label>
          ${scoreCardOut(r)}
        </article>`).join('')}</div>${saveBar('score', scoreDraftCount(), 'Guardar')}`
        : `<section class="card">${empty('No hay contratistas con compromisos esta semana', 'La calificación aparece cuando hay compromisos en el plan.')}</section>`;
    } else if (S.scoreTab === 'ranking') {
      body = rows.length ? `<section class="card"><div class="card-head"><div><h2>Ranking de la semana ${S.week}</h2><p class="card-sub">Puntaje final de 0 a 100. Incluye cambios aún no guardados.</p></div></div>
        <ol class="rank-list">${rows.map((r, i) => `<li class="${r.winner ? 'is-winner' : ''}">
          <span class="rank-pos">${r.state === 'nodata' ? '–' : i + 1}</span>
          <div class="rank-body"><div class="bar-top"><span class="bar-name">${esc(r.name)}<small>PPC ${pctTxt(r.st.ppc)}, ${esc(r.reason.toLowerCase())}</small></span><strong>${r.state === 'nodata' ? '—' : `${fmt1(r.calc.final)} pts`}</strong></div>
            <span class="bar-track"><span class="bar-fill ${r.state === 'noelig' || r.state === 'incomplete' ? 'tone-muted' : ''}" style="width:${Math.min(r.calc.final, 100)}%"></span></span></div>
          ${statePill(r)}
        </li>`).join('')}</ol></section>` : `<section class="card">${empty('Sin datos esta semana', '')}</section>`;
    } else if (S.scoreTab === 'mes') {
      const months = allMonths();
      if (!S.month || !months.includes(S.month)) S.month = monthOfWeek(S.week);
      const mr = monthRows(S.month);
      const win = mr.find((r) => r.winner);
      body = `<section class="card">
        <div class="card-head"><div><h2>Ganador de ${esc(monthLabel(S.month).toLowerCase())}</h2><p class="card-sub">Semanas ${weeksOfMonth(S.month).join(', ')}. Usa solo calificaciones guardadas.</p></div>
          <label class="select-inline"><span class="sr-only">Mes</span><select data-change="score-month">${months.map((m) => `<option value="${m}"${m === S.month ? ' selected' : ''}>${monthLabel(m)}</option>`).join('')}</select></label></div>
        ${win ? `<div class="winner-banner">${I.trophy}<div><strong>${esc(win.name)}</strong><span>${fmt1(win.calc.final)} puntos, PPC mensual ${pctTxt(win.st.ppc)}</span></div></div>` : `<div class="banner banner-info"><span class="banner-ico">${I.info}</span><p><strong>Aún no hay ganador este mes</strong><span>Nadie cumple todas las condiciones.</span></p></div>`}
        ${mr.length ? rtable(['Contratista', 'Semanas', 'Compromisos', 'PPC mes', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'Final', 'Estado'],
          mr.map((r) => ({ cls: r.winner ? 'hl' : '', cells: [`<strong>${esc(r.name)}</strong>`, r.weeks, r.st.evaluated, `<span class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</span>`,
            isNum(r.v.calidad) ? fmt1(r.v.calidad) : '—', isNum(r.v.seguridad) ? fmt1(r.v.seguridad) : '—', isNum(r.v.limpieza) ? fmt1(r.v.limpieza) : '—', isNum(r.v.personal) ? r.v.personal : '—',
            `<strong>${fmt1(r.calc.final)}</strong>`, statePill(r)] }))) : empty('Sin datos en este mes', '')}
      </section>`;
    } else {
      const all = [];
      DB.weeks.forEach((w) => weekRows(w, false).forEach((r) => { if (r.v.saved) all.push(r); }));
      const filtered = all.filter((r) => !S.histContractor || r.cid === S.histContractor)
        .sort((a, b) => b.week - a.week || b.calc.final - a.calc.final);
      body = `<section class="card">
        <div class="card-head"><div><h2>Histórico de calificaciones</h2><p class="card-sub">${filtered.length} calificaciones guardadas</p></div>
          <label class="select-inline"><span class="sr-only">Contratista</span><select data-change="hist-contractor">${contractorOptions(S.histContractor, projectContractors(), 'Todos')}</select></label></div>
        ${filtered.length ? rtable(['Contratista', 'Semana', 'PPC', 'Calidad', 'Seguridad', 'Limpieza', 'Personal', 'Final', 'Estado', 'Nota'],
          filtered.map((r) => ({ cls: r.winner ? 'hl' : '', cells: [`<strong>${esc(r.name)}</strong>`, `S${r.week}`, `<span class="t-${tone(r.st.ppc)}">${pctTxt(r.st.ppc)}</span>`,
            fmt1(r.v.calidad), fmt1(r.v.seguridad), fmt1(r.v.limpieza), r.v.personal, `<strong>${fmt1(r.calc.final)}</strong>`, statePill(r), `<span class="t-muted note-cell">${esc(r.v.note || '—')}</span>`] }))) : empty('Sin calificaciones guardadas', '')}
      </section>`;
    }

    return `${pageHead('Calificación semanal', 'Califica a cada contratista y conoce a los ganadores.', exportBtns('hide-sm'))}
      <div class="kpi-grid kpi-grid-4" id="scoreSummary">${scoreSummary(rows)}</div>
      <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button type="button" role="tab" class="${S.scoreTab === id ? 'active' : ''}" aria-selected="${S.scoreTab === id}" data-action="score-tab" data-tab="${id}">${label}</button>`).join('')}</div>
      ${S.scoreTab === 'calificar' ? rulesBox() : ''}
      ${body}
      <div class="page-foot only-sm"><p>Exportar calificación</p>${exportBtns()}</div>`;
  }

  // Recalcula puntajes sin redibujar los campos (para no perder el foco al escribir)
  function refreshScores() {
    const rows = weekRows(S.week, true);
    rows.forEach((r) => {
      const out = document.querySelector(`[data-out="${r.cid}"]`);
      if (out) out.outerHTML = scoreCardOut(r);
      const stEl = document.querySelector(`[data-state="${r.cid}"]`);
      if (stEl) stEl.innerHTML = statePill(r);
      const card = document.querySelector(`.score-card[data-cid="${r.cid}"]`);
      if (card) card.classList.toggle('is-winner', r.winner);
    });
    const sum = $('#scoreSummary');
    if (sum) sum.innerHTML = scoreSummary(rows);
    const bar = $('#scoreSavebar');
    if (bar) bar.outerHTML = saveBar('score', scoreDraftCount(), 'Guardar');
    renderNav();
  }

  /* =========================================================
     VISTA: CONFIGURACIÓN
     ========================================================= */
  function viewConfig() {
    const p = project();
    const tabs = [['proyectos', 'Proyectos'], ['contratistas', 'Contratistas'], ['sectores', 'Sectores'], ['pisos', 'Pisos'], ['causas', 'Causas'], ['especialidades', 'Especialidades']];
    const delBtn = (action, id, label) => `<button type="button" class="tag-del" data-action="${action}" data-id="${esc(id)}" aria-label="Eliminar ${esc(label)}">${I.x}</button>`;
    let body = '';

    switch (S.cfgTab) {
      case 'proyectos':
        body = `<section class="card"><div class="card-head"><div><h2>Proyectos</h2><p class="card-sub">Cada edificio tiene sus propios sectores, pisos, actividades y compromisos.</p></div></div>
          <form class="inline-form" data-form="add-project"><label class="field grow"><span class="sr-only">Nombre del proyecto</span><input name="name" placeholder="Ej.: Edificio Distrito Parque" maxlength="60" autocomplete="off"></label><button type="submit" class="btn btn-primary">${I.plus}<span>Agregar proyecto</span></button></form>
          <ul class="cfg-list">${DB.projects.map((x) => {
            const nA = DB.activities.filter((a) => a.projectId === x.id).length;
            const nC = DB.commitments.filter((c) => c.projectId === x.id).length;
            return `<li class="${x.id === S.projectId ? 'current' : ''}"><div><strong>${esc(x.name)}</strong><small>${nA} actividades, ${nC} compromisos, ${x.sectors.length} sectores</small></div>
              <div class="cfg-actions">${x.id === S.projectId ? '<span class="pill pill-elig">En uso</span>' : `<button type="button" class="btn btn-soft btn-sm" data-action="cfg-use-project" data-id="${x.id}">Abrir</button>`}
              ${delBtn('cfg-del-project', x.id, x.name)}</div></li>`;
          }).join('')}</ul></section>`;
        break;
      case 'contratistas':
        body = `<section class="card"><div class="card-head"><div><h2>Contratistas</h2><p class="card-sub">Catálogo único para todos los proyectos. Así cada nombre se escribe una sola vez.</p></div></div>
          <form class="inline-form" data-form="add-contractor">
            <label class="field grow"><span class="sr-only">Nombre</span><input name="name" placeholder="Nombre completo" maxlength="60" autocomplete="off"></label>
            <label class="field"><span class="sr-only">Especialidad</span><select name="specialty">${DB.specialties.map((s) => `<option>${esc(s)}</option>`).join('')}</select></label>
            <button type="submit" class="btn btn-primary">${I.plus}<span>Agregar</span></button></form>
          <ul class="cfg-list">${DB.contractors.slice().sort((a, b) => a.name.localeCompare(b.name, 'es')).map((c) => {
            const n = DB.activities.filter((a) => a.contractorId === c.id).length;
            return `<li><div><strong>${esc(c.name)}</strong><small>${esc(c.specialty)}${c.phone ? `, ${esc(c.phone)}` : ''}, ${n} ${n === 1 ? 'actividad' : 'actividades'}</small></div><div class="cfg-actions">${delBtn('cfg-del-contractor', c.id, c.name)}</div></li>`;
          }).join('')}</ul></section>`;
        break;
      case 'sectores':
        body = `<section class="card"><div class="card-head"><div><h2>Sectores de ${esc(p.name)}</h2><p class="card-sub">El color identifica al sector en el plan y en las evaluaciones.</p></div></div>
          <form class="stack-form" data-form="add-sector">
            <div class="field-row">
              <label class="field"><span>Código corto</span><input name="code" placeholder="Ej.: S4" maxlength="6" autocomplete="off"></label>
              <label class="field"><span>Nombre</span><input name="name" placeholder="Ej.: Sector 4" maxlength="30" autocomplete="off"></label>
            </div>
            <fieldset class="field"><legend>Color</legend><div class="swatches">${SECTOR_COLORS.map((col, i) => `<label class="swatch" style="--c:${col}"><input type="radio" name="color" value="${col}"${i === p.sectors.length % SECTOR_COLORS.length ? ' checked' : ''}><span></span><b class="sr-only">${col}</b></label>`).join('')}</div></fieldset>
            <button type="submit" class="btn btn-primary">${I.plus}<span>Agregar sector</span></button>
          </form>
          <div class="sector-tiles">${p.sectors.map((s) => `<div class="sector-tile" style="--c:${s.color}"><div><strong>${esc(s.code)}</strong><span>${esc(s.name)}</span></div>${delBtn('cfg-del-sector', s.id, s.name)}</div>`).join('')}</div></section>`;
        break;
      case 'pisos':
        body = simpleListCard(`Pisos y ubicaciones de ${esc(p.name)}`, 'Se usan para indicar dónde se hará cada compromiso.', 'add-floor', 'Ej.: Piso 13, Fachada, Lobby', p.floors, 'cfg-del-floor');
        break;
      case 'causas':
        body = simpleListCard('Causas de incumplimiento', 'Se eligen al marcar un compromiso como no cumplido.', 'add-cause', 'Ej.: Falta de aprobación de muestra', DB.causes.map((k) => ({ id: k.id, name: k.name })), 'cfg-del-cause');
        break;
      default:
        body = simpleListCard('Especialidades', 'Tipos de trabajo que se asignan a actividades y contratistas.', 'add-specialty', 'Ej.: Impermeabilización', DB.specialties, 'cfg-del-specialty');
    }
    return `${pageHead('Configuración', 'Catálogos que usa todo el sistema.')}
      <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button type="button" role="tab" class="${S.cfgTab === id ? 'active' : ''}" aria-selected="${S.cfgTab === id}" data-action="cfg-tab" data-tab="${id}">${label}</button>`).join('')}</div>
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
  function openModal(title, bodyHtml) {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-grab" aria-hidden="true"></div>
      <div class="modal-head"><h2 id="modalTitle">${title}</h2><button type="button" class="icon-btn" data-action="modal-close" aria-label="Cerrar">${I.x}</button></div>
      <div class="modal-body">${bodyHtml}</div></div></div>`;
    document.body.classList.add('modal-open');
    const ov = root.firstElementChild;
    requestAnimationFrame(() => ov.classList.add('show'));
    if (window.matchMedia('(min-width: 900px)').matches) {
      const first = root.querySelector('input:not([type=radio]), select');
      if (first) first.focus();
    }
  }
  function closeModal() {
    $('#modalRoot').innerHTML = '';
    document.body.classList.remove('modal-open');
    pendingConfirm = null;
  }
  function confirmDialog(title, message, okLabel, onOk) {
    openModal(title, `<p class="confirm-msg">${message}</p>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button><button type="button" class="btn btn-danger" data-action="confirm-ok">${okLabel}</button></div>`);
    pendingConfirm = onOk;
  }
  function showFormError(form, msg) {
    const el = form.querySelector('.form-err');
    if (el) { el.textContent = msg; el.hidden = false; } else toast(msg, 'error');
  }

  function commitmentModal(opts) {
    const acts = projActs();
    if (!acts.length) {
      openModal('Agregar compromiso', `${empty('Primero crea una actividad', 'Los compromisos se programan sobre una actividad del proyecto.')}
        <div class="modal-actions"><button type="button" class="btn btn-primary" data-action="new-activity">${I.plus}<span>Crear actividad</span></button></div>`);
      return;
    }
    const p = project();
    const editing = opts.id ? byId(DB.commitments, opts.id) : null;
    const actId = editing ? editing.activityId : (opts.activity || acts[0].id);
    const dates = weekDates(editing ? (DB.weeks.find((w) => weekDates(w).includes(editing.date)) || S.week) : S.week);
    const date = editing ? editing.date : (opts.date || S.planDay || dates[0]);
    const last = DB.commitments.filter((c) => c.activityId === actId).sort((a, b) => (a.date > b.date ? -1 : 1))[0];
    const floor = editing ? editing.floor : (last ? last.floor : p.floors[0]);
    const sectorId = editing ? editing.sectorId : (last ? last.sectorId : p.sectors[0].id);
    const statusTxt = editing ? { done: 'Cumplió', fail: 'No cumplió', pending: 'Pendiente de evaluar' }[editing.status] : '';

    openModal(editing ? 'Editar compromiso' : 'Agregar compromiso', `<form class="stack-form" data-form="commitment" data-id="${editing ? editing.id : ''}" novalidate>
      ${editing ? `<div class="modal-status st-${editing.status}"><span class="pi-status">${statusIcon(editing.status)}</span><div><strong>${statusTxt}</strong>${editing.status === 'fail' && editing.causeId ? `<small>${esc(cause(editing.causeId) ? cause(editing.causeId).name : '')}</small>` : ''}</div></div>` : ''}
      <label class="field"><span>Actividad</span><select name="activityId">${acts.map((a) => `<option value="${a.id}"${a.id === actId ? ' selected' : ''}>${esc(a.name)}, ${esc(contractor(a.contractorId) ? contractor(a.contractorId).name : '')}</option>`).join('')}</select></label>
      <div class="field-row">
        <label class="field"><span>Día</span><select name="date">${dates.map((d) => `<option value="${d}"${d === date ? ' selected' : ''}>${fmtDayLong(d)}</option>`).join('')}</select></label>
        <label class="field"><span>Piso o ubicación</span><select name="floor">${p.floors.map((f) => `<option${f === floor ? ' selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
      </div>
      <fieldset class="field"><legend>Sector</legend><div class="sector-pick">${p.sectors.map((s) => `<label class="sector-opt" style="--c:${s.color}"><input type="radio" name="sectorId" value="${s.id}"${s.id === sectorId ? ' checked' : ''}><span>${esc(s.code)}</span></label>`).join('')}</div></fieldset>
      <p class="form-err" hidden></p>
      <div class="modal-actions">
        ${editing ? `<button type="button" class="btn btn-danger-soft" data-action="commitment-delete" data-id="${editing.id}">${I.trash}<span>Eliminar</span></button><span class="spacer"></span>` : ''}
        <button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button>
        <button type="submit" class="btn btn-primary">${editing ? 'Guardar cambios' : 'Agregar compromiso'}</button>
      </div>
    </form>`);
  }

  function activityModal(id) {
    const a = id ? activity(id) : null;
    const cs = DB.contractors.slice().sort((x, y) => x.name.localeCompare(y.name, 'es'));
    const cid = a ? a.contractorId : cs[0].id;
    const spec = a ? a.specialty : contractor(cid).specialty;
    const n = a ? DB.commitments.filter((c) => c.activityId === a.id).length : 0;
    openModal(a ? 'Editar actividad' : 'Nueva actividad', `<form class="stack-form" data-form="activity" data-id="${a ? a.id : ''}" novalidate>
      <label class="field"><span>Nombre de la actividad</span><input name="name" value="${a ? esc(a.name) : ''}" placeholder="Ej.: Revoque interior" maxlength="60" autocomplete="off"></label>
      <label class="field"><span>Contratista</span><select name="contractorId" data-change="act-contractor">${contractorOptions(cid, cs)}</select></label>
      <label class="field"><span>Especialidad</span><select name="specialty">${DB.specialties.map((s) => `<option${s === spec ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      ${a ? `<p class="t-muted small">Tiene ${n} ${n === 1 ? 'compromiso programado' : 'compromisos programados'} en total.</p>` : ''}
      <p class="form-err" hidden></p>
      <div class="modal-actions">
        ${a ? `<button type="button" class="btn btn-danger-soft" data-action="activity-delete" data-id="${a.id}">${I.trash}<span>Eliminar</span></button><span class="spacer"></span>` : ''}
        <button type="button" class="btn btn-ghost" data-action="modal-close">Cancelar</button>
        <button type="submit" class="btn btn-primary">${a ? 'Guardar cambios' : 'Crear actividad'}</button>
      </div>
    </form>`);
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
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2800);
  }

  /* =========================================================
     RENDER
     ========================================================= */
  const VIEWS = { inicio: viewInicio, plan: viewPlan, evaluar: viewEvaluar, calificacion: viewCalificacion, config: viewConfig };

  function renderNav() {
    const badge = { evaluar: evalDraftCount() > 0, calificacion: Object.keys(S.scoreDraft).length > 0 };
    const item = (n, cls) => `<button type="button" class="${cls}${S.view === n.id ? ' active' : ''}" data-action="nav" data-view="${n.id}"${S.view === n.id ? ' aria-current="page"' : ''}>
      <span class="nav-ico">${n.icon}${badge[n.id] ? '<i class="nav-dot" title="Cambios sin guardar"></i>' : ''}</span><span class="nav-txt">${cls === 'bn-item' ? n.short : n.label}</span></button>`;
    $('#sideNav').innerHTML = NAV.map((n) => item(n, 'sb-item')).join('');
    $('#bottomNav').innerHTML = NAV.map((n) => item(n, 'bn-item')).join('');
  }

  function renderChrome() {
    $('#projectSelect').innerHTML = DB.projects.map((p) => `<option value="${p.id}"${p.id === S.projectId ? ' selected' : ''}>${esc(p.name)}</option>`).join('');
    $('#weekLabel').innerHTML = `<strong>Semana ${S.week}${S.week === DB.currentWeek ? ' <em>actual</em>' : ''}</strong><span>${weekRange(S.week)}</span>`;
    const [prev, next] = document.querySelectorAll('.wn-btn');
    prev.innerHTML = I.chevL; next.innerHTML = I.chevR;
    prev.disabled = S.week <= DB.weeks[0];
    next.disabled = S.week >= DB.weeks[DB.weeks.length - 1];
    $('.ico-sun').innerHTML = I.sun; $('.ico-moon').innerHTML = I.moon;
    $('#sbToday').textContent = `Fecha de la demo: ${fmtDayLong(DB.today).toLowerCase()} de ${DB.year}`;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0a0a0a' : '#ffffff');
    renderNav();
  }

  function render(opts = {}) {
    renderChrome();
    const main = $('#view');
    main.innerHTML = VIEWS[S.view]();
    if (opts.enter) {
      main.classList.remove('enter');
      void main.offsetWidth;
      main.classList.add('enter');
    }
    if (opts.top) window.scrollTo(0, 0);
  }

  /* =========================================================
     ACCIONES
     ========================================================= */
  function setWeek(w) {
    if (!DB.weeks.includes(w)) return;
    S.week = w;
    S.planDay = defaultDay(w);
    S.evalDay = defaultDay(w);
    S.evalErrors = {};
    render({ enter: true });
  }

  function setEvalDraft(id, patch) {
    const c = byId(DB.commitments, id);
    if (!c) return;
    const next = Object.assign({ status: c.status, causeId: c.causeId, note: c.note }, S.evalDraft[id] || {}, patch);
    if (next.status !== 'fail') { next.causeId = null; next.note = ''; }
    const same = next.status === c.status && (next.causeId || null) === (c.causeId || null) && (next.note || '') === (c.note || '');
    if (same) delete S.evalDraft[id]; else S.evalDraft[id] = next;
    if (next.status !== 'fail' || next.causeId) delete S.evalErrors[id];
  }

  function refreshEvalSavebar() {
    const bar = $('#evalSavebar');
    if (bar) bar.outerHTML = saveBar('eval', evalDraftCount(), 'Guardar');
    renderNav();
  }

  function deleteCommitment(id) {
    DB.commitments = DB.commitments.filter((c) => c.id !== id);
    delete S.evalDraft[id];
    delete S.evalErrors[id];
  }

  const actions = {
    nav(el) { S.view = el.dataset.view; closeModal(); render({ enter: true, top: true }); $('#view').focus({ preventScroll: true }); },
    'week-prev'() { setWeek(S.week - 1); },
    'week-next'() { setWeek(S.week + 1); },
    'toggle-theme'() {
      const root = document.documentElement;
      root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      renderChrome();
    },
    export(el) { toast(`La exportación a ${el.dataset.format} estará disponible en la versión final.`, 'info'); },
    period(el) { S.period = el.dataset.period; render(); },
    'dash-contractor'(el) { S.dashContractor = S.dashContractor === el.dataset.id ? '' : el.dataset.id; render(); },
    'dash-cause'(el) { S.dashCause = S.dashCause === el.dataset.id ? '' : el.dataset.id; render(); },
    'go-eval'(el) { S.view = 'evaluar'; S.evalDay = el.dataset.date; render({ enter: true, top: true }); },

    'plan-day'(el) { S.planDay = el.dataset.date; render(); },
    'new-commitment'(el) { commitmentModal({ activity: el.dataset.activity, date: el.dataset.date }); },
    'edit-commitment'(el) { commitmentModal({ id: el.dataset.id }); },
    'new-activity'() { activityModal(null); },
    'edit-activity'(el) { activityModal(el.dataset.id); },
    'commitment-delete'(el) {
      const id = el.dataset.id;
      confirmDialog('Eliminar compromiso', 'Se quitará del plan y de la evaluación. Esta acción no se puede deshacer.', 'Eliminar compromiso', () => {
        deleteCommitment(id); render(); toast('Compromiso eliminado');
      });
    },
    'activity-delete'(el) {
      const a = activity(el.dataset.id);
      if (!a) return;
      const n = DB.commitments.filter((c) => c.activityId === a.id).length;
      confirmDialog('Eliminar actividad', `Se eliminará «${esc(a.name)}»${n ? ` y sus ${n} compromisos programados` : ''}. Esta acción no se puede deshacer.`, 'Eliminar actividad', () => {
        DB.commitments.filter((c) => c.activityId === a.id).forEach((c) => deleteCommitment(c.id));
        DB.activities = DB.activities.filter((x) => x.id !== a.id);
        render(); toast('Actividad eliminada');
      });
    },

    'eval-day'(el) { S.evalDay = el.dataset.date; render(); },
    'eval-set'(el) {
      const c = byId(DB.commitments, el.dataset.id);
      if (!c || c.date > DB.today) return;
      const cur = effective(c).status;
      const next = cur === el.dataset.status ? 'pending' : el.dataset.status;
      setEvalDraft(c.id, { status: next });
      render();
    },
    'eval-all-done'() {
      commitmentsWhere({ dates: [S.evalDay] }).forEach((c) => { if (effective(c).status === 'pending') setEvalDraft(c.id, { status: 'done' }); });
      render();
    },
    'eval-discard'() { S.evalDraft = {}; S.evalErrors = {}; render(); toast('Cambios descartados', 'info'); },
    'eval-save'() {
      const ids = Object.keys(S.evalDraft);
      const missing = ids.filter((id) => S.evalDraft[id].status === 'fail' && !S.evalDraft[id].causeId);
      if (missing.length) {
        S.evalErrors = {};
        missing.forEach((id) => { S.evalErrors[id] = true; });
        const c = byId(DB.commitments, missing[0]);
        if (c && c.date !== S.evalDay && weekDates(S.week).includes(c.date)) S.evalDay = c.date;
        render();
        toast(`Falta elegir la causa en ${missing.length} ${missing.length === 1 ? 'compromiso' : 'compromisos'}.`, 'error');
        const bad = document.querySelector('select.invalid');
        if (bad) bad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      ids.forEach((id) => {
        const c = byId(DB.commitments, id);
        if (!c) return;
        const d = S.evalDraft[id];
        c.status = d.status;
        c.causeId = d.status === 'fail' ? d.causeId : null;
        c.note = d.status === 'fail' ? (d.note || '').trim() : '';
      });
      S.evalDraft = {}; S.evalErrors = {};
      render();
      const st = stats(commitmentsWhere({ dates: [S.evalDay] }));
      toast(`Evaluación guardada. PPC del día: ${pctTxt(st.ppc)}`);
    },

    'score-tab'(el) { S.scoreTab = el.dataset.tab; render(); },
    'score-discard'() {
      const prefix = `${S.projectId}|${S.week}|`;
      Object.keys(S.scoreDraft).forEach((k) => { if (k.startsWith(prefix)) delete S.scoreDraft[k]; });
      render(); toast('Cambios descartados', 'info');
    },
    'score-save'() {
      const prefix = `${S.projectId}|${S.week}|`;
      const keys = Object.keys(S.scoreDraft).filter((k) => k.startsWith(prefix));
      const limits = { calidad: 10, seguridad: 10, limpieza: 10, personal: 200 };
      for (const k of keys) {
        const d = S.scoreDraft[k];
        for (const f of Object.keys(limits)) {
          if (d[f] !== undefined && d[f] !== '' && (!isNum(d[f]) || Number(d[f]) < 0 || Number(d[f]) > limits[f])) {
            const c = contractor(k.split('|')[2]);
            toast(`Revisa ${f === 'personal' ? 'personal promedio' : f} de ${c ? c.name : 'un contratista'}: debe estar entre 0 y ${limits[f]}.`, 'error');
            return;
          }
        }
      }
      keys.forEach((k) => {
        const cid = k.split('|')[2];
        const d = S.scoreDraft[k];
        let s = savedScore(cid, S.week);
        if (!s) { s = { projectId: S.projectId, week: S.week, contractorId: cid, calidad: '', seguridad: '', limpieza: '', personal: '', falta: false, note: '' }; DB.scores.push(s); }
        ['calidad', 'seguridad', 'limpieza', 'personal'].forEach((f) => { if (d[f] !== undefined) s[f] = d[f] === '' ? '' : Number(d[f]); });
        if (d.falta !== undefined) s.falta = d.falta;
        delete S.scoreDraft[k];
      });
      render();
      const win = weekRows(S.week, false).find((r) => r.winner);
      toast(win ? `Calificación guardada. Ganador: ${win.name}` : 'Calificación guardada');
    },

    'cfg-tab'(el) { S.cfgTab = el.dataset.tab; render(); },
    'cfg-use-project'(el) { switchProject(el.dataset.id); toast(`Proyecto abierto: ${project().name}`); },
    'cfg-del-project'(el) {
      const p = byId(DB.projects, el.dataset.id);
      if (!p) return;
      if (DB.projects.length === 1) { toast('Debe existir al menos un proyecto.', 'error'); return; }
      confirmDialog('Eliminar proyecto', `Se eliminará «${esc(p.name)}» con todas sus actividades, compromisos y calificaciones.`, 'Eliminar proyecto', () => {
        const ids = new Set(DB.commitments.filter((c) => c.projectId === p.id).map((c) => c.id));
        ids.forEach((id) => { delete S.evalDraft[id]; });
        DB.commitments = DB.commitments.filter((c) => c.projectId !== p.id);
        DB.activities = DB.activities.filter((a) => a.projectId !== p.id);
        DB.scores = DB.scores.filter((s) => s.projectId !== p.id);
        Object.keys(S.scoreDraft).forEach((k) => { if (k.startsWith(`${p.id}|`)) delete S.scoreDraft[k]; });
        DB.projects = DB.projects.filter((x) => x.id !== p.id);
        if (S.projectId === p.id) switchProject(DB.projects[0].id); else render();
        toast('Proyecto eliminado');
      });
    },
    'cfg-del-contractor'(el) {
      const c = contractor(el.dataset.id);
      if (!c) return;
      const n = DB.activities.filter((a) => a.contractorId === c.id).length;
      if (n) { toast(`No se puede eliminar: ${c.name} tiene ${n} ${n === 1 ? 'actividad asignada' : 'actividades asignadas'}.`, 'error'); return; }
      confirmDialog('Eliminar contratista', `Se eliminará a ${esc(c.name)} del catálogo.`, 'Eliminar', () => {
        DB.contractors = DB.contractors.filter((x) => x.id !== c.id); render(); toast('Contratista eliminado');
      });
    },
    'cfg-del-sector'(el) {
      const p = project(), s = byId(p.sectors, el.dataset.id);
      if (!s) return;
      const n = DB.commitments.filter((c) => c.projectId === p.id && c.sectorId === s.id).length;
      if (n) { toast(`No se puede eliminar: el sector ${s.code} se usa en ${n} compromisos.`, 'error'); return; }
      if (p.sectors.length === 1) { toast('Debe existir al menos un sector.', 'error'); return; }
      p.sectors = p.sectors.filter((x) => x.id !== s.id); render(); toast('Sector eliminado');
    },
    'cfg-del-floor'(el) {
      const p = project(), f = el.dataset.id;
      const n = DB.commitments.filter((c) => c.projectId === p.id && c.floor === f).length;
      if (n) { toast(`No se puede eliminar: «${f}» se usa en ${n} compromisos.`, 'error'); return; }
      if (p.floors.length === 1) { toast('Debe existir al menos un piso.', 'error'); return; }
      p.floors = p.floors.filter((x) => x !== f); render(); toast('Piso eliminado');
    },
    'cfg-del-cause'(el) {
      const k = cause(el.dataset.id);
      if (!k) return;
      const n = DB.commitments.filter((c) => c.causeId === k.id).length + Object.values(S.evalDraft).filter((d) => d.causeId === k.id).length;
      if (n) { toast(`No se puede eliminar: la causa está registrada en ${n} compromisos.`, 'error'); return; }
      DB.causes = DB.causes.filter((x) => x.id !== k.id); render(); toast('Causa eliminada');
    },
    'cfg-del-specialty'(el) {
      const sp = el.dataset.id;
      const n = DB.activities.filter((a) => a.specialty === sp).length + DB.contractors.filter((c) => c.specialty === sp).length;
      if (n) { toast(`No se puede eliminar: «${sp}» está en uso.`, 'error'); return; }
      DB.specialties = DB.specialties.filter((x) => x !== sp); render(); toast('Especialidad eliminada');
    },

    'modal-close'() { closeModal(); },
    'confirm-ok'() { const cb = pendingConfirm; closeModal(); if (cb) cb(); }
  };

  function switchProject(id) {
    if (!byId(DB.projects, id)) return;
    S.projectId = id;
    S.dashContractor = ''; S.dashCause = ''; S.planContractor = ''; S.histContractor = '';
    S.evalErrors = {};
    render({ enter: true });
  }

  const changeHandlers = {
    project(el) { switchProject(el.value); },
    'dash-contractor'(el) { S.dashContractor = el.value; render(); },
    'plan-contractor'(el) { S.planContractor = el.value; render(); },
    'hist-contractor'(el) { S.histContractor = el.value; render(); },
    'score-month'(el) { S.month = el.value; render(); },
    'eval-cause'(el) {
      setEvalDraft(el.dataset.id, { causeId: el.value || null });
      el.classList.toggle('invalid', !el.value && !!S.evalErrors[el.dataset.id]);
      const err = el.closest('.ec-fail') && el.closest('.ec-fail').querySelector('.field-err');
      if (err && el.value) err.remove();
      const card = el.closest('.eval-card');
      if (card) card.classList.toggle('changed', !!S.evalDraft[el.dataset.id]);
      refreshEvalSavebar();
    },
    'score-falta'(el) {
      const k = scoreKey(el.dataset.cid);
      S.scoreDraft[k] = Object.assign({}, S.scoreDraft[k], { falta: el.checked });
      cleanScoreDraft(k, el.dataset.cid);
      refreshScores();
    },
    'act-contractor'(el) {
      const c = contractor(el.value);
      const sel = el.form && el.form.querySelector('[name="specialty"]');
      if (c && sel) sel.value = c.specialty;
    }
  };

  function cleanScoreDraft(k, cid) {
    const d = S.scoreDraft[k];
    if (!d) return;
    const saved = savedScore(cid, S.week) || {};
    Object.keys(d).forEach((f) => {
      const sv = f === 'falta' ? !!saved.falta : (saved[f] === undefined || saved[f] === null ? '' : saved[f]);
      const dv = d[f];
      const eq = f === 'falta' ? dv === sv : (dv === '' && sv === '') || (isNum(dv) && isNum(sv) && Number(dv) === Number(sv));
      if (eq) delete d[f];
    });
    if (!Object.keys(d).length) delete S.scoreDraft[k];
  }

  const inputHandlers = {
    'eval-note'(el) {
      setEvalDraft(el.dataset.id, { note: el.value });
      const card = el.closest('.eval-card');
      if (card) card.classList.toggle('changed', !!S.evalDraft[el.dataset.id]);
      refreshEvalSavebar();
    },
    score(el) {
      const cid = el.dataset.cid, f = el.dataset.field, max = Number(el.dataset.max);
      const raw = el.value.trim().replace(',', '.');
      const val = raw === '' ? '' : Number(raw);
      el.classList.toggle('invalid', raw !== '' && (Number.isNaN(val) || val < 0 || val > max));
      const k = scoreKey(cid);
      S.scoreDraft[k] = Object.assign({}, S.scoreDraft[k], { [f]: Number.isNaN(val) ? raw : val });
      cleanScoreDraft(k, cid);
      refreshScores();
    }
  };

  const formHandlers = {
    commitment(form) {
      const fd = new FormData(form);
      const data = { activityId: fd.get('activityId'), date: fd.get('date'), floor: fd.get('floor'), sectorId: fd.get('sectorId') };
      if (!data.activityId || !data.date || !data.floor || !data.sectorId) { showFormError(form, 'Completa actividad, día, piso y sector.'); return; }
      const id = form.dataset.id;
      const dup = DB.commitments.find((c) => c.id !== id && c.activityId === data.activityId && c.date === data.date && c.floor === data.floor && c.sectorId === data.sectorId);
      if (dup) { showFormError(form, 'Ya existe ese compromiso: misma actividad, día, piso y sector.'); return; }
      if (id) {
        const c = byId(DB.commitments, id);
        if (!c) { closeModal(); return; }
        Object.assign(c, data);
        if (c.date > DB.today && c.status !== 'pending') { c.status = 'pending'; c.causeId = null; c.note = ''; delete S.evalDraft[id]; }
        toast('Compromiso actualizado');
      } else {
        DB.commitments.push(Object.assign({ id: uid('m'), projectId: S.projectId, status: 'pending', causeId: null, note: '' }, data));
        toast('Compromiso agregado al plan');
      }
      S.planDay = data.date;
      closeModal(); render();
    },
    activity(form) {
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const contractorId = fd.get('contractorId'), specialty = fd.get('specialty');
      if (!name) { showFormError(form, 'Escribe el nombre de la actividad.'); return; }
      const id = form.dataset.id;
      const dup = projActs().find((a) => a.id !== id && norm(a.name) === norm(name) && a.contractorId === contractorId);
      if (dup) { showFormError(form, 'Ese contratista ya tiene una actividad con ese nombre.'); return; }
      if (id) { Object.assign(activity(id), { name, contractorId, specialty }); toast('Actividad actualizada'); }
      else { DB.activities.push({ id: uid('a'), projectId: S.projectId, name, contractorId, specialty }); toast('Actividad creada. Ya puedes programarle compromisos.'); }
      closeModal(); render();
    },
    'add-project'(form) {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) { toast('Escribe el nombre del proyecto.', 'error'); return; }
      if (DB.projects.some((p) => norm(p.name) === norm(name))) { toast('Ya existe un proyecto con ese nombre.', 'error'); return; }
      const pid = uid('p');
      DB.projects.push({
        id: pid, name,
        sectors: [{ id: uid('s'), code: 'S1', name: 'Sector 1', color: SECTOR_COLORS[0] }, { id: uid('s'), code: 'S2', name: 'Sector 2', color: SECTOR_COLORS[1] }, { id: uid('s'), code: 'Gral', name: 'General', color: SECTOR_COLORS[5] }],
        floors: ['Planta Baja', 'Piso 1', 'Piso 2', 'Piso 3']
      });
      switchProject(pid);
      toast(`Proyecto creado: ${name}`);
    },
    'add-contractor'(form) {
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      if (!name) { toast('Escribe el nombre del contratista.', 'error'); return; }
      if (DB.contractors.some((c) => norm(c.name) === norm(name))) { toast('Ese contratista ya está en el catálogo.', 'error'); return; }
      DB.contractors.push({ id: uid('c'), name, specialty: fd.get('specialty'), phone: '' });
      render(); toast('Contratista agregado');
    },
    'add-sector'(form) {
      const fd = new FormData(form), p = project();
      const code = String(fd.get('code') || '').trim(), name = String(fd.get('name') || '').trim() || code;
      if (!code) { toast('Escribe el código corto del sector.', 'error'); return; }
      if (p.sectors.some((s) => norm(s.code) === norm(code))) { toast('Ya existe un sector con ese código.', 'error'); return; }
      p.sectors.push({ id: uid('s'), code, name, color: fd.get('color') || SECTOR_COLORS[0] });
      render(); toast('Sector agregado');
    },
    'add-floor'(form) {
      const name = String(new FormData(form).get('name') || '').trim(), p = project();
      if (!name) { toast('Escribe el nombre del piso o ubicación.', 'error'); return; }
      if (p.floors.some((f) => norm(f) === norm(name))) { toast('Ese piso ya existe.', 'error'); return; }
      p.floors.push(name); render(); toast('Piso agregado');
    },
    'add-cause'(form) {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) { toast('Escribe la causa.', 'error'); return; }
      if (DB.causes.some((k) => norm(k.name) === norm(name))) { toast('Esa causa ya existe.', 'error'); return; }
      DB.causes.push({ id: uid('k'), name }); render(); toast('Causa agregada');
    },
    'add-specialty'(form) {
      const name = String(new FormData(form).get('name') || '').trim();
      if (!name) { toast('Escribe la especialidad.', 'error'); return; }
      if (DB.specialties.some((s) => norm(s) === norm(name))) { toast('Esa especialidad ya existe.', 'error'); return; }
      DB.specialties.push(name); render(); toast('Especialidad agregada');
    }
  };

  /* ---------- Eventos (delegación) ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && changeHandlers[el.dataset.change]) changeHandlers[el.dataset.change](el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && inputHandlers[el.dataset.input]) inputHandlers[el.dataset.input](el, e);
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const fn = formHandlers[form.dataset.form];
    if (fn) fn(form);
  });
  $('#modalRoot').addEventListener('click', (e) => { if (e.target.classList.contains('overlay')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#modalRoot').firstElementChild) closeModal(); });
  window.addEventListener('beforeunload', (e) => {
    if (evalDraftCount() || Object.keys(S.scoreDraft).length) { e.preventDefault(); e.returnValue = ''; }
  });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = (ev) => { document.documentElement.setAttribute('data-theme', ev.matches ? 'dark' : 'light'); renderChrome(); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme);
  }

  S.planDay = defaultDay(S.week);
  S.evalDay = defaultDay(S.week);
  render({ enter: true });
})();
