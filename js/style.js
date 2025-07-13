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

    // Music Toggle & Select
    const music = document.getElementById("bgmusic");
    const musicToggleBtn = document.getElementById("musicToggleBtn");
    const musicSelect = document.getElementById("musicSelect");

    if (music && musicToggleBtn && musicSelect) {
        musicSelect.addEventListener("change", () => {
            const selectedFile = musicSelect.value;
            music.src = `Lagu/${selectedFile}`;
            music.pause();
            musicToggleBtn.textContent = "Play Music";
        });

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

    // Real-Time Clock
    const clock = document.getElementById("clock");
    function updateClock() {
        if (!clock) return;
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Login Logic
    const loginForm = document.getElementById("loginForm");
    const loader = document.getElementById("loader");
    const loginButton = loginForm?.querySelector('button[type="submit"]');

    // Buat elemen hitung mundur
    const countdownEl = document.createElement("div");
    countdownEl.style.textAlign = "center";
    countdownEl.style.marginTop = "10px";
    countdownEl.style.fontWeight = "bold";
    countdownEl.style.color = "red";
    loginForm.appendChild(countdownEl);

    const adminUsername = "rian";
    const adminPassword = "admin123";

    let attempts = 0;
    const maxAttempts = 3;
    const blockDuration = 30;

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (password.length < 6) {
                alert("Password minimal 6 karakter!");
                return;
            }

            if (username === adminUsername && password === adminPassword) {
                loader.style.display = "flex";
                setTimeout(() => {
                    loader.style.display = "none";
                    alert(`Masuk berhasil, Selamat Datang ${username}`);
                    // window.location.href = "beranda.html";
                }, 2000);
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    alert(`Terlalu banyak percobaan salah. Tombol login dinonaktifkan ${blockDuration} detik.`);
                    if (loginButton) loginButton.style.display = "none";

                    let countdown = blockDuration;
                    countdownEl.textContent = `Coba lagi dalam ${countdown} detik`;

                    const interval = setInterval(() => {
                        countdown--;
                        countdownEl.textContent = `Coba lagi dalam ${countdown} detik`;

                        if (countdown <= 0) {
                            clearInterval(interval);
                            countdownEl.textContent = "";
                            if (loginButton) loginButton.style.display = "block";
                            attempts = 0;
                        }
                    }, 1000);
                } else {
                    alert(`Nama Pengguna atau Kata Sandi salah! Percobaan: ${attempts}/${maxAttempts}`);
                }
            }
        });
    }
});
