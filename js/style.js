document.addEventListener("DOMContentLoaded", () => {
    // 👁️ Toggle Password Visibility
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

    // 🎵 Music Toggle
    const music = document.getElementById("bgmusic");
    const musicToggleBtn = document.getElementById("musicToggleBtn");

    if (music && musicToggleBtn) {
        musicToggleBtn.addEventListener("click", () => {
            if (music.paused) {
                music.play()
                    .then(() => {
                        musicToggleBtn.textContent = "Pause Music";
                    })
                    .catch((err) => {
                        console.error("Autoplay failed:", err);
                        alert("Klik layar dulu untuk mengaktifkan musik.");
                    });
            } else {
                music.pause();
                musicToggleBtn.textContent = "Play Music";
            }
        });
    }

    // 🔐 Login Logic
    const loginForm = document.getElementById("loginForm");
    const loader = document.getElementById("loader");
    const adminUsername = "admin";
    const adminPassword = "goblok";

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (password.length < 6) {
                alert("Password Minimal 6 Karakter Dongo!!!");
                return;
            }

            loader.style.display = "flex";

            setTimeout(() => {
                loader.style.display = "none";

                if (username === adminUsername && password === adminPassword) {
                    alert("Login berhasil, Selamat Datang");
                    // window.location.href = "home.html";
                } else {
                    alert("Salah Dongo!!!");
                }
            }, 2000);
        });
    }

    // 🕒 Real-Time Clock
    const clock = document.getElementById("clock");

    function updateClock() {
        if (!clock) return;

        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        clock.textContent = now.toLocaleTimeString('id-ID', options);
    }

    setInterval(updateClock, 1000);
    updateClock();
});
