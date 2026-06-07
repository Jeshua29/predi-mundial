import { db } from "./firebase.js";

import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
const claveAdmin = prompt("Clave de Administrador");

if(claveAdmin !== "papiador12"){
    alert("Acceso denegado");
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
const resultados = {};

const container =
document.getElementById("groupsContainer");

const totalGrupos =
Object.keys(grupos).length;

crearGrupos();
actualizarBoton();

function crearGrupos() {

    for(let letra in grupos){

        resultados[letra] = [];

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
                manejarSeleccion(letra, equipo.codigo, card);
            });

            card.appendChild(fila);

        });

        container.appendChild(card);

    }

}

function manejarSeleccion(grupo, codigo, card) {

    let seleccion = resultados[grupo];

    const indice = seleccion.indexOf(codigo);

    if(indice !== -1){

        seleccion.splice(indice, 1);

    }else{

        if(seleccion.length >= 4) return;

        seleccion.push(codigo);

    }

    actualizarCard(grupo, card);
    actualizarBoton();

}

function actualizarCard(grupo, card) {

    const seleccion = resultados[grupo];

    const equipos = card.querySelectorAll(".team");

    equipos.forEach(equipo => {

        const codigo = equipo.dataset.codigo;

        const pos = equipo.querySelector(".position");

        const indice = seleccion.indexOf(codigo);

        if(indice !== -1){

            pos.innerText = indice + 1;
            pos.classList.add("selected");

        }else{

            pos.innerText = "";
            pos.classList.remove("selected");

        }

    });

    const check = card.querySelector(".complete");

    if(seleccion.length === 4){

        check.innerHTML = "✓";
        card.classList.add("completed");

    }else{

        check.innerHTML = "";
        card.classList.remove("completed");

    }

}

function actualizarBoton() {

    let completos = 0;

    for(let grupo in resultados){

        if(resultados[grupo].length === 4){
            completos++;
        }

    }

    const boton =
    document.getElementById("btnGuardarResultados");

    if(completos === totalGrupos){

        boton.disabled = false;
        boton.classList.add("enabled");
        boton.innerText = "Guardar resultados";

    }else{

        boton.disabled = true;
        boton.classList.remove("enabled");
        boton.innerText = "Completa todos los grupos";

    }

}

document
.getElementById("btnGuardarResultados")
.addEventListener("click", async () => {

    try {

        await set(
            ref(db, "resultados"),
            resultados
        );

        alert("Resultados guardados correctamente");

    } catch(error) {

        console.error("Error al guardar resultados:", error);
        alert("Error al guardar resultados");

    }

});