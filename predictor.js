import { db } from "./firebase.js";
import { dieciseisavos, octavos, cuartos, semis } from "./bracket-data.js";

import {
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const usuario = localStorage.getItem("nombreUsuario");

const fechaCierre = new Date("2026-06-11T13:00:00-06:00");
const fechaCierreCuartos = new Date("2026-07-09T14:10:00-06:00");

if (usuario === null) {
  window.location.href = "index.html";
}

function prediccionesCerradas() {
  return new Date() >= fechaCierre;
}

function prediccionesCuartosCerradas() {
  return new Date() >= fechaCierreCuartos;
}

function estaSemiCerrada(matchId) {
  const partido = semis.find((s) => s.id === matchId);
  return new Date() >= new Date(partido.cierre);
}

const grupos = {
  A: [
    { nombre: "México", codigo: "mx" },
    { nombre: "Sudáfrica", codigo: "za" },
    { nombre: "Corea del Sur", codigo: "kr" },
    { nombre: "República Checa", codigo: "cz" },
  ],
  B: [
    { nombre: "Canadá", codigo: "ca" },
    { nombre: "Bosnia", codigo: "ba" },
    { nombre: "Catar", codigo: "qa" },
    { nombre: "Suiza", codigo: "ch" },
  ],
  C: [
    { nombre: "Brasil", codigo: "br" },
    { nombre: "Marruecos", codigo: "ma" },
    { nombre: "Haití", codigo: "ht" },
    { nombre: "Escocia", codigo: "gb" },
  ],
  D: [
    { nombre: "Estados Unidos", codigo: "us" },
    { nombre: "Paraguay", codigo: "py" },
    { nombre: "Australia", codigo: "au" },
    { nombre: "Turquía", codigo: "tr" },
  ],
  E: [
    { nombre: "Alemania", codigo: "de" },
    { nombre: "Curazao", codigo: "cw" },
    { nombre: "Costa de Marfil", codigo: "ci" },
    { nombre: "Ecuador", codigo: "ec" },
  ],
  F: [
    { nombre: "Países Bajos", codigo: "nl" },
    { nombre: "Japón", codigo: "jp" },
    { nombre: "Suecia", codigo: "se" },
    { nombre: "Túnez", codigo: "tn" },
  ],
  G: [
    { nombre: "Bélgica", codigo: "be" },
    { nombre: "Egipto", codigo: "eg" },
    { nombre: "Irán", codigo: "ir" },
    { nombre: "Nueva Zelanda", codigo: "nz" },
  ],
  H: [
    { nombre: "España", codigo: "es" },
    { nombre: "Cabo Verde", codigo: "cv" },
    { nombre: "Arabia Saudita", codigo: "sa" },
    { nombre: "Uruguay", codigo: "uy" },
  ],
  I: [
    { nombre: "Francia", codigo: "fr" },
    { nombre: "Senegal", codigo: "sn" },
    { nombre: "Irak", codigo: "iq" },
    { nombre: "Noruega", codigo: "no" },
  ],
  J: [
    { nombre: "Argentina", codigo: "ar" },
    { nombre: "Argelia", codigo: "dz" },
    { nombre: "Austria", codigo: "at" },
    { nombre: "Jordania", codigo: "jo" },
  ],
  K: [
    { nombre: "Portugal", codigo: "pt" },
    { nombre: "RD Congo", codigo: "cd" },
    { nombre: "Uzbekistán", codigo: "uz" },
    { nombre: "Colombia", codigo: "co" },
  ],
  L: [
    { nombre: "Inglaterra", codigo: "gb" },
    { nombre: "Croacia", codigo: "hr" },
    { nombre: "Ghana", codigo: "gh" },
    { nombre: "Panamá", codigo: "pa" },
  ],
};

const partidosCuartos = cuartos.map((c) => ({
  id: c.id,
  equipos: c.equipos,
  detalle: "",
}));

const predicciones = {};
const prediccionesCuartos = {};
const prediccionesSemis = {};

let tienePrediccionGuardada = false;
let tienePrediccionCuartosGuardada = false;

let matchIdActivo = null;
let vaTiempoExtraSeleccionado = null;
let ganadorEtSeleccionado = null;
let ganadorPenalesSeleccionado = null;

const container = document.getElementById("groupsContainer");
const totalGrupos = Object.keys(grupos).length;

crearGrupos();
crearPartidosCuartos();
actualizarBarra();
actualizarBotonCuartos();
cargarPrediccionUsuario();
actualizarContador();
actualizarContadorCuartos();
cargarRanking();

setInterval(actualizarContador, 1000);
setInterval(actualizarContadorCuartos, 1000);

function obtenerEquipoPorCodigo(codigo) {
  if (codigo === "eng") {
    return { nombre: "Inglaterra", codigo: "gb" };
  }

  for (let grupo in grupos) {
    const equipo = grupos[grupo].find((e) => e.codigo === codigo);
    if (equipo) return equipo;
  }

  return null;
}

function crearGrupos() {
  for (let letra in grupos) {
    predicciones[letra] = [];

    const card = document.createElement("div");
    card.className = "group-card";

    card.innerHTML = `
      <div class="group-header">
        <h3>GRUPO ${letra}</h3>
        <span class="complete"></span>
      </div>
    `;

    grupos[letra].forEach((equipo) => {
      const fila = document.createElement("div");
      fila.className = "team";
      fila.dataset.codigo = equipo.codigo;

      fila.innerHTML = `
        <div class="position"></div>
        <img src="https://flagcdn.com/w40/${equipo.codigo}.png">
        <span>${equipo.nombre}</span>
      `;

      fila.addEventListener("click", () => {
        manejarSeleccion(letra, equipo.codigo, card);
      });

      card.appendChild(fila);
    });

    container.appendChild(card);
  }
}

function manejarSeleccion(grupo, codigo, card) {
  if (prediccionesCerradas()) return;

  let seleccion = predicciones[grupo];
  const indice = seleccion.indexOf(codigo);

  if (indice !== -1) {
    seleccion.splice(indice, 1);
  } else {
    if (seleccion.length >= 4) return;
    seleccion.push(codigo);
  }

  actualizarCard(grupo, card);
  actualizarBarra();
}

function actualizarCard(grupo, card) {
  const seleccion = predicciones[grupo];
  const equipos = card.querySelectorAll(".team");

  equipos.forEach((equipo) => {
    const codigo = equipo.dataset.codigo;
    const pos = equipo.querySelector(".position");
    const indice = seleccion.indexOf(codigo);

    if (indice !== -1) {
      pos.innerText = indice + 1;
      pos.classList.add("selected");
    } else {
      pos.innerText = "";
      pos.classList.remove("selected");
    }
  });

  const check = card.querySelector(".complete");

  if (seleccion.length === 4) {
    check.innerHTML = "✓";
    card.classList.add("completed");
  } else {
    check.innerHTML = "";
    card.classList.remove("completed");
  }
}

function actualizarBarra() {
  let completos = 0;

  for (let grupo in predicciones) {
    if (predicciones[grupo].length === 4) completos++;
  }

  document.getElementById("progressText").innerText =
    completos + " / " + totalGrupos + " grupos completos";

  document.getElementById("progressBar").style.width =
    (completos / totalGrupos) * 100 + "%";

  const boton = document.getElementById("btnEnviar");

  if (completos === totalGrupos) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = tienePrediccionGuardada
      ? "Actualizar predicción"
      : "Enviar predicción";
  } else {
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Completa todos los grupos";
  }
}

