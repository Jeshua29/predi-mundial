import { db } from "./firebase.js";
import {
    ref,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
console.log(db);


const nombre =
document.getElementById("nombre");

const estado =
document.getElementById("estadoCuenta");

nombre.addEventListener("input", async ()=>{

    const valor = nombre.value.trim();

    if(valor === ""){

        estado.innerText = "Ingresa tu nombre.";
        estado.style.color = "#666";
        return;

    }

    const usuarioKey = valor.toLowerCase();

    const snapshot = await get(
        child(ref(db), "usuarios/" + usuarioKey)
    );

    if(snapshot.exists()){

        estado.innerText = "Esta cuenta ya existe. Ingresa tu contraseña.";
        estado.style.color = "#2563eb";

    }else{

        estado.innerText = "Nombre disponible. Se creará una cuenta.";
        estado.style.color = "#2ecc71";

    }

});

document
.getElementById("btnComenzar")
.addEventListener("click", async ()=>{

    const usuario = nombre.value.trim();

    const password =
    document.getElementById("password").value.trim();

    if(usuario === "" || password === ""){
        alert("Completa todos los campos.");
        return;
    }

    const usuarioKey = usuario.toLowerCase();

    const snapshot = await get(
        child(ref(db), "usuarios/" + usuarioKey)
    );

    if(snapshot.exists()){

        const datosUsuario = snapshot.val();

        if(datosUsuario.password === password){

            localStorage.setItem("nombreUsuario", datosUsuario.nombre);

            alert("Bienvenido " + datosUsuario.nombre);

            window.location.href = "predictor.html";

        }else{

            alert("Contraseña incorrecta.");
            return;
        }

    }else{

        await set(
            ref(db, "usuarios/" + usuarioKey),
            {
                nombre: usuario,
                password: password
            }
        );

        localStorage.setItem("nombreUsuario", usuario);

        alert("Usuario creado correctamente");

        window.location.href = "predictor.html";
    }

});