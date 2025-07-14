async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function formatUsername(input) {
    return input.toLowerCase().split(" ").filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

document.getElementById("username").addEventListener("input", function () {
    const caret = this.selectionStart;
    this.value = formatUsername(this.value);
    this.setSelectionRange(caret, caret);
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const rawInput = document.getElementById("username").value.trim();
    const username = formatUsername(rawInput);
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const hint = document.getElementById("hint").value.trim();
    const loader = document.getElementById("loader");

    const usernameRegex = /^[A-Za-z\s]{3,}$/;
    if (!usernameRegex.test(username)) return alert("Nama hanya boleh huruf dan spasi, minimal 3 karakter.");
    if (password.length < 6) return alert("Kata sandi minimal 6 karakter.");
    if (password !== confirmPassword) return alert("Kata sandi dan konfirmasi tidak cocok.");
    if (hint.length < 3) return alert("Hint terlalu pendek.");

    const existing = localStorage.getItem(`user_${username.toLowerCase()}`);
    if (existing) return alert("Nama sudah digunakan.");

    loader.style.display = "flex";
    try {
        const hashed = await hashPassword(password);
        const userData = { username, password: hashed, hint };
        localStorage.setItem(`user_${username.toLowerCase()}`, JSON.stringify(userData));
        setTimeout(() => {
            loader.style.display = "none";
            alert(`Pendaftaran Berhasil, ${username}`);
            window.location.href = "login.html";
        }, 1500);
    } catch (err) {
        loader.style.display = "none";
        alert("Gagal mendaftar.");
        console.error(err);
    }
});