import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
const usuario =
localStorage.getItem("nombreUsuario");
const fechaCierre = new Date("2026-06-11T13:00:00-06:00");

function prediccionesCerradas() {
    return new Date() >= fechaCierre;
}
if(usuario === null){
    window.location.href = "index.html";
}
const grupos = {
    A: [
        { nombre: "México", codigo: "mx" },
        { nombre: "Sudáfrica", codigo: "za" },
        { nombre: "Corea del Sur", codigo: "kr" },
        { nombre: "República Checa", codigo: "cz" }
    ],
    B: [
        { nombre: "Canadá", codigo: "ca" },
        { nombre: "Bosnia", codigo: "ba" },
        { nombre: "Catar", codigo: "qa" },
        { nombre: "Suiza", codigo: "ch" }
    ],
    C: [
        { nombre: "Brasil", codigo: "br" },
        { nombre: "Marruecos", codigo: "ma" },
        { nombre: "Haití", codigo: "ht" },
        { nombre: "Escocia", codigo: "gb" } // Nota: Flagcdn suele usar 'gb' o requiere un asset local para Escocia independiente
    ],
    D: [
        { nombre: "Estados Unidos", codigo: "us" },
        { nombre: "Paraguay", codigo: "py" },
        { nombre: "Australia", codigo: "au" },
        { nombre: "Turquía", codigo: "tr" }
    ],
    E: [
        { nombre: "Alemania", codigo: "de" },
        { nombre: "Curazao", codigo: "cw" },
        { nombre: "Costa de Marfil", codigo: "ci" },
        { nombre: "Ecuador", codigo: "ec" }
    ],
    F: [
        { nombre: "Países Bajos", codigo: "nl" },
        { nombre: "Japón", codigo: "jp" },
        { nombre: "Suecia", codigo: "se" },
        { nombre: "Túnez", codigo: "tn" }
    ],
    G: [
        { nombre: "Bélgica", codigo: "be" },
        { nombre: "Egipto", codigo: "eg" },
        { nombre: "Irán", codigo: "ir" },
        { nombre: "Nueva Zelanda", codigo: "nz" }
    ],
    H: [
        { nombre: "España", codigo: "es" },
        { nombre: "Cabo Verde", codigo: "cv" },
        { nombre: "Arabia Saudita", codigo: "sa" },
        { nombre: "Uruguay", codigo: "uy" }
    ],
    I: [
        { nombre: "Francia", codigo: "fr" },
        { nombre: "Senegal", codigo: "sn" },
        { nombre: "Irak", codigo: "iq" },
        { nombre: "Noruega", codigo: "no" }
    ],
    J: [
        { nombre: "Argentina", codigo: "ar" },
        { nombre: "Argelia", codigo: "dz" },
        { nombre: "Austria", codigo: "at" },
        { nombre: "Jordania", codigo: "jo" }
    ],
    K: [
        { nombre: "Portugal", codigo: "pt" },
        { nombre: "RD Congo", codigo: "cd" },
        { nombre: "Uzbekistán", codigo: "uz" },
        { nombre: "Colombia", codigo: "co" }
    ],
    L: [
        { nombre: "Inglaterra", codigo: "gb" }, // Mapeado a 'gb' para asegurar que cargue en Flagcdn
        { nombre: "Croacia", codigo: "hr" },
        { nombre: "Ghana", codigo: "gh" },
        { nombre: "Panamá", codigo: "pa" }
    ]
};

const predicciones = {};
let tienePrediccionGuardada = false;
function obtenerPrediccionFinal() {

    return {

        nombre: usuario,

        fecha: new Date().toISOString(),

        grupos: predicciones

    };

}

const container = document.getElementById("groupsContainer");

const totalGrupos = Object.keys(grupos).length;

crearGrupos();

actualizarBarra();
cargarPrediccionUsuario();

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

        grupos[letra].forEach(equipo => {

            const fila = document.createElement("div");

            fila.className = "team";

            fila.dataset.codigo = equipo.codigo;

            fila.innerHTML = `
                <div class="position"></div>

                <img src="https://flagcdn.com/w40/${equipo.codigo}.png">

                <span>${equipo.nombre}</span>
            `;

            fila.addEventListener("click", () => {

                manejarSeleccion(
                    letra,
                    equipo.codigo,
                    card
                );

            });

            card.appendChild(fila);

        });

        container.appendChild(card);

    }

}

