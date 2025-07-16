// Firebase config (ganti dengan milikmu)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5H7rS9_ny1C4x5UrpgFjI-fRLYQLqeys",
    authDomain: "catatankeuangan-8dbc5.firebaseapp.com",
    projectId: "catatankeuangan-8dbc5",
    storageBucket: "catatankeuangan-8dbc5.firebasestorage.app",
    messagingSenderId: "196148251395",
    appId: "1:196148251395:web:279c4d4bc9753dd783b736"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const daftarForm = document.getElementById("daftarForm");
const namaInput = document.getElementById("nama");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const pesanStatus = document.getElementById("pesanStatus");

daftarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nama = namaInput.value.trim();
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    const konfirmasi = confirmInput.value.trim();

    if (pass !== konfirmasi) {
        tampilkanStatus("❗ Password dan konfirmasi tidak sama", "red");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Simpan nama panggilan ke Firestore
        await setDoc(doc(db, "users", user.uid), {
            nama: nama,
            email: email,
            createdAt: new Date().toISOString()
        });

        tampilkanStatus("✅ Pendaftaran berhasil! Silakan login.", "green");
        daftarForm.reset();

        // Redirect ke halaman login setelah berhasil daftar
        window.location.href = "index.html";
    } catch (err) {
        tampilkanStatus("❗ " + err.message, "red");
    }
});

function tampilkanStatus(pesan, warna) {
    pesanStatus.textContent = pesan;
    pesanStatus.style.color = warna;
}

// Toggle mata
document.querySelectorAll(".toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
        const input = toggle.previousElementSibling;
        const isVisible = input.type === "text";
        input.type = isVisible ? "password" : "text";
        toggle.classList.toggle("active");
    });
});
