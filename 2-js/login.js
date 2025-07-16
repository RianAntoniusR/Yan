// Firebase Modern SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// Konfigurasi Firebase kamu
const firebaseConfig = {
    apiKey: "AIzaSyD5H7rS9_ny1C4x5UrpgFjI-fRLYQLqeys",
    authDomain: "catatankeuangan-8dbc5.firebaseapp.com",
    projectId: "catatankeuangan-8dbc5",
    storageBucket: "catatankeuangan-8dbc5.appspot.com",
    messagingSenderId: "196148251395",
    appId: "1:196148251395:web:279c4d4bc9753dd783b736"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elemen
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const loader = document.getElementById("loader");
const infoMsg = document.getElementById("infoMsg");

let attempts = 0;
let isLocked = false;

// Toggle password
togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
});

// Fungsi handle gagal login
function handleWrong(msg) {
    attempts++;
    infoMsg.style.color = "red";
    infoMsg.textContent = `${msg} (${attempts}/3)`;

    if (attempts >= 3) {
        isLocked = true;
        loginBtn.style.display = "none";
        infoMsg.textContent = "Terlalu banyak percobaan. Coba lagi dalam 30 detik.";

        setTimeout(() => {
            isLocked = false;
            attempts = 0;
            loginBtn.style.display = "block";
            infoMsg.textContent = "";
        }, 30000);
    }
}

// Proses Login
loginBtn.addEventListener("click", async () => {
    if (isLocked) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        infoMsg.style.color = "red";
        infoMsg.textContent = "Silakan isi email dan password.";
        return;
    }

    infoMsg.textContent = "";
    loader.style.display = "block";
    loginBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loader.style.display = "none";
        loginBtn.disabled = false;
        infoMsg.style.color = "green";
        infoMsg.textContent = `Login berhasil. Selamat datang!`;

        localStorage.setItem("loggedInUser", email);

        setTimeout(() => {
            window.location.href = "beranda.html";
        }, 1500);
    } catch (error) {
        loader.style.display = "none";
        loginBtn.disabled = false;

        if (error.code === "auth/user-not-found") {
            handleWrong("Email tidak ditemukan.");
        } else if (error.code === "auth/wrong-password") {
            handleWrong("Password salah.");
        } else {
            infoMsg.style.color = "red";
            infoMsg.textContent = error.message;
        }
    }
});
