document.addEventListener("DOMContentLoaded", () => {
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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const loader = document.getElementById("loader");
    const loginButton = document.querySelector("button[type='submit']");

    const countdownEl = document.createElement("div");
    countdownEl.style.textAlign = "center";
    countdownEl.style.marginTop = "10px";
    countdownEl.style.fontWeight = "bold";
    countdownEl.style.color = "red";
    loginForm.appendChild(countdownEl);

    let attempts = Number(localStorage.getItem("login_attempts")) || 0;
    const maxAttempts = 3;
    const blockDuration = 30;

    if (!username || !password) {
        alert("Harap isi semua kolom.");
        return;
    }

    const storedUser = localStorage.getItem(`user_${username}`);
    if (!storedUser) {
        alert("Pengguna tidak ditemukan.");
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
                alert(`Selamat datang kembali, ${username}!`);
                window.location.href = "beranda.html";
            } else {
                attempts++;
                localStorage.setItem("login_attempts", attempts);

                if (attempts >= maxAttempts) {
                    alert(`Terlalu banyak percobaan salah. Tombol login dinonaktifkan ${blockDuration} detik.`);
                    if (loginButton) loginButton.disabled = true;

                    let countdown = blockDuration;
                    countdownEl.textContent = `Coba lagi dalam ${countdown} detik`;

                    const interval = setInterval(() => {
                        countdown--;
                        countdownEl.textContent = `Coba lagi dalam ${countdown} detik`;

                        if (countdown <= 0) {
                            clearInterval(interval);
                            countdownEl.textContent = "";
                            if (loginButton) loginButton.disabled = false;
                            localStorage.setItem("login_attempts", 0);
                            attempts = 0;
                        }
                    }, 1000);
                } else {
                    alert(`Nama Pengguna atau Kata Sandi salah! Percobaan: ${attempts}/${maxAttempts}`);
                }
            }
        }, 1000);

    } catch (err) {
        loader.style.display = "none";
        alert("Terjadi kesalahan saat login.");
        console.error(err);
    }
});
