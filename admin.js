import { db } from "./firebase.js";

import {
  ref,
  update,
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

const partidosOctavos = [
  { id: "M89", equipos: ["ca", "ma"], detalle: "Canadá vs Marruecos" },
  { id: "M90", equipos: ["py", "fr"], detalle: "Paraguay vs Francia" },

  { id: "M91", equipos: ["br", "no"], detalle: "Brasil vs Noruega" },
  { id: "M92", equipos: ["mx", "eng"], detalle: "México vs Inglaterra" },

  { id: "M93", equipos: ["pt", "es"], detalle: "Portugal vs España" },
  { id: "M94", equipos: ["us", "be"], detalle: "Estados Unidos vs Bélgica" },

  { id: "M95", equipos: ["ar", "eg"], detalle: "Argentina vs Egipto" },
  { id: "M96", equipos: ["ch", "co"], detalle: "Suiza vs Colombia" },
];

const resultados = {};
const resultadosOctavos = {};

const container = document.getElementById("groupsContainer");
const containerOctavos = document.getElementById("partidos16AdminContainer");

crearGrupos();
crearPartidosOctavosAdmin();
actualizarBoton();
actualizarBotonOctavos();

function obtenerEquipoPorCodigo(codigo) {
  if (codigo === "eng") {
    return {
      nombre: "Inglaterra",
      codigo: "gb",
      codigoInterno: "eng",
    };
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
/* RESULTADOS DE 8VOS */
/* ===================== */

function crearPartidosOctavosAdmin() {
  containerOctavos.innerHTML = "";

  partidosOctavos.forEach((partido) => {
    resultadosOctavos[partido.id] = "";

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
        manejarSeleccionOctavos(partido.id, equipo.dataset.codigo, card);
      });
    });

    containerOctavos.appendChild(card);
  });
}

function manejarSeleccionOctavos(partidoId, codigo, card) {
  resultadosOctavos[partidoId] = codigo;

  actualizarPartidoOctavos(partidoId, card);
  actualizarBotonOctavos();
}

function actualizarPartidoOctavos(partidoId, card) {
  const seleccionado = resultadosOctavos[partidoId];

  card.querySelectorAll(".bracket-team").forEach((equipo) => {
    if (equipo.dataset.codigo === seleccionado) {
      equipo.classList.add("selected");
    } else {
      equipo.classList.remove("selected");
    }
  });
}

function actualizarBotonOctavos() {
  const completos = Object.values(resultadosOctavos).filter(
    (ganador) => ganador !== "",
  ).length;

  const boton = document.getElementById("btnGuardar16avos");

  if (completos > 0) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = `Guardar ${completos} resultado(s) de 8vos`;
  } else {
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Selecciona al menos un resultado de 8vos";
  }
}

document
  .getElementById("btnGuardar16avos")
  .addEventListener("click", async () => {
    try {
      const resultadosParaGuardar = {};

      for (let partidoId in resultadosOctavos) {
        if (resultadosOctavos[partidoId] !== "") {
          resultadosParaGuardar[`resultados/octavos/${partidoId}`] =
            resultadosOctavos[partidoId];
        }
      }

      await update(ref(db), resultadosParaGuardar);

      alert("Resultados de 8vos actualizados correctamente");
    } catch (error) {
      console.error("Error al guardar resultados de 8vos:", error);
      alert("Error al guardar resultados de 8vos");
    }
  });