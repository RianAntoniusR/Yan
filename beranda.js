document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("activeUser");
    const userDisplay = document.getElementById("activeUser");

    if (!username) {
        alert("Anda harus login terlebih dahulu.");
        window.location.href = "index.html"; // kembali ke login
        return;
    }

    // Tampilkan nama pengguna
    userDisplay.textContent = username;

    // Tombol logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("activeUser");
        alert("Anda telah keluar.");
        window.location.href = "index.html";
    });
});
