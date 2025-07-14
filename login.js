document.addEventListener("DOMContentLoaded", () => {
    // Toggle Password Visibility
    const toggleIcon = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");
    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleIcon.classList.toggle("fa-eye", !isPassword);
            toggleIcon.classList.toggle("fa-eye-slash", isPassword);
        });
    }

    // Real-Time Clock
    const clock = document.getElementById("clock");
    function updateClock() {
        if (!clock) return;
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    setInterval(updateClock, 1000);
    updateClock();
});

// Fungsi hashing SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Login logic
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loader = document.getElementById("loader");
    const loginButton = document.querySelector("button[type='submit']");
    const countdownEl = document.getElementById("countdown");

    let attempts = Number(localStorage.getItem("login_attempts")) || 0;
    const maxAttempts = 3;
    const blockDuration = 30;

    if (!username || !password) {
        alert("Harap Isi Semua Kolom.");
        return;
    }

    const storedUser = localStorage.getItem(`user_${username}`);
    if (!storedUser) {
        alert("Pengguna Tidak Ditemukan.");
        return;
    }

    loader.style.display = "flex";

    try {
        const userData = JSON.parse(storedUser);
        const hashedInputPassword = await hashPassword(password);

        setTimeout(() => {
            loader.style.display = "none";

            if (userData.password === hashedInputPassword) {
                localStorage.setItem("activeUser", username);
                localStorage.removeItem("login_attempts");
                window.location.href = "beranda.html";
            } else {
                attempts++;
                localStorage.setItem("login_attempts", attempts);

                if (attempts >= maxAttempts) {
                    alert(`Terlalu Banyak Percobaan Salah. Tombol Login Dinonaktifkan ${blockDuration} detik.`);
                    loginButton.disabled = true;

                    let countdown = blockDuration;
                    countdownEl.textContent = `Coba Lagi Dalam ${countdown} detik`;

                    const interval = setInterval(() => {
                        countdown--;
                        countdownEl.textContent = `Coba Lagi Dalam ${countdown} detik`;

                        if (countdown <= 0) {
                            clearInterval(interval);
                            countdownEl.textContent = "";
                            loginButton.disabled = false;
                            localStorage.setItem("login_attempts", 0);
                        }
                    }, 1000);
                } else {
                    alert(`Nama Pengguna atau Kata Sandi Salah! Percobaan: ${attempts}/${maxAttempts}`);
                }
            }
        }, 1000);

    } catch (err) {
        loader.style.display = "none";
        alert("Terjadi Kesalahan Saat Login.");
        console.error(err);
    }
});
