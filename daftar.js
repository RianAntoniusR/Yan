// Fungsi hashing SHA-256
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

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const loader = document.getElementById("loader");

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
                alert(`Selamat datang kembali, ${username}!`);
                localStorage.setItem("activeUser", username); // Simpan sesi login
                window.location.href = "beranda.html"; // Halaman utama setelah login
            } else {
                alert("Kata sandi salah.");
            }
        }, 1000);

    } catch (err) {
        loader.style.display = "none";
        alert("Terjadi kesalahan saat login.");
        console.error(err);
    }
});
