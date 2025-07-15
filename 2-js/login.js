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

// Hash SHA-256
async function hashPassword(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Buat akun admin default jika belum ada
async function initAdminAccount() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExist = users.some(u => u.username === "admin");

    if (!adminExist) {
        const hash = await hashPassword("admin123");
        users.push({ username: "admin", passwordHash: hash });
        localStorage.setItem("users", JSON.stringify(users));
    }
}
initAdminAccount();

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

// Proses login
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

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username);
    const hashedPassword = await hashPassword(password);

    setTimeout(() => {
        loader.style.display = "none";
        loginBtn.disabled = false;

        if (!user) {
            handleWrong("Username tidak ditemukan.");
            return;
        }

        if (user.passwordHash === hashedPassword) {
            infoMsg.style.color = "green";
            infoMsg.textContent = `Login berhasil. Selamat datang, ${username}!`;
            localStorage.setItem("loggedInUser", username);

            setTimeout(() => {
                window.location.href = "beranda.html";
            }, 1500);
        } else {
            handleWrong("Password salah.");
        }
    }, 1000);
});

// Proses daftar akun
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        infoMsg.style.color = "red";
        infoMsg.textContent = "Silakan isi username dan password.";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find(u => u.username === username);

    if (exists) {
        infoMsg.style.color = "red";
        infoMsg.textContent = "Username sudah terdaftar.";
        return;
    }

    const hash = await hashPassword(password);
    users.push({ username, passwordHash: hash });
    localStorage.setItem("users", JSON.stringify(users));
    infoMsg.style.color = "green";
    infoMsg.textContent = "✅ Akun berhasil dibuat! Silakan login.";
});
