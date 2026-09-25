/* =========================================================
   Araucaria · Last Planner — Datos de demostración
   Todo es hardcodeado y se genera igual cada vez que se abre.
   Para cambiar la "fecha de hoy" del demo, edita TODAY.
   ========================================================= */
(function () {
  'use strict';

  // Generador aleatorio con semilla: siempre produce los mismos datos
  function seeded(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = seeded(20261015);
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function between(min, max) { return min + rand() * (max - min); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var YEAR = 2026;
  var TODAY = '2026-10-15';     // Jueves de la semana 42
  var CURRENT_WEEK = 42;
  var WEEKS = [39, 40, 41, 42, 43];
  var DAY = 864e5;

  function mondayOf(week) {
    var jan4 = Date.UTC(YEAR, 0, 4);
    var dow = new Date(jan4).getUTCDay() || 7;
    return jan4 - (dow - 1) * DAY + (week - 1) * 7 * DAY;
  }
  function iso(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function weekDates(week) {
    var m = mondayOf(week), out = [];
    for (var i = 0; i < 6; i++) out.push(iso(m + i * DAY));
    return out;
  }

  /* ---------- Catálogos globales ---------- */
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

  var causes = [
    { id: 'k1',  name: 'No se cumplió actividad anterior' },
    { id: 'k2',  name: 'Falta de planos' },
    { id: 'k3',  name: 'Falta de material' },
    { id: 'k4',  name: 'Falta de personal' },
    { id: 'k5',  name: 'Falta de equipo o herramienta' },
    { id: 'k6',  name: 'Falta de liberación de frente' },
    { id: 'k7',  name: 'Problema de calidad o retrabajo' },
    { id: 'k8',  name: 'Cambio de diseño' },
    { id: 'k9',  name: 'Factor externo' },
    { id: 'k10', name: 'Clima' },
    { id: 'k11', name: 'Error de programación' },
    { id: 'k12', name: 'Decisión de supervisión' }
  ];
  var causeWeights = { k1: 6, k2: 1, k3: 4, k4: 5, k5: 2, k6: 3, k7: 2, k8: 1, k9: 1, k10: 2, k11: 1, k12: 1 };
  var causeNotes = {
    k1:  ['La actividad previa no se terminó a tiempo.', 'Esperando que termine el revoque del sector.'],
    k2:  ['Faltan planos actualizados del piso.', 'Plano de detalles sin aprobar.'],
    k3:  ['El proveedor no entregó el material.', 'Llegó material incompleto.', 'Falta cemento en obra.'],
    k4:  ['Cuadrilla incompleta, faltaron 3 personas.', 'Personal reasignado a otra obra.'],
    k5:  ['Andamio ocupado por otra cuadrilla.', 'Herramienta en reparación.'],
    k6:  ['El frente no fue liberado por la supervisión.', 'Sector ocupado por instalaciones.'],
    k7:  ['Se tuvo que rehacer parte del trabajo.', 'Observación de calidad pendiente.'],
    k8:  ['Cambio solicitado por el propietario.'],
    k9:  ['Corte de energía en la zona.', 'Bloqueo de vías, no llegó el personal.'],
    k10: ['Lluvia fuerte durante la jornada.', 'Viento fuerte, trabajo en altura suspendido.'],
    k11: ['Se programó sin considerar el curado.'],
    k12: ['Supervisión pidió priorizar otro frente.']
  };
  function weightedCause() {
    var total = 0, k;
    for (k in causeWeights) total += causeWeights[k];
    var r = rand() * total;
    for (k in causeWeights) { r -= causeWeights[k]; if (r <= 0) return k; }
    return 'k1';
  }

  function floorsList(prefix, from, to) {
    var out = [];
    for (var i = from; i <= to; i++) out.push(prefix + ' ' + i);
    return out;
  }

  /* ---------- Proyectos (cada uno con sus sectores y pisos) ---------- */
  var projects = [
    {
      id: 'p1', name: 'Edificio Arena',
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
      id: 'p2', name: 'Edificio Etrusco',
      sectors: [
        { id: 'p2s1', code: 'A', name: 'Bloque A', color: '#3b82f6' },
        { id: 'p2s2', code: 'B', name: 'Bloque B', color: '#ec4899' },
        { id: 'p2s3', code: 'C', name: 'Bloque C', color: '#f59e0b' },
        { id: 'p2s4', code: 'Gral', name: 'General', color: '#64748b' }
      ],
      floors: ['Subsuelo', 'Planta Baja'].concat(floorsList('Piso', 1, 8), ['Terraza'])
    }
  ];

  /* ---------- Actividades por proyecto ---------- */
  var activitiesRaw = [
    // Edificio Arena
    { id: 'a1',  projectId: 'p1', name: 'Contrapiso',            contractorId: 'c1', specialty: 'Albañilería', floors: ['Piso 11', 'Piso 12'] },
    { id: 'a2',  projectId: 'p1', name: 'Revoque interior',      contractorId: 'c2', specialty: 'Albañilería', floors: ['Piso 11', 'Piso 12'] },
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
    // Edificio Etrusco
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

  /* ---------- Compromisos (plan semanal + evaluación diaria) ---------- */
  var commitments = [];
  var seq = 1;
  projects.forEach(function (p) {
    var mainSectors = p.sectors.filter(function (s) { return s.name !== 'General'; });
    WEEKS.forEach(function (week) {
      var dates = weekDates(week);
      activitiesRaw.filter(function (a) { return a.projectId === p.id; }).forEach(function (a) {
        var r = rand();
        var count = r < 0.15 ? 0 : r < 0.55 ? 1 : r < 0.87 ? 2 : 3;
        var pool = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4];   // el sábado aparece menos
        var used = {};
        for (var i = 0; i < count; i++) {
          var d, tries = 0;
          do { d = pick(pool); tries++; } while (used[d] && tries < 20);
          if (used[d]) continue;
          used[d] = true;
          var date = dates[d];
          var floor = pick(a.floors);
          var sec = (p.id === 'p1' && a.name === 'Contrapiso' && rand() < 0.35) ? p.sectors[3] : pick(mainSectors);
          var c = {
            id: 'm' + (seq++), projectId: p.id, activityId: a.id, date: date,
            floor: floor, sectorId: sec.id, status: 'pending', causeId: null, note: ''
          };
          if (date < TODAY) {
            if (rand() < contractorRaw(a.contractorId).rel) {
              c.status = 'done';
            } else {
              c.status = 'fail';
              c.causeId = weightedCause();
              c.note = rand() < 0.8 ? pick(causeNotes[c.causeId]) : '';
            }
          }
          commitments.push(c);
        }
      });
    });
  });
  // Semana en curso de Edificio Arena armada a mano para que la demo se vea completa:
  // lunes a miércoles evaluados, jueves (hoy) por evaluar, viernes y sábado programados.
  var w42 = weekDates(42);
  commitments = commitments.filter(function (c) { return !(c.projectId === 'p1' && w42.indexOf(c.date) !== -1); });
  var curated = [
    // [día, actividad, piso, sector, estado, causa, observación]
    [0, 'a1', 'Terraza', 'p1s4', 'done'], [0, 'a2', 'Piso 12', 'p1s1', 'done'],
    [0, 'a9', 'Piso 8', 'p1s1', 'fail', 'k1', 'Esperando cierre de instalaciones sanitarias.'],
    [0, 'a7', 'Piso 7', 'p1s2', 'done'], [0, 'a13', 'Piso 10', 'p1s1', 'done'],
    [1, 'a1', 'Terraza', 'p1s4', 'done'], [1, 'a2', 'Piso 12', 'p1s1', 'done'], [1, 'a7', 'Piso 7', 'p1s2', 'done'],
    [1, 'a12', 'Piso 6', 'p1s3', 'fail', 'k4', 'Cuadrilla incompleta, faltaron 3 pintores.'],
    [1, 'a4', 'Piso 10', 'p1s2', 'done'], [1, 'a8', 'Piso 11', 'p1s3', 'done'],
    [2, 'a1', 'Terraza', 'p1s4', 'fail', 'k3', 'El proveedor no entregó el cemento.'],
    [2, 'a2', 'Piso 12', 'p1s2', 'fail', 'k6', 'El frente no fue liberado por la supervisión.'],
    [2, 'a5', 'Piso 10', 'p1s3', 'fail', 'k1', 'Contrapiso del sector sin terminar.'],
    [2, 'a10', 'Piso 8', 'p1s1', 'done'], [2, 'a4', 'Piso 10', 'p1s3', 'done'], [2, 'a3', 'Piso 9', 'p1s1', 'done'],
    [3, 'a5', 'Piso 10', 'p1s2', 'pending'], [3, 'a2', 'Piso 12', 'p1s2', 'pending'], [3, 'a8', 'Piso 11', 'p1s1', 'pending'],
    [3, 'a11', 'Piso 7', 'p1s2', 'pending'], [3, 'a12', 'Piso 6', 'p1s1', 'pending'],
    [4, 'a10', 'Piso 8', 'p1s1', 'pending'], [4, 'a7', 'Piso 6', 'p1s1', 'pending'], [4, 'a3', 'Piso 9', 'p1s2', 'pending'],
    [4, 'a6', 'Piso 9', 'p1s1', 'pending'],
    [5, 'a1', 'Piso 12', 'p1s1', 'pending'], [5, 'a13', 'Piso 11', 'p1s2', 'pending']
  ];
  curated.forEach(function (row) {
    commitments.push({
      id: 'm' + (seq++), projectId: 'p1', activityId: row[1], date: w42[row[0]],
      floor: row[2], sectorId: row[3], status: row[4], causeId: row[5] || null, note: row[6] || ''
    });
  });
  commitments.sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });

  /* ---------- Calificaciones semanales guardadas ---------- */
  var goodNotes = ['Buen desempeño general.', 'Cumplió bien lo planificado.', 'Frente ordenado y limpio.', 'Equipo comprometido.'];
  var midNotes = ['Debe mejorar la limpieza.', 'Reforzar coordinación con otras cuadrillas.', 'Cumplimiento irregular.'];
  var lowNotes = ['Bajo PPC semanal.', 'Faltó documentación.', 'Varias observaciones de calidad.'];

  var scores = [];
  projects.forEach(function (p) {
    [39, 40, 41, 42].forEach(function (week) {
      var dates = weekDates(week);
      var perC = {};
      commitments.forEach(function (c) {
        if (c.projectId !== p.id || dates.indexOf(c.date) === -1 || c.status === 'pending') return;
        var a = activitiesRaw.filter(function (x) { return x.id === c.activityId; })[0];
        var s = perC[a.contractorId] || (perC[a.contractorId] = { done: 0, ev: 0 });
        s.ev++; if (c.status === 'done') s.done++;
      });
      Object.keys(perC).sort().forEach(function (cid) {
        // Semana 42 en curso: Alex Ugarte queda sin calificar para mostrar el estado "Incompleto"
        if (week === 42 && cid === 'c5') return;
        var cr = contractorRaw(cid);
        var ppc = perC[cid].done / perC[cid].ev * 100;
        var falta = cid !== 'c3' && cid !== 'c7' && rand() < 0.07;
        scores.push({
          projectId: p.id, week: week, contractorId: cid,
          calidad: r1(clamp(cr.q + between(-0.6, 0.5), 5, 10)),
          seguridad: r1(clamp(cr.q + between(-0.4, 0.6), 5, 10)),
          limpieza: r1(clamp(cr.q - 0.3 + between(-0.8, 0.5), 5, 10)),
          personal: Math.round(between(6, 26)),
          falta: falta,
          note: falta ? 'Falta grave: trabajo en altura sin arnés.' : pick(ppc >= 80 ? goodNotes : ppc >= 50 ? midNotes : lowNotes)
        });
      });
    });
  });

  /* ---------- Exportar ---------- */
  window.DEMO_DATA = {
    company: 'Araucaria Construcciones',
    year: YEAR,
    today: TODAY,
    currentWeek: CURRENT_WEEK,
    weeks: WEEKS,
    specialties: specialties,
    contractors: contractorsRaw.map(function (c) { return { id: c.id, name: c.name, specialty: c.specialty, phone: c.phone }; }),
    causes: causes,
    projects: projects,
    activities: activitiesRaw.map(function (a) {
      return { id: a.id, projectId: a.projectId, name: a.name, contractorId: a.contractorId, specialty: a.specialty };
    }),
    commitments: commitments,
    scores: scores
  };
})();
