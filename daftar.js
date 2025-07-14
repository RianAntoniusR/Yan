// Fungsi hashing SHA-256 untuk password
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const hint = document.getElementById("hint").value.trim();
    const loader = document.getElementById("loader");

    if (!username || !password || !confirmPassword || !hint) {
        alert("Semua kolom harus diisi.");
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(username)) {
        alert("Nama pengguna hanya boleh huruf/angka/garis bawah (3–16 karakter).");
        return;
    }

    if (password.length < 6) {
        alert("Kata sandi minimal 6 karakter.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Kata sandi dan konfirmasi tidak cocok.");
        return;
    }

    if (hint.length < 3) {
        alert("Hint terlalu pendek. Minimal 3 karakter.");
        return;
    }

    const existingUser = localStorage.getItem(`user_${username}`);
    if (existingUser) {
        alert("Nama pengguna sudah digunakan. Silakan pilih yang lain.");
        return;
    }

    loader.style.display = "flex";

    try {
        const hashedPassword = await hashPassword(password);
        const userData = { username, password: hashedPassword, hint };
        localStorage.setItem(`user_${username}`, JSON.stringify(userData));

        setTimeout(() => {
            loader.style.display = "none";
            alert(`Pendaftaran berhasil! Selamat datang, ${username}!`);
            window.location.href = "login.html";
        }, 1500);
    } catch (error) {
        loader.style.display = "none";
        alert("Terjadi kesalahan saat mendaftar.");
        console.error(error);
    }
});