function obtenerPrediccionFinal(datosActuales = {}) {
  return {
    ...datosActuales,
    nombre: usuario,
    fecha: new Date().toISOString(),
    grupos: predicciones,
  };
}

async function cargarPrediccionUsuario() {
  const usuarioKey = usuario.toLowerCase();
  const snapshot = await get(child(ref(db), "predicciones/" + usuarioKey));

  if (snapshot.exists()) {
    const datos = snapshot.val();

    if (datos.grupos) {
      tienePrediccionGuardada = true;

      for (let grupo in datos.grupos) {
        predicciones[grupo] = datos.grupos[grupo];

        document.querySelectorAll(".group-card").forEach((card) => {
          const titulo = card.querySelector("h3").innerText;
          if (titulo === "GRUPO " + grupo) actualizarCard(grupo, card);
        });
      }
    }

    if (datos.cuartos) {
      tienePrediccionCuartosGuardada = true;

      for (let partidoId in datos.cuartos) {
        prediccionesCuartos[partidoId] = datos.cuartos[partidoId];

        const card = document.querySelector(
          `.partido-16-card[data-partido="${partidoId}"]`,
        );

        if (card) actualizarPartidoCuartos(partidoId, card);
      }
    }

    if (datos.semis) {
      Object.assign(prediccionesSemis, datos.semis);
    }

    actualizarBarra();
    actualizarBotonCuartos();
  }

  if (prediccionesCerradas()) {
    document.querySelectorAll(".team").forEach((equipo) => {
      equipo.style.pointerEvents = "none";
    });

    const boton = document.getElementById("btnEnviar");
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Predicciones cerradas";
  }

  if (prediccionesCuartosCerradas()) {
    document.querySelectorAll(".bracket-team").forEach((equipo) => {
      equipo.style.pointerEvents = "none";
    });

    const boton = document.getElementById("btnEnviar16avos");
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Predicciones de Cuartos cerradas";
  }

  renderBracket();
}

