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
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();

            if (username === "") {
                alert("Nama tidak boleh kosong!");
                return;
            }

            loader.style.display = "flex";

            try {
                // Ambil lokasi kota
                const res = await fetch("https://ipapi.co/json");
                const locationData = await res.json();
                const kota = locationData.city || "Tidak diketahui";
                const waktu = new Date().toLocaleString("id-ID");

                // Kirim ke Google Sheets Web App
                await fetch("https://script.google.com/macros/s/AKfycbyS2xL5Quv0i-aoFV923tlp9Ui8ls8n_ruUAjmIQ8YJiPtVYTyYpUazEWxRHgQg7UN6kA/exec", {
                    method: "POST",
                    body: JSON.stringify({ nama: username, kota, waktu }),
                    headers: { "Content-Type": "application/json" }
                })
                    .then(res => res.text())
                    .then(response => {
                        console.log("Respon dari server:", response);
                    })
                    .catch(err => {
                        console.error("Error kirim:", err);
                    });

                loader.style.display = "none";
                alert(`Selamat datang, ${username}!`);
                // window.location.href = "beranda.html"; // opsional redirect
            } catch (err) {
                loader.style.display = "none";
                console.error(err);
                alert("Gagal mengirim data.");
            }
        });
    }
});