document.addEventListener("DOMContentLoaded", () => {
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

    // Login Nama Saja
    const loginForm = document.getElementById("loginForm");
    const loader = document.getElementById("loader");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();

            if (username === "") {
                alert("Nama tidak boleh kosong!");
                return;
            }

            loader.style.display = "flex";

            // Kirim ke Google Sheets (via Google Apps Script Web App)
            fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
                method: "POST",
                body: JSON.stringify({ nama: username }),
                headers: { "Content-Type": "application/json" }
            })
                .then(res => res.json())
                .then(data => {
                    loader.style.display = "none";
                    alert("Selamat datang, " + username);
                    // window.location.href = "beranda.html"; // Jika ingin diarahkan
                })
                .catch(err => {
                    loader.style.display = "none";
                    console.error(err);
                    alert("Gagal mengirim data.");
                });
        });
    }
});