document.getElementById("btnEnviar").addEventListener("click", async () => {
  try {
    if (prediccionesCerradas()) {
      alert("Las predicciones ya están cerradas.");
      return;
    }

    const usuarioKey = usuario.toLowerCase();
    const usuarioRef = ref(db, "predicciones/" + usuarioKey);

    const snapshot = await get(usuarioRef);
    const datosActuales = snapshot.exists() ? snapshot.val() : {};

    await set(usuarioRef, obtenerPrediccionFinal(datosActuales));

    tienePrediccionGuardada = true;
    actualizarBarra();

    const mensaje = document.getElementById("mensajeExito");
    mensaje.classList.add("show");

    setTimeout(() => {
      mensaje.classList.remove("show");
    }, 3000);
  } catch (error) {
    console.error("Error al guardar predicción:", error);
    alert("Error al guardar la predicción. Revisa la consola.");
  }
});

function crearPartidosCuartos() {
  const container16 = document.getElementById("partidos16Container");
  container16.innerHTML = "";

  partidosCuartos.forEach((partido) => {
    prediccionesCuartos[partido.id] = "";

    const equipo1 = obtenerEquipoPorCodigo(partido.equipos[0]);
    const equipo2 = obtenerEquipoPorCodigo(partido.equipos[1]);

    const card = document.createElement("div");
    card.className = "bracket-match partido-16-card";
    card.dataset.partido = partido.id;

    card.innerHTML = `
      <div class="match-header">
        <span>${partido.id}</span>
        <small>${equipo1.nombre} vs ${equipo2.nombre}</small>
      </div>

      <div class="bracket-team" data-codigo="${partido.equipos[0]}">
        <img src="https://flagcdn.com/w40/${equipo1.codigo}.png">
        <span>${equipo1.nombre}</span>
      </div>

      <div class="versus">VS</div>

      <div class="bracket-team" data-codigo="${partido.equipos[1]}">
        <img src="https://flagcdn.com/w40/${equipo2.codigo}.png">
        <span>${equipo2.nombre}</span>
      </div>
    `;

    card.querySelectorAll(".bracket-team").forEach((equipo) => {
      equipo.addEventListener("click", () => {
        manejarSeleccionCuartos(partido.id, equipo.dataset.codigo, card);
      });
    });

    container16.appendChild(card);
  });
}

function manejarSeleccionCuartos(partidoId, codigo, card) {
  if (prediccionesCuartosCerradas()) return;

  prediccionesCuartos[partidoId] = codigo;

  actualizarPartidoCuartos(partidoId, card);
  actualizarBotonCuartos();
}

function actualizarPartidoCuartos(partidoId, card) {
  const seleccionado = prediccionesCuartos[partidoId];

  card.querySelectorAll(".bracket-team").forEach((equipo) => {
    if (equipo.dataset.codigo === seleccionado) {
      equipo.classList.add("selected");
    } else {
      equipo.classList.remove("selected");
    }
  });
}

function actualizarBotonCuartos() {
  const totalPartidos = partidosCuartos.length;

  const completos = Object.values(prediccionesCuartos).filter(
    (ganador) => ganador !== "",
  ).length;

  const boton = document.getElementById("btnEnviar16avos");

  if (completos === totalPartidos) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = tienePrediccionCuartosGuardada
      ? "Actualizar predicción de Cuartos"
      : "Enviar predicción de Cuartos";
  } else {
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = `Completa todos los partidos (${completos}/${totalPartidos})`;
  }
}

document
  .getElementById("btnEnviar16avos")
  .addEventListener("click", async () => {
    try {
      if (prediccionesCuartosCerradas()) {
        alert("Las predicciones de Cuartos ya están cerradas.");
        return;
      }

      const totalPartidos = partidosCuartos.length;
      const completos = Object.values(prediccionesCuartos).filter(
        (ganador) => ganador !== "",
      ).length;

      if (completos !== totalPartidos) {
        alert("Debes completar todos los partidos de Cuartos.");
        return;
      }

      const usuarioKey = usuario.toLowerCase();
      const usuarioRef = ref(db, "predicciones/" + usuarioKey);

      const snapshot = await get(usuarioRef);
      const datosActuales = snapshot.exists() ? snapshot.val() : {};

      await set(usuarioRef, {
        ...datosActuales,
        nombre: usuario,
        fecha: new Date().toISOString(),
        cuartos: prediccionesCuartos,
      });

      tienePrediccionCuartosGuardada = true;
      actualizarBotonCuartos();

      const mensaje = document.getElementById("mensajeExito16avos");
      mensaje.classList.add("show");

      setTimeout(() => {
        mensaje.classList.remove("show");
      }, 3000);
    } catch (error) {
      console.error("Error al guardar predicción de Cuartos:", error);
      alert("Error al guardar la predicción de Cuartos. Revisa la consola.");
    }
  });

