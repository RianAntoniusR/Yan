// Ambil elemen penting
const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const loader = document.getElementById('loader');
const infoMsg = document.getElementById('infoMsg');

let attempts = 0;
let isLocked = false;

// Fungsi toggle password 👁️
togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

// Fungsi hash SHA-256
async function hashPassword(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fungsi saat salah login
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

// Fungsi login utama
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

    const hashedPassword = await hashPassword(password);
    const apiUrl = `https://sheetdb.io/api/v1/fon8xhkttw3ou/search?Username=${encodeURIComponent(username)}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("HTTP Error");
            return response.json();
        })
        .then(data => {
            loader.style.display = "none";
            loginBtn.disabled = false;

            if (data.length === 0) {
                handleWrong("Username tidak ditemukan.");
                return;
            }

            const user = data[0];

            // Periksa kecocokan hash
            if (user.Password_hash === hashedPassword) {
                infoMsg.style.color = "green";
                infoMsg.textContent = `Login berhasil. Selamat datang, ${username}!`;

                localStorage.setItem("loggedInUser", username);
                setTimeout(() => {
                    window.location.href = "beranda.html";
                }, 1500);
            } else {
                handleWrong("Password salah.");
            }
        })
        .catch(err => {
            loader.style.display = "none";
            loginBtn.disabled = false;
            infoMsg.style.color = "red";
            infoMsg.textContent = "Terjadi kesalahan saat menghubungi server.";
            console.error("Login error:", err);
        });
});