function manejarSeleccion(grupo, codigo, card) {

    if (prediccionesCerradas()) {
        return;
    }

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

    equipos.forEach(equipo => {

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

        if (predicciones[grupo].length === 4) {

            completos++;

        }

    }

    document.getElementById(
        "progressText"
    ).innerText =
        completos +
        " / " +
        totalGrupos +
        " grupos completos";

    document.getElementById(
        "progressBar"
    ).style.width =
        (completos / totalGrupos) * 100 + "%";
    const boton =
        document.getElementById("btnEnviar");

    if (completos === totalGrupos) {

        boton.disabled = false;

        boton.classList.add("enabled");

       boton.innerText = tienePrediccionGuardada
    ? "Actualizar predicción"
    : "Enviar predicción";

    } else {

        boton.disabled = true;

        boton.classList.remove("enabled");

        boton.innerText =
            "Completa todos los grupos";

    }

}
async function cargarPrediccionUsuario() {

    const usuarioKey = usuario.toLowerCase();

    const snapshot = await get(
        child(ref(db), "predicciones/" + usuarioKey)
    );

    if(snapshot.exists()){
    tienePrediccionGuardada = true;
        const datos = snapshot.val();
         
        for(let grupo in datos.grupos){

            predicciones[grupo] = datos.grupos[grupo];

            const cards = document.querySelectorAll(".group-card");

            cards.forEach(card => {

                const titulo = card.querySelector("h3").innerText;

                if(titulo === "GRUPO " + grupo){

                    actualizarCard(grupo, card);

                }

            });

        }

        actualizarBarra();

        document.getElementById("btnEnviar").innerText =
        "Actualizar predicción";

    }

    if(prediccionesCerradas()){


        document.querySelectorAll(".team").forEach(equipo => {
            equipo.style.pointerEvents = "none";
        });

        const boton = document.getElementById("btnEnviar");

        boton.disabled = true;
        boton.classList.remove("enabled");
        boton.innerText = "Predicciones cerradas";

    }

}
document
.getElementById("btnEnviar")
.addEventListener("click", async () => {

    try {

        if(prediccionesCerradas()){
            alert("Las predicciones ya están cerradas.");
            return;
        }

        const usuarioKey = usuario.toLowerCase();

        const prediccionFinal = obtenerPrediccionFinal();

        await set(
            ref(db, "predicciones/" + usuarioKey),
            prediccionFinal
        );
        tienePrediccionGuardada = true;
    

        const boton = document.getElementById("btnEnviar");

        boton.disabled = false;
        boton.classList.add("enabled");

        boton.innerText = "Actualizar predicción";

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


function actualizarContador() {

    const ahora = new Date();

    const diferencia =
        fechaCierre - ahora;

    if (diferencia <= 0) {

        document.getElementById(
            "dias"
        ).innerText = "00";

        document.getElementById(
            "horas"
        ).innerText = "00";

        document.getElementById(
            "minutos"
        ).innerText = "00";

        return;

    }

    const dias =
        Math.floor(
            diferencia /
            (1000 * 60 * 60 * 24)
        );

    const horas =
        Math.floor(
            (
                diferencia %
                (1000 * 60 * 60 * 24)
            ) /
            (1000 * 60 * 60)
        );

    const minutos =
        Math.floor(
            (
                diferencia %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );
    if (dias === 0) {

        document.querySelector(
            ".count-title"
        ).innerText =
            "Hoy comienza el Mundial";

    }
    document.getElementById(
        "dias"
    ).innerText =
        dias.toString().padStart(2, "0");

    document.getElementById(
        "horas"
    ).innerText =
        horas.toString().padStart(2, "0");

    document.getElementById(
        "minutos"
    ).innerText =
        minutos.toString().padStart(2, "0");

}

actualizarContador();

setInterval(
    actualizarContador,
    1000
);

async function cargarRanking() {

    const contenedor =
    document.getElementById("rankingContainer");

    contenedor.innerHTML = "";

    const prediccionesSnapshot = await get(
        child(ref(db), "predicciones")
    );

    const resultadosSnapshot = await get(
        child(ref(db), "resultados")
    );

    if(!prediccionesSnapshot.exists()){

        contenedor.innerHTML =
        "<p>No hay predicciones todavía.</p>";

        return;
    }

    if(!resultadosSnapshot.exists()){

        contenedor.innerHTML =
        "<p>Aún no se han registrado resultados reales.</p>";

        return;
    }

    const prediccionesUsuarios =
    prediccionesSnapshot.val();

    const resultados =
    resultadosSnapshot.val();

    const ranking = [];

    for(let usuarioKey in prediccionesUsuarios){

        const prediccionUsuario =
        prediccionesUsuarios[usuarioKey];

        let puntosTotales = 0;

        for(let grupo in resultados){

            if(
                prediccionUsuario.grupos &&
                prediccionUsuario.grupos[grupo]
            ){

                puntosTotales += calcularPuntosGrupo(
                    prediccionUsuario.grupos[grupo],
                    resultados[grupo]
                );

            }

        }

        ranking.push({
            nombre: prediccionUsuario.nombre,
            puntos: puntosTotales
        });

    }

    ranking.sort((a, b) => b.puntos - a.puntos);

    ranking.forEach((usuario, index) => {

        let clase = "";
        let texto = index + 1;

        if(index === 0){
            clase = "primero";
        }else if(index === 1){
            clase = "segundo";
        }else if(index === 2){
            clase = "tercero";
        }

        if(index === ranking.length - 1){
            clase = "ultimo";
        }

        contenedor.innerHTML += `

        <div class="ranking-item">

            <div class="posicion ${clase}">
                ${texto}
            </div>

            <span>
                ${usuario.nombre}
            </span>

            <b>
                ${usuario.puntos}
            </b>

        </div>

        `;

    });

}
function calcularPuntosGrupo(prediccion, resultado) {

    let puntos = 0;

    prediccion.forEach((equipo, posicion) => {

        if(resultado[posicion] === equipo){

            puntos += 3;

        }else if(resultado.includes(equipo)){

            puntos += 1;

        }

    });

    return puntos;
}
cargarRanking();
const btnGrupos =
    document.getElementById(
        "btnGrupos"
    );

const btnRanking =
    document.getElementById(
        "btnRanking"
    );

btnRanking.addEventListener(
    "click",
    () => {

        document.getElementById(
            "groupsView"
        ).style.display =
            "none";

        document.getElementById(
            "rankingView"
        ).style.display =
            "block";

        btnRanking.classList.add(
            "active"
        );

        btnGrupos.classList.remove(
            "active"
        );

    });

btnGrupos.addEventListener(
    "click",
    () => {

        document.getElementById(
            "rankingView"
        ).style.display =
            "none";

        document.getElementById(
            "groupsView"
        ).style.display =
            "block";

        btnGrupos.classList.add(
            "active"
        );

        btnRanking.classList.remove(
            "active"
        );

    });
 const canciones = [

    "audio/waka waka.mp3",

    "audio/We Are One.mp3",
    "audio/Champions.mp3",
    "audio/Hayya Hayya.mp3",
    "audio/Feet Don t Fail Me Now.mp3",
    "audio/Live It Up.mp3"

];
const nombreCancion =
document.getElementById("nombreCancion");
const audio =
document.getElementById("musicaFondo");

const btnMusica =
document.getElementById("btnMusica");

let sonando = false;

function reproducirAleatoria(){

    const indice =
    Math.floor(
        Math.random() *
        canciones.length
    );

    audio.src =
    canciones[indice];
    const nombre =
    canciones[indice]
        .replace("audio/", "")
        .replace(".mp3", "");

    nombreCancion.innerText =
    "Sonando: " + nombre;

    audio.play();
}

btnMusica.addEventListener("click", () => {

    if(!sonando){

        if(audio.src){

            audio.play();

        }else{

            reproducirAleatoria();

        }

        sonando = true;

        btnMusica.innerText =
        "🔇 Pausar";

    }else{

        audio.pause();

        sonando = false;

        btnMusica.innerText =
        "🎵 Música";

    }

});

audio.addEventListener("ended", () => {

    reproducirAleatoria();

});
