import { db } from "./firebase.js";
import { semis, tercerPuesto, final } from "./bracket-data.js";

import {
  ref,
  update,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const claveAdmin = prompt("Clave de Administrador");

if (claveAdmin !== "papiador12") {
  alert("Acceso denegado");
  window.location.href = "index.html";
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
    { nombre: "Inglaterra", codigoInterno: "eng", codigo: "gb" },
    { nombre: "Croacia", codigo: "hr" },
    { nombre: "Ghana", codigo: "gh" },
    { nombre: "Panamá", codigo: "pa" },
  ],
};

const partidosCuartos = [
  { id: "M97", equipos: ["fr", "ma"], detalle: "Francia vs Marruecos" },
  { id: "M98", equipos: ["es", "be"], detalle: "España vs Bélgica" },
  { id: "M99", equipos: ["no", "eng"], detalle: "Noruega vs Inglaterra" },
  { id: "M100", equipos: ["ar", "ch"], detalle: "Argentina vs Suiza" },
];

const resultados = {};
const resultadosCuartos = {};

const container = document.getElementById("groupsContainer");
const containerCuartos = document.getElementById("partidos16AdminContainer");

crearGrupos();
crearPartidosCuartosAdmin();
actualizarBoton();
actualizarBotonCuartos();


function obtenerEquipoPorCodigo(codigo) {
  if (codigo === "eng") {
    return { nombre: "Inglaterra", codigo: "gb", codigoInterno: "eng" };
  }

  for (let grupo in grupos) {
    const equipo = grupos[grupo].find((e) => {
      return e.codigo === codigo || e.codigoInterno === codigo;
    });

    if (equipo) {
      return equipo;
    }
  }

  return null;
}

/* ===================== */
/* RESULTADOS DE GRUPOS */
/* ===================== */

function crearGrupos() {
  for (let letra in grupos) {
    resultados[letra] = [];

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
      fila.dataset.codigo = equipo.codigoInterno || equipo.codigo;

      fila.innerHTML = `
        <div class="position"></div>
        <img src="https://flagcdn.com/w40/${equipo.codigo}.png">
        <span>${equipo.nombre}</span>
      `;

      fila.addEventListener("click", () => {
        manejarSeleccion(letra, fila.dataset.codigo, card);
      });

      card.appendChild(fila);
    });

    container.appendChild(card);
  }
}

function manejarSeleccion(grupo, codigo, card) {
  const seleccion = resultados[grupo];
  const indice = seleccion.indexOf(codigo);

  if (indice !== -1) {
    seleccion.splice(indice, 1);
  } else {
    if (seleccion.length >= 4) return;
    seleccion.push(codigo);
  }

  actualizarCard(grupo, card);
  actualizarBoton();
}

function actualizarCard(grupo, card) {
  const seleccion = resultados[grupo];
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

function actualizarBoton() {
  let gruposCompletos = 0;

  for (let grupo in resultados) {
    if (resultados[grupo].length === 4) {
      gruposCompletos++;
    }
  }

  const boton = document.getElementById("btnGuardarResultados");

  if (gruposCompletos > 0) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = `Guardar ${gruposCompletos} grupo(s)`;
  } else {
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Selecciona al menos un grupo completo";
  }
}

document
  .getElementById("btnGuardarResultados")
  .addEventListener("click", async () => {
    try {
      const resultadosParaGuardar = {};

      for (let grupo in resultados) {
        if (resultados[grupo].length === 4) {
          resultadosParaGuardar[`resultados/${grupo}`] = {
            posiciones: resultados[grupo],
            actualizadoEn: new Date().toISOString(),
          };
        }
      }

      await update(ref(db), resultadosParaGuardar);

      alert("Resultados de grupos actualizados correctamente");
    } catch (error) {
      console.error("Error al guardar resultados:", error);
      alert("Error al guardar resultados");
    }
  });

/* ===================== */
/* RESULTADOS DE CUARTOS */
/* ===================== */

