import { db } from "./firebase.js";

import {
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const usuario = localStorage.getItem("nombreUsuario");

const fechaCierre = new Date("2026-06-11T13:00:00-06:00");
const fechaCierre16avos = new Date("2026-07-04T12:28:59-06:00");

if (usuario === null) {
  window.location.href = "index.html";
}

function prediccionesCerradas() {
  return new Date() >= fechaCierre;
}

function predicciones16avosCerradas() {
  return new Date() >= fechaCierre16avos;
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

const partidos16avos = [
  { id: "M74", equipos: ["de", "py"], detalle: "Alemania vs Paraguay" },
  { id: "M77", equipos: ["fr", "se"], detalle: "Francia vs Suecia" },
  { id: "M73", equipos: ["za", "ca"], detalle: "Sudáfrica vs Canadá" },
  { id: "M75", equipos: ["nl", "ma"], detalle: "Países Bajos vs Marruecos" },

  { id: "M83", equipos: ["pt", "hr"], detalle: "Portugal vs Croacia" },
  { id: "M84", equipos: ["es", "at"], detalle: "España vs Austria" },
  { id: "M81", equipos: ["us", "ba"], detalle: "Estados Unidos vs Bosnia" },
  { id: "M82", equipos: ["be", "sn"], detalle: "Bélgica vs Senegal" },

  { id: "M76", equipos: ["br", "jp"], detalle: "Brasil vs Japón" },
  { id: "M78", equipos: ["ci", "no"], detalle: "Costa de Marfil vs Noruega" },
  { id: "M79", equipos: ["mx", "ec"], detalle: "México vs Ecuador" },
  { id: "M80", equipos: ["eng", "cd"], detalle: "Inglaterra vs RD Congo" },

  { id: "M86", equipos: ["ar", "cv"], detalle: "Argentina vs Cabo Verde" },
  { id: "M88", equipos: ["au", "eg"], detalle: "Australia vs Egipto" },
  { id: "M85", equipos: ["ch", "dz"], detalle: "Suiza vs Argelia" },
  { id: "M87", equipos: ["co", "gh"], detalle: "Colombia vs Ghana" },
];
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

const predicciones = {};
const predicciones16avos = {};

let tienePrediccionGuardada = false;
let tienePrediccion16avosGuardada = false;

const container = document.getElementById("groupsContainer");
const totalGrupos = Object.keys(grupos).length;

crearGrupos();
crearPartidosOctavos();
actualizarBarra();
actualizarBoton16avos();
cargarPrediccionUsuario();
actualizarContador();
actualizarContador16avos();
cargarRanking();

setInterval(actualizarContador, 1000);
setInterval(actualizarContador16avos, 1000);

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

    if (datos.octavos) {
      tienePrediccion16avosGuardada = true;

      for (let partidoId in datos.octavos) {
        predicciones16avos[partidoId] = datos.octavos[partidoId];

        const card = document.querySelector(
          `.partido-16-card[data-partido="${partidoId}"]`,
        );

        if (card) actualizarPartido16avos(partidoId, card);
      }
    }

    actualizarBarra();
    actualizarBoton16avos();
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

  if (predicciones16avosCerradas()) {
    document.querySelectorAll(".bracket-team").forEach((equipo) => {
      equipo.style.pointerEvents = "none";
    });

    const boton = document.getElementById("btnEnviar16avos");
    boton.disabled = true;
    boton.classList.remove("enabled");
    boton.innerText = "Predicciones de 8avos cerradas";
  }
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

function crearPartidosOctavos() {
  const container16 = document.getElementById("partidos16Container");
  container16.innerHTML = "";

  partidosOctavos.forEach((partido) => {
    predicciones16avos[partido.id] = "";

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

      <div class="bracket-team" data-codigo="${equipo1.codigo}">
        <img src="https://flagcdn.com/w40/${equipo1.codigo}.png">
        <span>${equipo1.nombre}</span>
      </div>

      <div class="versus">VS</div>

      <div class="bracket-team" data-codigo="${equipo2.codigo}">
        <img src="https://flagcdn.com/w40/${equipo2.codigo}.png">
        <span>${equipo2.nombre}</span>
      </div>
    `;

    card.querySelectorAll(".bracket-team").forEach((equipo) => {
      equipo.addEventListener("click", () => {
        manejarSeleccion16avos(partido.id, equipo.dataset.codigo, card);
      });
    });

    container16.appendChild(card);
  });
}

function manejarSeleccion16avos(partidoId, codigo, card) {
  if (predicciones16avosCerradas()) return;

  predicciones16avos[partidoId] = codigo;

  actualizarPartido16avos(partidoId, card);
  actualizarBoton16avos();
}

function actualizarPartido16avos(partidoId, card) {
  const seleccionado = predicciones16avos[partidoId];

  card.querySelectorAll(".bracket-team").forEach((equipo) => {
    if (equipo.dataset.codigo === seleccionado) {
      equipo.classList.add("selected");
    } else {
      equipo.classList.remove("selected");
    }
  });
}

function actualizarBoton16avos() {
  const totalPartidos = partidosOctavos.length;

  const completos = Object.values(predicciones16avos).filter(
    (ganador) => ganador !== "",
  ).length;

  const boton = document.getElementById("btnEnviar16avos");

  if (completos === totalPartidos) {
    boton.disabled = false;
    boton.classList.add("enabled");
    boton.innerText = tienePrediccion16avosGuardada
      ? "Actualizar predicción de 8avos"
      : "Enviar predicción de 8avos";
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
      if (predicciones16avosCerradas()) {
        alert("Las predicciones de 8avos ya están cerradas.");
        return;
      }

      const totalPartidos = partidosOctavos.length;
      const completos = Object.values(predicciones16avos).filter(
        (ganador) => ganador !== "",
      ).length;

      if (completos !== totalPartidos) {
        alert("Debes completar todos los partidos de 8avos.");
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
        octavos: predicciones16avos,
      });

      tienePrediccion16avosGuardada = true;
      actualizarBoton16avos();

      const mensaje = document.getElementById("mensajeExito16avos");
      mensaje.classList.add("show");

      setTimeout(() => {
        mensaje.classList.remove("show");
      }, 3000);
    } catch (error) {
      console.error("Error al guardar predicción de 8avos:", error);
      alert("Error al guardar la predicción de 8avos. Revisa la consola.");
    }
  });

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

function actualizarContador16avos() {
  const ahora = new Date();
  const diferencia = fechaCierre16avos - ahora;

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
    ranking.push({
      nombre: prediccionUsuario.nombre,
      puntos: puntosTotales,
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

const btnGrupos = document.getElementById("btnGrupos");
const btn16vos = document.getElementById("btn16vos");
const btnRanking = document.getElementById("btnRanking");

btnRanking.addEventListener("click", () => {
  document.getElementById("groupsView").style.display = "none";
  document.getElementById("dieciseisavosView").style.display = "none";
  document.getElementById("rankingView").style.display = "block";

  btnRanking.classList.add("active");
  btnGrupos.classList.remove("active");
  btn16vos.classList.remove("active");

  cargarRanking();
});

btn16vos.addEventListener("click", () => {
  document.getElementById("groupsView").style.display = "none";
  document.getElementById("rankingView").style.display = "none";
  document.getElementById("dieciseisavosView").style.display = "block";

  btn16vos.classList.add("active");
  btnGrupos.classList.remove("active");
  btnRanking.classList.remove("active");
});

btnGrupos.addEventListener("click", () => {
  document.getElementById("rankingView").style.display = "none";
  document.getElementById("dieciseisavosView").style.display = "none";
  document.getElementById("groupsView").style.display = "block";

  btnGrupos.classList.add("active");
  btn16vos.classList.remove("active");
  btnRanking.classList.remove("active");
});

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
