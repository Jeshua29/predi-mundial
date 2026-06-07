import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyBxeDnOeYGQvBeOqIuvZH8JOw7FiA6AD1k",

    authDomain: "mundial-predi.firebaseapp.com",

    databaseURL: "https://mundial-predi-default-rtdb.firebaseio.com",

    projectId: "mundial-predi",

    storageBucket: "mundial-predi.firebasestorage.app",

    messagingSenderId: "1079800384507",

    appId: "1:1079800384507:web:3ea737d7c19b62699a195e"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { db };