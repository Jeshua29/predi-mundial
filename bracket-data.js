// Datos oficiales del Mundial 2026: dieciseisavos, octavos y cuartos ya jugados,
// más la definición de semifinales (equipos + cierre de predicciones).
// Los arrays están ordenados para que cada 2 partidos de una ronda
// alimenten exactamente 1 partido de la ronda siguiente (bracket real).

export const dieciseisavos = [
  { id: "P74", equipos: ["de", "py"], marcador: [1, 1], penales: [3, 4], ganador: "py" },
  { id: "P78", equipos: ["fr", "se"], marcador: [3, 0], ganador: "fr" },

  { id: "P73", equipos: ["za", "ca"], marcador: [0, 1], ganador: "ca" },
  { id: "P75", equipos: ["nl", "ma"], marcador: [1, 1], penales: [2, 3], ganador: "ma" },

  { id: "P76", equipos: ["br", "jp"], marcador: [2, 1], ganador: "br" },
  { id: "P77", equipos: ["ci", "no"], marcador: [1, 2], ganador: "no" },

  { id: "P79", equipos: ["mx", "ec"], marcador: [2, 0], ganador: "mx" },
  { id: "P80", equipos: ["eng", "cd"], marcador: [2, 1], ganador: "eng" },

  { id: "P83", equipos: ["pt", "hr"], marcador: [2, 1], ganador: "pt" },
  { id: "P84", equipos: ["es", "at"], marcador: [3, 0], ganador: "es" },

  { id: "P81", equipos: ["us", "ba"], marcador: [2, 0], ganador: "us" },
  { id: "P82", equipos: ["be", "sn"], marcador: [3, 2], ganador: "be" },

  { id: "P85", equipos: ["ar", "cv"], marcador: [3, 2], ganador: "ar" },
  { id: "P87", equipos: ["eg", "au"], marcador: null, penales: null, ganador: "eg" },

  { id: "P86", equipos: ["ch", "dz"], marcador: [2, 0], ganador: "ch" },
  { id: "P88", equipos: ["co", "gh"], marcador: null, ganador: "co" },
];

export const octavos = [
  { id: "M89", equipos: ["py", "fr"], marcador: [0, 1], ganador: "fr" },
  { id: "M90", equipos: ["ca", "ma"], marcador: [0, 3], ganador: "ma" },

  { id: "M93", equipos: ["pt", "es"], marcador: [0, 1], ganador: "es" },
  { id: "M94", equipos: ["us", "be"], marcador: [1, 4], ganador: "be" },

  { id: "M91", equipos: ["br", "no"], marcador: [1, 2], ganador: "no" },
  { id: "M92", equipos: ["mx", "eng"], marcador: [2, 3], ganador: "eng" },

  { id: "M95", equipos: ["ar", "eg"], marcador: [3, 2], ganador: "ar" },
  { id: "M96", equipos: ["ch", "co"], marcador: [0, 0], penales: [4, 3], ganador: "ch" },
];

export const cuartos = [
  {
    id: "M97",
    equipos: ["fr", "ma"],
    marcador: [2, 0],
    ganador: "fr",
    goleadoresLocal: ["Mbappé", "Dembélé"],
    goleadoresVisitante: [],
  },
  {
    id: "M98",
    equipos: ["es", "be"],
    marcador: [2, 1],
    ganador: "es",
    goleadoresLocal: ["Fabián Ruiz", "Mikel Merino"],
    goleadoresVisitante: ["De Ketelaere"],
  },
  {
    id: "M99",
    equipos: ["no", "eng"],
    marcador: [1, 2],
    penales: null,
    ganador: "eng",
    goleadoresLocal: ["Schjelderup"],
    goleadoresVisitante: ["Bellingham", "Bellingham"],
  },
  {
    id: "M100",
    equipos: ["ar", "ch"],
    marcador: [3, 1],
    ganador: "ar",
    goleadoresLocal: ["Mac Allister", "Julián Álvarez", "Lautaro Martínez"],
    goleadoresVisitante: ["Ndoye"],
  },
];

// Semifinales: sin resultado todavía, solo la definición + el cierre real
export const semis = [
  {
    id: "M101",
    equipos: ["fr", "es"],
    cierre: "2026-07-14T13:00:00-06:00",
  },
  {
    id: "M102",
    equipos: ["eng", "ar"],
    cierre: "2026-07-15T13:00:00-06:00",
  },
];