/* ===================== */
/* BRACKET COMPLETO       */
/* ===================== */

function renderMiniMarcador(partido) {
  const [a, b] = partido.equipos;
  const eqA = obtenerEquipoPorCodigo(a);
  const eqB = obtenerEquipoPorCodigo(b);
  const marcadorTxt = partido.marcador
    ? `${partido.marcador[0]} - ${partido.marcador[1]}`
    : "definido";
  const penalesTxt = partido.penales
    ? ` (${partido.penales[0]}-${partido.penales[1]} pen)`
    : "";

  return `
    <div class="bracket-mini-card">
      <div class="bracket-mini-team ${partido.ganador === a ? "gano" : ""}">
        <img src="https://flagcdn.com/w40/${eqA.codigo}.png"><span>${eqA.nombre}</span>
      </div>
      <div class="bracket-mini-score">${marcadorTxt}${penalesTxt}</div>
      <div class="bracket-mini-team ${partido.ganador === b ? "gano" : ""}">
        <img src="https://flagcdn.com/w40/${eqB.codigo}.png"><span>${eqB.nombre}</span>
      </div>
    </div>
  `;
}

function renderSemiCard(partido) {
  const [a, b] = partido.equipos;
  const eqA = obtenerEquipoPorCodigo(a);
  const eqB = obtenerEquipoPorCodigo(b);

  const card = document.createElement("div");
  card.className = "bracket-match partido-semi-card";
  card.dataset.partido = partido.id;

  const yaPredijo = !!prediccionesSemis[partido.id];
  const cerrado = estaSemiCerrada(partido.id);

  card.innerHTML = `
    <div class="match-header"><span>${partido.id}</span></div>
    <div class="bracket-team"><img src="https://flagcdn.com/w40/${eqA.codigo}.png"><span>${eqA.nombre}</span></div>
    <div class="versus">VS</div>
    <div class="bracket-team"><img src="https://flagcdn.com/w40/${eqB.codigo}.png"><span>${eqB.nombre}</span></div>
    <button class="btn-predecir-semi" ${cerrado ? "disabled" : ""}>
      ${cerrado ? "Predicciones cerradas" : yaPredijo ? "Editar predicción" : "Predecir"}
    </button>
  `;

  card.querySelector(".btn-predecir-semi").addEventListener("click", () => {
    if (!cerrado) abrirModalSemis(partido.id);
  });

  return card;
}

function renderBracket() {
  const wrapper = document.getElementById("bracketWrapper");
  wrapper.innerHTML = "";

  const columnas = [
    { titulo: "Dieciseisavos", partidos: dieciseisavos, tipo: "locked" },
    { titulo: "Octavos", partidos: octavos, tipo: "locked" },
    { titulo: "Cuartos", partidos: cuartos, tipo: "locked" },
    { titulo: "Semifinales", partidos: semis, tipo: "semis" },
    { titulo: "Final", partidos: [], tipo: "final" },
  ];

  columnas.forEach((col) => {
    const colEl = document.createElement("div");
    colEl.className = "bracket-col";

    const tituloEl = document.createElement("div");
    tituloEl.className = "bracket-col-title";
    tituloEl.innerText = col.titulo;
    colEl.appendChild(tituloEl);

    if (col.tipo === "locked") {
      col.partidos.forEach((p) => {
        colEl.insertAdjacentHTML("beforeend", renderMiniMarcador(p));
      });
    }

    if (col.tipo === "semis") {
      col.partidos.forEach((p) => {
        colEl.appendChild(renderSemiCard(p));
      });
    }

    if (col.tipo === "final") {
      const lockCard = document.createElement("div");
      lockCard.className = "bracket-final-lock";
      lockCard.innerHTML = `<span>🔒</span><small>Se habilita al definir semifinales</small>`;
      colEl.appendChild(lockCard);
    }

    wrapper.appendChild(colEl);
  });

  wrapper.scrollLeft = wrapper.scrollWidth;
}

/* ===================== */
/* MODAL SEMIS            */
/* ===================== */

