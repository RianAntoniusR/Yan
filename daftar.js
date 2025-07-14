// Fungsi hashing SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Fungsi untuk format username: Kapital di awal kata
function formatUsername(input) {
    return input
        .toLowerCase()
        .split(" ")
        .filter(word => word.trim() !== "")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Format otomatis saat mengetik
document.getElementById("username").addEventListener("input", function (e) {
    const caretPos = this.selectionStart;
    const formatted = formatUsername(this.value);
    this.value = formatted;
    this.setSelectionRange(caretPos, caretPos);
});

// Tangani form pendaftaran
document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const rawInput = document.getElementById("username").value.trim();
    const username = formatUsername(rawInput);
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const hint = document.getElementById("hint").value.trim();
    const loader = document.getElementById("loader");

    const usernameRegex = /^[A-Za-z\s]{3,}$/;
    if (!usernameRegex.test(username)) {
        alert("Nama pengguna hanya boleh berisi huruf dan spasi, minimal 3 karakter.");
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

        const userData = {
            username,
            password: hashedPassword,
            hint
        };

        localStorage.setItem(`user_${username}`, JSON.stringify(userData));

        setTimeout(() => {
            loader.style.display = "none";
            alert(`Pendaftaran berhasil! Selamat datang, ${username}!`);
            window.location.href = "login.html";
        }, 1500);
    } catch (error) {
        loader.style.display = "none";
        alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
        console.error(error);
    }
});
