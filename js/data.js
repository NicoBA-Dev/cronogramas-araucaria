/* =========================================================
   Araucaria · Last Planner — Datos de demostración
   Todo se genera al abrir la página, RELATIVO A LA FECHA REAL:
   los días anteriores a hoy quedan evaluados y calificados,
   hoy queda pendiente y los días siguientes quedan programados.
   Nada se guarda: al recargar vuelve todo a este estado.
   ========================================================= */
(function () {
  'use strict';

  // Generador aleatorio con semilla: mismos datos para la misma fecha
  function seeded(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  var now = new Date();
  var TODAY = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  var YEAR = now.getFullYear();
  var rand = seeded(Number(TODAY.replace(/-/g, '')));
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function between(min, max) { return min + rand() * (max - min); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var DAY = 864e5;
  function mondayOf(week) {
    var jan4 = Date.UTC(YEAR, 0, 4);
    var dow = new Date(jan4).getUTCDay() || 7;
    return jan4 - (dow - 1) * DAY + (week - 1) * 7 * DAY;
  }
  function iso(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function parseISO(s) { var p = s.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
  function dayIdx(s) { return (new Date(parseISO(s)).getUTCDay() + 6) % 7; }
  function addDays(s, n) { return iso(parseISO(s) + n * DAY); }
  function weekOf(s) {
    var mon = parseISO(s) - dayIdx(s) * DAY;
    return Math.round((mon - mondayOf(1)) / (7 * DAY)) + 1;
  }
  function weekDates(week) {
    var m = mondayOf(week), out = [];
    for (var i = 0; i < 6; i++) out.push(iso(m + i * DAY));
    return out;
  }
  var CW = weekOf(TODAY);
  var WEEKS = [];
  for (var w = Math.max(1, CW - 4); w <= Math.min(52, CW + 3); w++) WEEKS.push(w);

  var operators = ['Nicolas', 'Rodrigo', 'Adriana', 'Benjamin'];

  /* ---------- Catálogos ---------- */
  var specialties = ['Albañilería', 'Yesería', 'Porcelanato', 'Eléctrico', 'Drywall', 'Pintura', 'Sanitario', 'Carpintería'];

  // rel = probabilidad de cumplir, q = calidad típica (solo para generar datos)
  var contractorsRaw = [
    { id: 'c1', name: 'Mario Mamani',     specialty: 'Albañilería', phone: '+591 70712345', rel: 0.84, q: 9.0 },
    { id: 'c2', name: 'Wilder Heredia',   specialty: 'Albañilería', phone: '+591 71423456', rel: 0.66, q: 8.4 },
    { id: 'c3', name: 'Daniel Carrasco',  specialty: 'Eléctrico',   phone: '+591 72534567', rel: 0.96, q: 9.3 },
    { id: 'c4', name: 'Ronald Chavarría', specialty: 'Drywall',     phone: '+591 73645678', rel: 0.62, q: 7.9 },
    { id: 'c5', name: 'Alex Ugarte',      specialty: 'Pintura',     phone: '+591 74756789', rel: 0.48, q: 7.3 },
    { id: 'c6', name: 'Jorge Rocha',      specialty: 'Sanitario',   phone: '+591 75867890', rel: 0.80, q: 8.6 },
    { id: 'c7', name: 'Rosa Quispe',      specialty: 'Pintura',     phone: '+591 76978901', rel: 0.90, q: 9.2 },
    { id: 'c8', name: 'Luis Choque',      specialty: 'Carpintería', phone: '+591 77089012', rel: 0.72, q: 8.1 }
  ];

  // Las 12 causas oficiales (número y nombre fijos, tal como están en la lista de la pizarra)
  var causeNames = [
    'Factor climático', 'Falta de planos', 'Falta de coordinación', 'Falta de grúa y equipos',
    'Falta de personal', 'Falta de material', 'No concluir actividad anterior',
    'Cambios/retraso por supervisión', 'Falla de topografía/medición', 'Externos',
    'Error de planificación', 'Cambios arquitectónicos'
  ];
  var causes = causeNames.map(function (n, i) { return { id: 'k' + (i + 1), num: i + 1, name: n, fixed: true }; });
  var causeWeights = { 1: 2, 2: 1, 3: 3, 4: 1, 5: 4, 6: 4, 7: 6, 8: 2, 9: 1, 10: 1, 11: 1, 12: 1 };
  var causeNotes = {
    1: ['Lluvia fuerte durante la jornada.', 'Viento fuerte, trabajo en altura suspendido.'],
    2: ['Faltan planos actualizados del piso.', 'Plano de detalles sin aprobar.'],
    3: ['Se cruzó con otra cuadrilla en el frente.', 'No se coordinó el ingreso del material.'],
    4: ['La grúa estaba ocupada.', 'Andamio ocupado por otra cuadrilla.'],
    5: ['Cuadrilla incompleta, faltaron 3 personas.', 'Personal reasignado a otra obra.'],
    6: ['El proveedor no entregó el material.', 'Llegó material incompleto.', 'Falta cemento en obra.'],
    7: ['La actividad previa no se terminó a tiempo.', 'Esperando que termine el revoque del sector.'],
    8: ['Supervisión pidió priorizar otro frente.', 'El frente no fue liberado por la supervisión.'],
    9: ['Faltó replanteo del eje.'],
    10: ['Corte de energía en la zona.', 'Bloqueo de vías, no llegó el personal.'],
    11: ['Se programó sin considerar el curado.'],
    12: ['Cambio solicitado por el propietario.']
  };
  var NOT_WORKED = { 1: true, 2: true, 4: true, 6: true, 10: true };  // causas que suelen impedir trabajar
  function weightedCause() {
    var total = 0, k;
    for (k in causeWeights) total += causeWeights[k];
    var r = rand() * total;
    for (k in causeWeights) { r -= causeWeights[k]; if (r <= 0) return Number(k); }
    return 7;
  }

  function floorsList(prefix, from, to) {
    var out = [];
    for (var i = from; i <= to; i++) out.push(prefix + ' ' + i);
    return out;
  }

  /* ---------- Proyectos ---------- */
  var projects = [
    {
      id: 'p1', name: 'Edificio Arena', sectorLabel: 'Sector', delayDays: 1,
      sectors: [
        { id: 'p1s1', code: 'S1', name: 'Sector 1', color: '#3b82f6' },
        { id: 'p1s2', code: 'S2', name: 'Sector 2', color: '#14b8a6' },
        { id: 'p1s3', code: 'S3', name: 'Sector 3', color: '#f59e0b' },
        { id: 'p1s4', code: 'Grada', name: 'Grada', color: '#a855f7' },
        { id: 'p1s5', code: 'Gral', name: 'General', color: '#64748b' }
      ],
      floors: ['Planta Baja'].concat(floorsList('Piso', 1, 12), ['Terraza'])
    },
    {
      id: 'p2', name: 'Edificio Etrusco', sectorLabel: 'Sector', delayDays: 1,
      sectors: [
        { id: 'p2s1', code: 'A', name: 'Bloque A', color: '#3b82f6' },
        { id: 'p2s2', code: 'B', name: 'Bloque B', color: '#ec4899' },
        { id: 'p2s3', code: 'C', name: 'Bloque C', color: '#f59e0b' },
        { id: 'p2s4', code: 'Gral', name: 'General', color: '#64748b' }
      ],
      floors: ['Subsuelo', 'Planta Baja'].concat(floorsList('Piso', 1, 8), ['Terraza'])
    }
  ];

  /* ---------- Actividades (cada fila = actividad + contratista) ---------- */
  var activitiesRaw = [
    { id: 'a1',  projectId: 'p1', name: 'Contrapiso',            contractorId: 'c1', specialty: 'Albañilería', floors: ['Piso 11', 'Piso 12'] },
    { id: 'a2',  projectId: 'p1', name: 'Revoque interior',      contractorId: 'c2', specialty: 'Albañilería', floors: ['Piso 11', 'Piso 12'] },
    { id: 'a14', projectId: 'p1', name: 'Revoque interior',      contractorId: 'c1', specialty: 'Albañilería', floors: ['Piso 9', 'Piso 10'] },
    { id: 'a3',  projectId: 'p1', name: 'Revoque exterior',      contractorId: 'c2', specialty: 'Albañilería', floors: ['Piso 9', 'Piso 10'] },
    { id: 'a4',  projectId: 'p1', name: 'Yeso',                  contractorId: 'c1', specialty: 'Yesería',     floors: ['Piso 9', 'Piso 10'] },
    { id: 'a5',  projectId: 'p1', name: 'Porcelanato deptos',    contractorId: 'c2', specialty: 'Porcelanato', floors: ['Piso 9', 'Piso 10'] },
    { id: 'a6',  projectId: 'p1', name: 'Porcelanato balcones',  contractorId: 'c2', specialty: 'Porcelanato', floors: ['Piso 8', 'Piso 9'] },
    { id: 'a7',  projectId: 'p1', name: 'Cableado eléctrico',    contractorId: 'c3', specialty: 'Eléctrico',   floors: ['Piso 6', 'Piso 7'] },
    { id: 'a8',  projectId: 'p1', name: 'Huecos eléctricos',     contractorId: 'c3', specialty: 'Eléctrico',   floors: ['Piso 10', 'Piso 11'] },
    { id: 'a9',  projectId: 'p1', name: 'Drywall estructura',    contractorId: 'c4', specialty: 'Drywall',     floors: ['Piso 8', 'Piso 9'] },
    { id: 'a10', projectId: 'p1', name: 'Drywall placa',         contractorId: 'c4', specialty: 'Drywall',     floors: ['Piso 7', 'Piso 8'] },
    { id: 'a11', projectId: 'p1', name: 'Drywall masa',          contractorId: 'c4', specialty: 'Drywall',     floors: ['Piso 6', 'Piso 7'] },
    { id: 'a12', projectId: 'p1', name: 'Pintura base',          contractorId: 'c5', specialty: 'Pintura',     floors: ['Piso 5', 'Piso 6'] },
    { id: 'a13', projectId: 'p1', name: 'Instalación sanitaria', contractorId: 'c6', specialty: 'Sanitario',   floors: ['Piso 10', 'Piso 11'] },
    { id: 'b1', projectId: 'p2', name: 'Mampostería',             contractorId: 'c1', specialty: 'Albañilería', floors: ['Piso 5', 'Piso 6'] },
    { id: 'b2', projectId: 'p2', name: 'Revoque grueso',          contractorId: 'c2', specialty: 'Albañilería', floors: ['Piso 3', 'Piso 4'] },
    { id: 'b3', projectId: 'p2', name: 'Tendido eléctrico',       contractorId: 'c3', specialty: 'Eléctrico',   floors: ['Piso 2', 'Piso 3'] },
    { id: 'b4', projectId: 'p2', name: 'Instalación sanitaria',   contractorId: 'c6', specialty: 'Sanitario',   floors: ['Piso 4', 'Piso 5'] },
    { id: 'b5', projectId: 'p2', name: 'Cielo falso',             contractorId: 'c4', specialty: 'Drywall',     floors: ['Piso 1', 'Piso 2'] },
    { id: 'b6', projectId: 'p2', name: 'Pintura fachada',         contractorId: 'c7', specialty: 'Pintura',     floors: ['Planta Baja', 'Piso 1'] },
    { id: 'b7', projectId: 'p2', name: 'Carpintería de aluminio', contractorId: 'c8', specialty: 'Carpintería', floors: ['Piso 1', 'Piso 2'] },
    { id: 'b8', projectId: 'p2', name: 'Contrapiso',              contractorId: 'c1', specialty: 'Albañilería', floors: ['Subsuelo', 'Planta Baja'] }
  ];
  function contractorRaw(id) {
    for (var i = 0; i < contractorsRaw.length; i++) if (contractorsRaw[i].id === id) return contractorsRaw[i];
    return null;
  }
  function actRaw(id) {
    for (var i = 0; i < activitiesRaw.length; i++) if (activitiesRaw[i].id === id) return activitiesRaw[i];
    return null;
  }
  function projectRaw(id) { return projects[id === 'p1' ? 0 : 1]; }

  /* ---------- Días sin obra (ejemplo): un sábado sin trabajo en Arena ---------- */
  var offDays = [];
  var offSat = weekDates(CW - 2)[5];
  offDays.push({ projectId: 'p1', date: offSat });
  function isOff(pid, d) {
    if (dayIdx(d) === 6) return true;
    return offDays.some(function (o) { return o.projectId === pid && o.date === d; });
  }

  /* ---------- Compromisos ---------- */
  var commitments = [];
  var seq = 1;
  function makeCommit(pid, actId, date, floor, sectorId, detail) {
    var c = {
      id: 'm' + (seq++), projectId: pid, activityId: actId, date: date,
      floor: floor, sectorId: sectorId, status: 'pending', causeId: null, delayed: null,
      note: '', detail: detail || ''
    };
    commitments.push(c);
    return c;
  }
  var details = ['', '', '', '', 'gas', 'papel picado', 'nivel 2', 'ala norte'];

  projects.forEach(function (p) {
    var mainSectors = p.sectors.filter(function (s) { return s.name !== 'General'; });
    WEEKS.forEach(function (week) {
      var dates = weekDates(week);
      activitiesRaw.filter(function (a) { return a.projectId === p.id; }).forEach(function (a) {
        var r = rand();
        var count = r < 0.15 ? 0 : r < 0.55 ? 1 : r < 0.87 ? 2 : 3;
        var pool = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4];
        var used = {};
        for (var i = 0; i < count; i++) {
          var d, tries = 0;
          do { d = pick(pool); tries++; } while (used[d] && tries < 20);
          if (used[d]) continue;
          used[d] = true;
          var date = dates[d];
          if (isOff(p.id, date)) continue;
          var floor = pick(a.floors);
          var sec = (p.id === 'p1' && a.name === 'Contrapiso' && rand() < 0.35) ? p.sectors[3] : pick(mainSectors);
          makeCommit(p.id, a.id, date, floor, sec.id, pick(details));
        }
      });
    });
  });

  // Aseguramos compromisos hoy para que la demo se vea completa
  if (dayIdx(TODAY) !== 6) {
    function hasToday(pid, actId, floor) {
      return commitments.some(function (c) { return c.projectId === pid && c.activityId === actId && c.date === TODAY && c.floor === floor; });
    }
    [['p1', 'a7', 'Piso 7', 'p1s2', ''], ['p1', 'a7', 'Piso 8', 'p1s1', 'gas'],   // dos compromisos de la misma actividad
     ['p1', 'a2', 'Piso 12', 'p1s1', ''], ['p1', 'a4', 'Piso 10', 'p1s2', 'papel picado'],
     ['p1', 'a9', 'Piso 8', 'p1s1', ''], ['p1', 'a12', 'Piso 6', 'p1s3', ''],
     ['p1', 'a13', 'Piso 10', 'p1s1', ''],
     ['p2', 'b3', 'Piso 3', 'p2s1', ''], ['p2', 'b8', 'Planta Baja', 'p2s2', ''], ['p2', 'b6', 'Piso 1', 'p2s1', '']
    ].forEach(function (row) {
      if (!hasToday(row[0], row[1], row[2])) makeCommit(row[0], row[1], TODAY, row[2], row[3], row[4]);
    });
  }
  commitments.sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });

  /* ---------- Evaluación y calificación de los días anteriores a hoy ---------- */
  var ratings = {};
  var log = [];
  var goodNotes = ['Buen desempeño general.', 'Cumplió bien lo planificado.', 'Frente ordenado y limpio.', 'Equipo comprometido.'];
  var midNotes = ['Debe mejorar la limpieza.', 'Reforzar coordinación con otras cuadrillas.', 'Cumplimiento irregular.'];
  var lowNotes = ['Bajo PPC semanal.', 'Faltó documentación.', 'Varias observaciones de calidad.'];

  commitments.forEach(function (c) {
    if (c.date >= TODAY) return;
    var a = actRaw(c.activityId), cr = contractorRaw(a.contractorId), p = projectRaw(c.projectId);
    var sec = p.sectors.filter(function (s) { return s.id === c.sectorId; })[0];
    var worked = true;
    if (rand() < cr.rel) {
      c.status = 'done';
    } else {
      c.status = 'fail';
      c.causeId = 'k' + weightedCause();
      var num = Number(c.causeId.slice(1));
      c.note = rand() < 0.8 ? pick(causeNotes[num]) : '';
      c.delayed = rand() < 0.5;
      if (NOT_WORKED[num] && rand() < 0.6) worked = false;
    }
    var late = rand() < 0.07;
    var by = pick(operators);
    var at = late ? addDays(c.date, 1) + ' 15:' + pad(Math.floor(rand() * 50) + 5)
                  : c.date + ' 17:' + pad(Math.floor(rand() * 50) + 5);
    var cal = r1(clamp(cr.q + between(-0.9, 0.7), 5, 10));
    var lim = r1(clamp(cr.q - 0.3 + between(-1, 0.6), 5, 10));
    ratings[c.id] = {
      commitmentId: c.id, worked: worked,
      calidad: worked ? cal : null, limpieza: worked ? lim : null,
      late: late, by: by, at: at
    };
    if (c.date >= addDays(TODAY, -7)) {
      log.push({
        at: at, who: by, type: 'Calificación',
        detail: a.name + ' · ' + c.floor + ' ' + (sec ? sec.code : '') + (worked ? ' · Calidad ' + cal + ' · Limpieza ' + lim : ' · No trabajó') + (late ? ' (tardía)' : '')
      });
      log.push({
        at: at.slice(0, 11) + '17:59', who: by, type: 'Evaluación',
        detail: a.name + ' · ' + c.floor + ' ' + (sec ? sec.code : '') + ' · ' + (c.status === 'done' ? 'Cumplió' : 'No cumplió (' + c.causeId.slice(1) + ')')
      });
    }
  });

  /* ---------- Asistencia de los días pasados ---------- */
  var attendance = {};
  commitments.forEach(function (c) {
    if (c.date >= TODAY) return;
    var a = actRaw(c.activityId);
    ['am', 'pm'].forEach(function (m) {
      if (m === 'pm' && dayIdx(c.date) === 5) return;
      var key = c.projectId + '|' + a.contractorId + '|' + c.date + '|' + m;
      if (attendance[key]) return;
      var r = rand();
      var status = r < 0.84 ? 'ok' : r < 0.94 ? 'late' : 'no';
      var by = pick(operators);
      attendance[key] = { status: status, by: by, at: c.date + (m === 'am' ? ' 08:' : ' 15:') + pad(Math.floor(rand() * 40) + 5) };
      if (status !== 'ok' && c.date >= addDays(TODAY, -7)) {
        log.push({
          at: attendance[key].at, who: by, type: 'Asistencia',
          detail: contractorRaw(a.contractorId).name + ' · ' + (m === 'am' ? 'Mañana' : 'Tarde') + ' · ' + (status === 'late' ? 'Tarde' : 'No llegó')
        });
      }
    });
  });

  /* ---------- Calificaciones semanales (Seguridad y Personal) de semanas pasadas ---------- */
  var scores = [];
  projects.forEach(function (p) {
    WEEKS.filter(function (w) { return w < CW; }).forEach(function (week) {
      var dates = weekDates(week);
      var seen = {};
      commitments.forEach(function (c) {
        if (c.projectId !== p.id || dates.indexOf(c.date) === -1) return;
        var cid = actRaw(c.activityId).contractorId;
        if (seen[cid]) return;
        seen[cid] = true;
        var cr = contractorRaw(cid);
        var falta = cid !== 'c3' && cid !== 'c7' && rand() < 0.06;
        scores.push({
          projectId: p.id, week: week, contractorId: cid,
          calidad: null, limpieza: null,
          seguridad: r1(clamp(cr.q + between(-0.4, 0.6), 5, 10)),
          personal: Math.round(between(4, 30)),
          falta: falta,
          note: falta ? 'Falta grave: trabajo en altura sin arnés.' : pick(cr.rel >= 0.8 ? goodNotes : cr.rel >= 0.6 ? midNotes : lowNotes)
        });
      });
    });
  });

  log.sort(function (x, y) { return x.at < y.at ? 1 : x.at > y.at ? -1 : 0; });

  /* ---------- Fórmula y reglas (todo editable en Ajustes) ---------- */
  var settings = {
    weeksVisible: 4,
    weights: { ppc: 50, calidad: 20, seguridad: 15, limpieza: 15 },
    fm: [
      { min: 1,  max: 4,    fm: 1.01 }, { min: 5,  max: 8,  fm: 1.02 }, { min: 9,  max: 12, fm: 1.03 },
      { min: 13, max: 16,   fm: 1.04 }, { min: 17, max: 20, fm: 1.05 }, { min: 21, max: 24, fm: 1.06 },
      { min: 25, max: 28,   fm: 1.07 }, { min: 29, max: 32, fm: 1.08 }, { min: 33, max: 36, fm: 1.09 },
      { min: 37, max: null, fm: 1.10 }
    ],
    faltaFactor: 0.5,
    meta: 80, minFinal: 70, excFinal: 90, excPpc: 90,
    minCompWeek: 2, minWeeksMonth: 2, minCompMonth: 4
  };

  window.DEMO_DATA = {
    company: 'Araucaria Construcciones',
    year: YEAR,
    operators: operators,
    specialties: specialties,
    contractors: contractorsRaw.map(function (c) { return { id: c.id, name: c.name, specialty: c.specialty, phone: c.phone }; }),
    causes: causes,
    projects: projects,
    activities: activitiesRaw.map(function (a) {
      return { id: a.id, projectId: a.projectId, name: a.name, contractorId: a.contractorId, specialty: a.specialty };
    }),
    commitments: commitments,
    ratings: ratings,
    attendance: attendance,
    scores: scores,
    offDays: offDays,
    log: log,
    settings: settings
  };
})();
