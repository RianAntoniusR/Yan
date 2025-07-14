document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("activeUser");
    const display = document.getElementById("usernameDisplay");

    // Jika belum login, alihkan ke halaman login
    if (!username) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "index.html";
        return;
    }

    // Tampilkan nama pengguna
    display.textContent = username.charAt(0).toUpperCase() + username.slice(1);

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("activeUser");
        alert("Anda telah logout.");
        window.location.href = "index.html";
    });
});
