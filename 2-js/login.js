// Elemen penting
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const loader = document.getElementById('loader');
const infoMsg = document.getElementById('infoMsg');

let attempts = 0;
let isLocked = false;

// Toggle password 👁️
togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

// Penanganan salah login
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

// Proses login (Firebase Auth)
loginBtn.addEventListener('click', async () => {
    if (isLocked) return;

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        infoMsg.style.color = "red";
        infoMsg.textContent = "Silakan isi username dan password.";
        return;
    }

    infoMsg.textContent = "";
    loader.style.display = "block";
    loginBtn.disabled = true;

    const email = `${username}@rian.com`; // email dari username

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        loader.style.display = "none";
        loginBtn.disabled = false;
        infoMsg.style.color = "green";
        infoMsg.textContent = `Login berhasil. Selamat datang, ${username}!`;

        // Simpan user (opsional)
        localStorage.setItem("loggedInUser", username);

        setTimeout(() => {
            window.location.href = "beranda.html";
        }, 1500);
    } catch (error) {
        loader.style.display = "none";
        loginBtn.disabled = false;

        if (error.code === 'auth/user-not-found') {
            handleWrong("Username tidak ditemukan.");
        } else if (error.code === 'auth/wrong-password') {
            handleWrong("Password salah.");
        } else {
            infoMsg.style.color = "red";
            infoMsg.textContent = error.message;
        }
    }
});

// Proses daftar akun (Firebase Auth)
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        infoMsg.style.color = "red";
        infoMsg.textContent = "Silakan isi username dan password.";
        return;
    }

    const email = `${username}@rian.com`;

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        infoMsg.style.color = "green";
        infoMsg.textContent = "✅ Akun berhasil dibuat! Silakan login.";
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            infoMsg.style.color = "red";
            infoMsg.textContent = "Username sudah terdaftar.";
        } else {
            infoMsg.style.color = "red";
            infoMsg.textContent = error.message;
        }
    }
});