function crearPartidosCuartosAdmin() {
  containerCuartos.innerHTML = "";

  partidosCuartos.forEach((partido) => {
    resultadosCuartos[partido.id] = "";

    const equipo1 = obtenerEquipoPorCodigo(partido.equipos[0]);
    const equipo2 = obtenerEquipoPorCodigo(partido.equipos[1]);

    const card = document.createElement("div");
    card.className = "bracket-match partido-16-card";
    card.dataset.partido = partido.id;

    card.innerHTML = `
      <div class="match-header">
        <span>${partido.id}</span>
        <small>${partido.detalle}</small>
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

    containerCuartos.appendChild(card);
  });
}

function manejarSeleccionCuartos(partidoId, codigo, card) {
  resultadosCuartos[partidoId] = codigo;

  actualizarPartidoCuartos(partidoId, card);
  actualizarBotonCuartos();
}

function actualizarPartidoCuartos(partidoId, card) {
  const seleccionado = resultadosCuartos[partidoId];

  card.querySelectorAll(".bracket-team").forEach((equipo) => {
    if (equipo.dataset.codigo === seleccionado) {
      equipo.classList.add("selected");
    } else {
      equipo.classList.remove("selected");
    }
  });
}

function actualizarBotonCuartos() {
  const completos = Object.values(resultadosCuartos).filter(
    (ganador) => ganador !== "",
  ).length;

  const boton = document.getElementById("btnGuardar16avos");

  if (completos > 0) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = `Guardar ${completos} resultado(s) de Cuartos`;
  } else {
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Selecciona al menos un resultado de Cuartos";
  }
}

document
  .getElementById("btnGuardar16avos")
  .addEventListener("click", async () => {
    try {
      const resultadosParaGuardar = {};

      for (let partidoId in resultadosCuartos) {
        if (resultadosCuartos[partidoId] !== "") {
          resultadosParaGuardar[`resultados/cuartos/${partidoId}`] =
            resultadosCuartos[partidoId];
        }
      }

      await update(ref(db), resultadosParaGuardar);

      alert("Resultados de Cuartos actualizados correctamente");
    } catch (error) {
      console.error("Error al guardar resultados de Cuartos:", error);
      alert("Error al guardar resultados de Cuartos");
    }
  });

/* ===================== */
/* RESULTADOS DE SEMIS    */
/* ===================== */

let etAdmin = {};
let penalesAdmin = {};

  function crearAdminSemis() {
  const cont = document.getElementById("semisAdminContainer");
  if (!cont) return;
  cont.innerHTML = "";

  const partidosDetalle = [...semis, ...tercerPuesto, ...final];

  partidosDetalle.forEach((partido) => {
    const [codigoLocal, codigoVisitante] = partido.equipos;
    const eqLocal = obtenerEquipoPorCodigo(codigoLocal);
    const eqVisitante = obtenerEquipoPorCodigo(codigoVisitante);

    etAdmin[partido.id] = null;
    penalesAdmin[partido.id] = null;

    const card = document.createElement("div");
    card.className = "bracket-match partido-semi-admin";
    card.dataset.partido = partido.id;

    card.innerHTML = `
      <div class="match-header"><span>${partido.id}</span><small>${eqLocal.nombre} vs ${eqVisitante.nombre}</small></div>

      <div class="modal-marcador-header">
        <div class="modal-equipo-header">
          <img src="https://flagcdn.com/w40/${eqLocal.codigo}.png"><span>${eqLocal.nombre}</span>
        </div>
        <div class="modal-equipo-header">
          <span>${eqVisitante.nombre}</span><img src="https://flagcdn.com/w40/${eqVisitante.codigo}.png">
        </div>
      </div>

      <div class="modal-marcador-inputs">
        <input type="number" min="0" value="0" class="input-marcador-local">
        <span class="modal-vs">-</span>
        <input type="number" min="0" value="0" class="input-marcador-visitante">
      </div>

      <div class="bloque-empate-admin" style="display:none;">
        <p class="modal-pregunta">¿Se definió en tiempo extra?</p>
        <div class="modal-opciones">
          <button type="button" class="modal-opcion btn-et-si">Sí</button>
          <button type="button" class="modal-opcion btn-et-no">No, penales</button>
        </div>
        <div class="bloque-ganador-et" style="display:none;">
          <div class="modal-opciones">
            <button type="button" class="modal-opcion btn-ganador-et-local">${eqLocal.nombre}</button>
            <button type="button" class="modal-opcion btn-ganador-et-visitante">${eqVisitante.nombre}</button>
          </div>
        </div>
        <div class="bloque-ganador-penales" style="display:none;">
          <div class="modal-opciones">
            <button type="button" class="modal-opcion btn-ganador-pen-local">${eqLocal.nombre}</button>
            <button type="button" class="modal-opcion btn-ganador-pen-visitante">${eqVisitante.nombre}</button>
          </div>
        </div>
      </div>

      <div class="modal-goleadores">
        <label>Goleadores ${eqLocal.nombre}</label>
        <input type="text" class="input-goles-local" placeholder="Ej: Mbappé, Dembélé">
        <label>Goleadores ${eqVisitante.nombre}</label>
        <input type="text" class="input-goles-visitante" placeholder="Ej: Yamal">
      </div>

      <button class="modal-guardar btn-guardar-semi">Guardar resultado</button>
    `;

    const inputLocal = card.querySelector(".input-marcador-local");
    const inputVisitante = card.querySelector(".input-marcador-visitante");
    const bloqueEmpate = card.querySelector(".bloque-empate-admin");
    const bloqueEt = card.querySelector(".bloque-ganador-et");
    const bloquePenales = card.querySelector(".bloque-ganador-penales");

    function refrescar() {
      const empatado = Number(inputLocal.value) === Number(inputVisitante.value);
      bloqueEmpate.style.display = empatado ? "block" : "none";
      bloqueEt.style.display = empatado && etAdmin[partido.id] === true ? "block" : "none";
      bloquePenales.style.display = empatado && etAdmin[partido.id] === false ? "block" : "none";

      card.querySelector(".btn-et-si").classList.toggle("activo", etAdmin[partido.id] === true);
      card.querySelector(".btn-et-no").classList.toggle("activo", etAdmin[partido.id] === false);
      card.querySelector(".btn-ganador-et-local").classList.toggle("activo", penalesAdmin[partido.id + "-et"] === "local");
      card.querySelector(".btn-ganador-et-visitante").classList.toggle("activo", penalesAdmin[partido.id + "-et"] === "visitante");
      card.querySelector(".btn-ganador-pen-local").classList.toggle("activo", penalesAdmin[partido.id] === "local");
      card.querySelector(".btn-ganador-pen-visitante").classList.toggle("activo", penalesAdmin[partido.id] === "visitante");
    }

    inputLocal.addEventListener("input", refrescar);
    inputVisitante.addEventListener("input", refrescar);

    card.querySelector(".btn-et-si").addEventListener("click", () => { etAdmin[partido.id] = true; refrescar(); });
    card.querySelector(".btn-et-no").addEventListener("click", () => { etAdmin[partido.id] = false; refrescar(); });
    card.querySelector(".btn-ganador-et-local").addEventListener("click", () => { penalesAdmin[partido.id + "-et"] = "local"; refrescar(); });
    card.querySelector(".btn-ganador-et-visitante").addEventListener("click", () => { penalesAdmin[partido.id + "-et"] = "visitante"; refrescar(); });
    card.querySelector(".btn-ganador-pen-local").addEventListener("click", () => { penalesAdmin[partido.id] = "local"; refrescar(); });
    card.querySelector(".btn-ganador-pen-visitante").addEventListener("click", () => { penalesAdmin[partido.id] = "visitante"; refrescar(); });

    card.querySelector(".btn-guardar-semi").addEventListener("click", async () => {
      const local = Number(inputLocal.value) || 0;
      const visitante = Number(inputVisitante.value) || 0;
      const empatado = local === visitante;

      if (empatado && etAdmin[partido.id] === null) {
        alert("Indica si el partido se definió en tiempo extra o en penales.");
        return;
      }
      if (empatado && etAdmin[partido.id] === true && !penalesAdmin[partido.id + "-et"]) {
        alert("Selecciona quién ganó en tiempo extra.");
        return;
      }
      if (empatado && etAdmin[partido.id] === false && !penalesAdmin[partido.id]) {
        alert("Selecciona quién ganó en penales.");
        return;
      }

      const goleadoresLocal = card.querySelector(".input-goles-local").value
        .split(",").map((n) => n.trim()).filter(Boolean);
      const goleadoresVisitante = card.querySelector(".input-goles-visitante").value
        .split(",").map((n) => n.trim()).filter(Boolean);

      const resultado = {
        marcador: { local, visitante },
        goleadoresLocal,
        goleadoresVisitante,
        vaTiempoExtra: empatado ? etAdmin[partido.id] : null,
        ganadorTiempoExtra: empatado && etAdmin[partido.id] === true ? penalesAdmin[partido.id + "-et"] : null,
        ganadorPenales: empatado && etAdmin[partido.id] === false ? penalesAdmin[partido.id] : null,
      };

      try {
        await update(ref(db), {
          [`resultados/semis/${partido.id}`]: resultado,
        });
        alert(`Resultado de ${partido.id} guardado correctamente`);
      } catch (error) {
        console.error("Error al guardar resultado de semis:", error);
        alert("Error al guardar el resultado de semis");
      }
    });

    cont.appendChild(card);
  });
}
async function crearAjustesManuales() {
  const cont = document.getElementById("ajustesContainer");
  if (!cont) return;
  cont.innerHTML = "";

  const snapshot = await get(child(ref(db), "predicciones"));
  if (!snapshot.exists()) return;

  const usuarios = snapshot.val();
  const ajustesSnapshot = await get(child(ref(db), "resultados/ajustes"));
  const ajustesActuales = ajustesSnapshot.exists() ? ajustesSnapshot.val() : {};

  for (let usuarioKey in usuarios) {
    const nombre = usuarios[usuarioKey].nombre || usuarioKey;

    const card = document.createElement("div");
    card.className = "bracket-match ajuste-card";

    card.innerHTML = `
      <div class="match-header"><span>${nombre}</span></div>
      <div class="modal-marcador-inputs">
        <input type="number" class="input-ajuste" value="${ajustesActuales[usuarioKey] || 0}" style="width:80px;">
      </div>
      <button class="modal-guardar btn-guardar-ajuste">Guardar ajuste</button>
    `;

    card.querySelector(".btn-guardar-ajuste").addEventListener("click", async () => {
      const valor = Number(card.querySelector(".input-ajuste").value) || 0;
      try {
        await update(ref(db), {
          [`resultados/ajustes/${usuarioKey}`]: valor,
        });
        alert(`Ajuste de ${nombre} guardado: ${valor} pts`);
      } catch (error) {
        console.error("Error al guardar ajuste:", error);
        alert("Error al guardar el ajuste");
      }
    });

    cont.appendChild(card);
  }
}

crearAjustesManuales();
crearAdminSemis();