function abrirModalSemis(matchId) {
  matchIdActivo = matchId;
  const partido = semis.find((s) => s.id === matchId);
  const [codigoLocal, codigoVisitante] = partido.equipos;
  const eqLocal = obtenerEquipoPorCodigo(codigoLocal);
  const eqVisitante = obtenerEquipoPorCodigo(codigoVisitante);

  document.getElementById("modalTitulo").innerText = `${eqLocal.nombre} vs ${eqVisitante.nombre}`;
  document.getElementById("modalFlagLocal").src = `https://flagcdn.com/w40/${eqLocal.codigo}.png`;
  document.getElementById("modalFlagVisitante").src = `https://flagcdn.com/w40/${eqVisitante.codigo}.png`;
  document.getElementById("modalNombreLocal").innerText = eqLocal.nombre;
  document.getElementById("modalNombreVisitante").innerText = eqVisitante.nombre;
  document.getElementById("labelGoleadoresLocal").innerText = `Goleadores ${eqLocal.nombre}`;
  document.getElementById("labelGoleadoresVisitante").innerText = `Goleadores ${eqVisitante.nombre}`;
  document.getElementById("btnGanadorEtLocal").innerText = eqLocal.nombre;
  document.getElementById("btnGanadorEtVisitante").innerText = eqVisitante.nombre;
  document.getElementById("btnPenalesLocal").innerText = eqLocal.nombre;
  document.getElementById("btnPenalesVisitante").innerText = eqVisitante.nombre;

  const existente = prediccionesSemis[matchId] || {};
  const local = existente.marcador?.local ?? 0;
  const visitante = existente.marcador?.visitante ?? 0;

  document.getElementById("inputMarcadorLocal").value = local;
  document.getElementById("inputMarcadorVisitante").value = visitante;

  regenerarCamposGoleadores("camposGoleadoresLocal", local, existente.goleadoresLocal || []);
  regenerarCamposGoleadores("camposGoleadoresVisitante", visitante, existente.goleadoresVisitante || []);

  vaTiempoExtraSeleccionado = existente.vaTiempoExtra ?? null;
  ganadorEtSeleccionado = existente.ganadorTiempoExtra ?? null;
  ganadorPenalesSeleccionado = existente.ganadorPenales ?? null;

  actualizarBloqueEmpate();
  document.getElementById("modalSemis").style.display = "flex";
}
function regenerarCamposGoleadores(contenedorId, cantidad, valoresPrevios) {
  const cont = document.getElementById(contenedorId);
  cont.innerHTML = "";
  for (let i = 0; i < cantidad; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Gol ${i + 1}: nombre del jugador`;
    input.value = valoresPrevios[i] || "";
    cont.appendChild(input);
  }
}

function leerGoleadores(contenedorId) {
  return Array.from(document.querySelectorAll(`#${contenedorId} input`))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function onMarcadorChange() {
  actualizarBloqueEmpate();

  const local = Number(document.getElementById("inputMarcadorLocal").value) || 0;
  const visitante = Number(document.getElementById("inputMarcadorVisitante").value) || 0;

  const golesLocalActuales = leerGoleadores("camposGoleadoresLocal");
  const golesVisitanteActuales = leerGoleadores("camposGoleadoresVisitante");

  regenerarCamposGoleadores("camposGoleadoresLocal", local, golesLocalActuales);
  regenerarCamposGoleadores("camposGoleadoresVisitante", visitante, golesVisitanteActuales);
}
function actualizarBloqueEmpate() {
  const local = Number(document.getElementById("inputMarcadorLocal").value);
  const visitante = Number(document.getElementById("inputMarcadorVisitante").value);
  const empatado = local === visitante;

  document.getElementById("bloqueEmpate").style.display = empatado ? "block" : "none";
  document.getElementById("bloqueGanadorEt").style.display =
    empatado && vaTiempoExtraSeleccionado === true ? "block" : "none";
  document.getElementById("bloqueGanadorPenales").style.display =
    empatado && vaTiempoExtraSeleccionado === false ? "block" : "none";

  document.getElementById("btnEtSi").classList.toggle("activo", vaTiempoExtraSeleccionado === true);
  document.getElementById("btnEtNo").classList.toggle("activo", vaTiempoExtraSeleccionado === false);
  document.getElementById("btnGanadorEtLocal").classList.toggle("activo", ganadorEtSeleccionado === "local");
  document.getElementById("btnGanadorEtVisitante").classList.toggle("activo", ganadorEtSeleccionado === "visitante");
  document.getElementById("btnPenalesLocal").classList.toggle("activo", ganadorPenalesSeleccionado === "local");
  document.getElementById("btnPenalesVisitante").classList.toggle("activo", ganadorPenalesSeleccionado === "visitante");
}

document.getElementById("inputMarcadorLocal").addEventListener("input", onMarcadorChange);
document.getElementById("inputMarcadorVisitante").addEventListener("input", onMarcadorChange);

document.getElementById("btnEtSi").addEventListener("click", () => {
  vaTiempoExtraSeleccionado = true;
  actualizarBloqueEmpate();
});
document.getElementById("btnEtNo").addEventListener("click", () => {
  vaTiempoExtraSeleccionado = false;
  actualizarBloqueEmpate();
});
document.getElementById("btnGanadorEtLocal").addEventListener("click", () => {
  ganadorEtSeleccionado = "local";
  actualizarBloqueEmpate();
});
document.getElementById("btnGanadorEtVisitante").addEventListener("click", () => {
  ganadorEtSeleccionado = "visitante";
  actualizarBloqueEmpate();
});
document.getElementById("btnPenalesLocal").addEventListener("click", () => {
  ganadorPenalesSeleccionado = "local";
  actualizarBloqueEmpate();
});
document.getElementById("btnPenalesVisitante").addEventListener("click", () => {
  ganadorPenalesSeleccionado = "visitante";
  actualizarBloqueEmpate();
});

document.getElementById("btnCerrarModal").addEventListener("click", () => {
  document.getElementById("modalSemis").style.display = "none";
});

document.getElementById("btnGuardarSemis").addEventListener("click", async () => {
  if (estaSemiCerrada(matchIdActivo)) {
    alert("Esta predicción ya está cerrada.");
    document.getElementById("modalSemis").style.display = "none";
    return;
  }

  const local = Number(document.getElementById("inputMarcadorLocal").value) || 0;
  const visitante = Number(document.getElementById("inputMarcadorVisitante").value) || 0;
  const empatado = local === visitante;

  if (empatado && vaTiempoExtraSeleccionado === null) {
    alert("Indica si el partido se define en tiempo extra o en penales.");
    return;
  }
  if (empatado && vaTiempoExtraSeleccionado === true && !ganadorEtSeleccionado) {
    alert("Selecciona quién gana en tiempo extra.");
    return;
  }
  if (empatado && vaTiempoExtraSeleccionado === false && !ganadorPenalesSeleccionado) {
    alert("Selecciona quién gana en penales.");
    return;
  }
const goleadoresLocal = leerGoleadores("camposGoleadoresLocal");
  const goleadoresVisitante = leerGoleadores("camposGoleadoresVisitante");

  prediccionesSemis[matchIdActivo] = {
    marcador: { local, visitante },
    goleadoresLocal,
    goleadoresVisitante,
    vaTiempoExtra: empatado ? vaTiempoExtraSeleccionado : null,
    ganadorTiempoExtra: empatado && vaTiempoExtraSeleccionado === true ? ganadorEtSeleccionado : null,
    ganadorPenales: empatado && vaTiempoExtraSeleccionado === false ? ganadorPenalesSeleccionado : null,
  };

  try {
    const usuarioKey = usuario.toLowerCase();
    const usuarioRef = ref(db, "predicciones/" + usuarioKey);
    const snapshot = await get(usuarioRef);
    const datosActuales = snapshot.exists() ? snapshot.val() : {};

    await set(usuarioRef, {
      ...datosActuales,
      nombre: usuario,
      fecha: new Date().toISOString(),
      semis: prediccionesSemis,
    });

    document.getElementById("modalSemis").style.display = "none";
    renderBracket();

    const mensaje = document.getElementById("mensajeExitoSemis");
    mensaje.classList.add("show");
    setTimeout(() => mensaje.classList.remove("show"), 3000);
  } catch (error) {
    console.error("Error al guardar predicción de semis:", error);
    alert("Error al guardar la predicción. Revisa la consola.");
  }
});

/* ===================== */
/* CONTADORES             */
/* ===================== */

function actualizarContador() {
  const ahora = new Date();
  const diferencia = fechaCierre - ahora;

  if (diferencia <= 0) {
    document.getElementById("dias").innerText = "00";
    document.getElementById("horas").innerText = "00";
    document.getElementById("minutos").innerText = "00";
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("dias").innerText = dias.toString().padStart(2, "0");
  document.getElementById("horas").innerText = horas
    .toString()
    .padStart(2, "0");
  document.getElementById("minutos").innerText = minutos
    .toString()
    .padStart(2, "0");
}

function actualizarContadorCuartos() {
  const ahora = new Date();
  const diferencia = fechaCierreCuartos - ahora;

  if (diferencia <= 0) {
    document.getElementById("dias16").innerText = "00";
    document.getElementById("horas16").innerText = "00";
    document.getElementById("minutos16").innerText = "00";
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("dias16").innerText = dias
    .toString()
    .padStart(2, "0");
  document.getElementById("horas16").innerText = horas
    .toString()
    .padStart(2, "0");
  document.getElementById("minutos16").innerText = minutos
    .toString()
    .padStart(2, "0");
}

/* ===================== */
/* PUNTAJE SEMIS           */
/* ===================== */

function obtenerGanadorRelativo(obj) {
  if (obj.marcador.local !== obj.marcador.visitante) {
    return obj.marcador.local > obj.marcador.visitante ? "local" : "visitante";
  }
  if (obj.vaTiempoExtra) return obj.ganadorTiempoExtra;
  return obj.ganadorPenales;
}

function calcularPuntosPartidoSemi(prediccion, resultado) {
  let puntos = 0;

  const ganadorPrediccion = obtenerGanadorRelativo(prediccion);
  const ganadorReal = obtenerGanadorRelativo(resultado);
  puntos += ganadorPrediccion === ganadorReal ? 3 : -3;

  const marcadorExacto =
    prediccion.marcador.local === resultado.marcador.local &&
    prediccion.marcador.visitante === resultado.marcador.visitante;
  puntos += marcadorExacto ? 5 : -5;

  const golesPredichos = [
    ...(prediccion.goleadoresLocal || []),
    ...(prediccion.goleadoresVisitante || []),
  ];
  const golesReales = [
    ...(resultado.goleadoresLocal || []),
    ...(resultado.goleadoresVisitante || []),
  ].map((n) => n.trim().toLowerCase());

  golesPredichos.forEach((jugador) => {
    const acerto = golesReales.includes(jugador.trim().toLowerCase());
    puntos += acerto ? 2 : -2;
  });

  const empatoPrediccion = prediccion.marcador.local === prediccion.marcador.visitante;

  if (empatoPrediccion) {
    const empatoReal = resultado.marcador.local === resultado.marcador.visitante;
    const etDecisivoReal = empatoReal ? !!resultado.vaTiempoExtra : false;

    puntos += prediccion.vaTiempoExtra === etDecisivoReal ? 2 : -2;

    if (prediccion.vaTiempoExtra === true && etDecisivoReal) {
      puntos += prediccion.ganadorTiempoExtra === resultado.ganadorTiempoExtra ? 3 : -3;
    }

    if (prediccion.vaTiempoExtra === false && empatoReal && !etDecisivoReal) {
      puntos += prediccion.ganadorPenales === resultado.ganadorPenales ? 3 : -3;
    }
  }

  return puntos;
}

function calcularPuntosSemis(prediccionSemis, resultadosSemis) {
  let total = 0;
  if (!prediccionSemis) return 0;

  for (const matchId in resultadosSemis) {
    const resultado = resultadosSemis[matchId];
    const prediccion = prediccionSemis[matchId];
    if (!prediccion) continue;

    total += calcularPuntosPartidoSemi(prediccion, resultado);
  }

  return total;
}

/* ===================== */
/* RANKING                */
/* ===================== */

async function cargarRanking() {
  const contenedor = document.getElementById("rankingContainer");
  contenedor.innerHTML = "";

  const prediccionesSnapshot = await get(child(ref(db), "predicciones"));
  const resultadosSnapshot = await get(child(ref(db), "resultados"));

  if (!prediccionesSnapshot.exists()) {
    contenedor.innerHTML = "<p>No hay predicciones todavía.</p>";
    return;
  }

  if (!resultadosSnapshot.exists()) {
    contenedor.innerHTML = "<p>Aún no se han registrado resultados reales.</p>";
    return;
  }

  const prediccionesUsuarios = prediccionesSnapshot.val();
  const resultados = resultadosSnapshot.val();
  const ranking = [];

  for (let usuarioKey in prediccionesUsuarios) {
    const prediccionUsuario = prediccionesUsuarios[usuarioKey];
    let puntosTotales = 0;

    for (let grupo in grupos) {
      if (resultados[grupo]?.posiciones && prediccionUsuario.grupos?.[grupo]) {
        puntosTotales += calcularPuntosGrupo(
          prediccionUsuario.grupos[grupo],
          resultados[grupo].posiciones,
        );
      }
    }

    if (resultados.dieciseisavos && prediccionUsuario.dieciseisavos) {
      puntosTotales += calcularPuntos16avos(
        prediccionUsuario.dieciseisavos,
        resultados.dieciseisavos,
      );
    }

    if (resultados.octavos && prediccionUsuario.octavos) {
      puntosTotales += calcularPuntos16avos(
        prediccionUsuario.octavos,
        resultados.octavos,
      );
    }

    if (resultados.cuartos && prediccionUsuario.cuartos) {
      puntosTotales += calcularPuntos16avos(
        prediccionUsuario.cuartos,
        resultados.cuartos,
      );
    }

    if (resultados.semis && prediccionUsuario.semis) {
      puntosTotales += calcularPuntosSemis(
        prediccionUsuario.semis,
        resultados.semis,
      );
    }

    ranking.push({
      nombre: prediccionUsuario.nombre,
      puntos: Math.max(0, puntosTotales),
    });
  }

  ranking.sort((a, b) => b.puntos - a.puntos);

  ranking.forEach((usuario, index) => {
    let clase = "";
    let texto = index + 1;

    if (index === 0) clase = "primero";
    else if (index === 1) clase = "segundo";
    else if (index === 2) clase = "tercero";

    if (index === ranking.length - 1) clase = "ultimo";

    contenedor.innerHTML += `
      <div class="ranking-item">
        <div class="posicion ${clase}">
          ${texto}
        </div>

        <span>${usuario.nombre}</span>

        <b>${usuario.puntos}</b>
      </div>
    `;
  });
}

function calcularPuntosGrupo(prediccion, resultado) {
  let puntos = 0;

  const clasificadosPrediccion = prediccion.slice(0, 2);
  const clasificadosResultado = resultado.slice(0, 2);

  clasificadosPrediccion.forEach((equipo, posicion) => {
    if (clasificadosResultado[posicion] === equipo) {
      puntos += 3;
    } else if (clasificadosResultado.includes(equipo)) {
      puntos += 1;
    }
  });

  if (prediccion[2] === resultado[2]) {
    puntos += 3;
  }

  return puntos;
}

function normalizarCodigo(codigo) {
  if (codigo === "eng") return "gb";
  return codigo;
}

function calcularPuntos16avos(prediccion16, resultados16) {
  let puntos = 0;

  for (let partidoId in resultados16) {
    const resultado = resultados16[partidoId];
    const ganadorReal =
      typeof resultado === "string" ? resultado : resultado.ganador;

    if (
      normalizarCodigo(prediccion16[partidoId]) ===
      normalizarCodigo(ganadorReal)
    ) {
      puntos += 3;
    }
  }

  return puntos;
}

/* ===================== */
/* NAVEGACIÓN             */
/* ===================== */

const btnGrupos = document.getElementById("btnGrupos");
const btn16vos = document.getElementById("btn16vos");
const btnSemis = document.getElementById("btnSemis");
const btnRanking = document.getElementById("btnRanking");

function ocultarTodasLasVistas() {
  document.getElementById("groupsView").style.display = "none";
  document.getElementById("dieciseisavosView").style.display = "none";
  document.getElementById("semisView").style.display = "none";
  document.getElementById("rankingView").style.display = "none";

  [btnGrupos, btn16vos, btnSemis, btnRanking].forEach((b) =>
    b.classList.remove("active"),
  );
}

btnRanking.addEventListener("click", () => {
  ocultarTodasLasVistas();
  document.getElementById("rankingView").style.display = "block";
  btnRanking.classList.add("active");
  cargarRanking();
});

btn16vos.addEventListener("click", () => {
  ocultarTodasLasVistas();
  document.getElementById("dieciseisavosView").style.display = "block";
  btn16vos.classList.add("active");
});

btnSemis.addEventListener("click", () => {
  ocultarTodasLasVistas();
  document.getElementById("semisView").style.display = "block";
  btnSemis.classList.add("active");
  renderBracket();
});

btnGrupos.addEventListener("click", () => {
  ocultarTodasLasVistas();
  document.getElementById("groupsView").style.display = "block";
  btnGrupos.classList.add("active");
});

/* ===================== */
/* MÚSICA                 */
/* ===================== */

const canciones = [
  "audio/waka waka.mp3",
  "audio/We Are One.mp3",
  "audio/Champions.mp3",
  "audio/Hayya Hayya.mp3",
  "audio/Feet Don t Fail Me Now.mp3",
  "audio/Live It Up.mp3",
];

const nombreCancion = document.getElementById("nombreCancion");
const audio = document.getElementById("musicaFondo");
const btnMusica = document.getElementById("btnMusica");

let sonando = false;

function reproducirAleatoria() {
  const indice = Math.floor(Math.random() * canciones.length);
  audio.src = canciones[indice];

  const nombre = canciones[indice].replace("audio/", "").replace(".mp3", "");
  nombreCancion.innerText = "Sonando: " + nombre;

  audio.play();
}

btnMusica.addEventListener("click", () => {
  if (!sonando) {
    if (audio.src) {
      audio.play();
    } else {
      reproducirAleatoria();
    }

    sonando = true;
    btnMusica.innerText = "🔇 Pausar";
  } else {
    audio.pause();
    sonando = false;
    btnMusica.innerText = "🎵 Música";
  }
});

audio.addEventListener("ended", () => {
  reproducirAleatoria();
});