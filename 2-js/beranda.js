// Cek login
const username = localStorage.getItem("loggedInUser");
if (!username || username.trim() === "") {
    window.location.href = "index.html";
}

// Elemen
const navbarUser = document.getElementById("navbarUser");
const tanggalSekarang = document.getElementById("tanggalSekarang");
const bulanAktif = document.getElementById("bulanAktif");
const bulanFilter = document.getElementById("bulanFilter");
const inputTransaksi = document.getElementById("inputTransaksi");
const prosesBtn = document.getElementById("prosesBtn");
const statusMsg = document.getElementById("statusMsg");
const riwayatList = document.getElementById("riwayatList");
const totalMasuk = document.getElementById("totalMasuk");
const totalKeluar = document.getElementById("totalKeluar");
const totalSaldo = document.getElementById("totalSaldo");
const jumlahTransaksi = document.getElementById("jumlahTransaksi");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");
const saldoAlert = document.getElementById("lowBalanceAlert");

let transaksiData = [];
let chart;
let currentMonth = new Date().toISOString().slice(0, 7);

// Tampilkan tanggal & user
const now = new Date();
tanggalSekarang.textContent = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
});
navbarUser.textContent = `Selamat datang, ${username}!`;
bulanFilter.min = "2025-01";
bulanFilter.value = currentMonth;
bulanAktif.textContent = currentMonth;

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});

// Toast
function showToast(pesan) {
    toast.textContent = pesan;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// Kata kunci
const kataMasuk = ["gaji", "dapat", "dapet", "terima", "bonus", "masuk", "transfer", "saldo awal"];
const kataKeluar = ["beli", "bayar", "makan", "jajan", "keluar", "tagihan"];

// Format uang
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR"
    }).format(angka);
}

// Deteksi jenis dan jumlah
function parseTransaksi(text) {
    const lower = text.toLowerCase();
    const isMasuk = kataMasuk.some(k => lower.includes(k));
    const isKeluar = kataKeluar.some(k => lower.includes(k));
    const match = text.match(/rp\s?([\d.]+)/i);
    const jumlah = match ? parseInt(match[1].replace(/\./g, "")) : 0;
    const jenis = isMasuk ? "Pemasukan" : isKeluar ? "Pengeluaran" : null;
    return { jenis, jumlah };
}

// Simpan transaksi ke localStorage
function simpanTransaksi(catatan, jenis, jumlah) {
    const tanggal = new Date().toISOString().split("T")[0];
    const waktu = new Date().toLocaleTimeString("id-ID");
    const data = {
        id: Date.now().toString(),
        username,
        Tanggal: tanggal,
        Waktu: waktu,
        Jenis: jenis,
        Catatan: catatan,
        Jumlah: jumlah
    };
    const semuaData = JSON.parse(localStorage.getItem("dataTransaksi") || "[]");
    semuaData.push(data);
    localStorage.setItem("dataTransaksi", JSON.stringify(semuaData));
    showToast("✅ Transaksi disimpan!");
    loadTransaksi();
}

// Ambil transaksi dari localStorage
function loadTransaksi() {
    const [tahun, bln] = bulanFilter.value.split("-");
    const semuaData = JSON.parse(localStorage.getItem("dataTransaksi") || "[]");
    transaksiData = semuaData
        .filter(item => item.username === username)
        .filter(item => {
            const t = new Date(item.Tanggal);
            return t.getFullYear() == tahun && (t.getMonth() + 1) == parseInt(bln);
        });
    updateUI();
}

// Tampilkan UI
function updateUI() {
    riwayatList.innerHTML = "";
    let masuk = 0, keluar = 0;

    const header = document.createElement("div");
    header.className = "transaksi-item header";
    header.innerHTML = `
        <span class="tgl">Tanggal</span>
        <span class="jenis">Jenis</span>
        <span class="catatan">Catatan</span>
        <span class="jumlah">Jumlah</span>
        <span class="aksi">Aksi</span>
    `;
    riwayatList.appendChild(header);

    [...transaksiData].reverse().forEach(item => {
        const row = document.createElement("div");
        row.className = "transaksi-item";
        const bersihCatatan = item.Catatan.replace(/rp\s?[\d.]+/gi, "").trim();

        row.innerHTML = `
            <span class="tgl">${item.Tanggal}</span>
            <span class="jenis">${item.Jenis}</span>
            <span class="catatan">${bersihCatatan}</span>
            <span class="jumlah">${formatRupiah(item.Jumlah)}</span>
            <span class="aksi"><button class="hapusBtn">❌</button></span>
        `;
        row.querySelector(".hapusBtn").addEventListener("click", () => hapusTransaksi(item.id));
        riwayatList.appendChild(row);

        if (item.Jenis === "Pemasukan") masuk += item.Jumlah;
        if (item.Jenis === "Pengeluaran") keluar += item.Jumlah;
    });

    totalMasuk.textContent = formatRupiah(masuk);
    totalKeluar.textContent = formatRupiah(keluar);
    const saldo = masuk - keluar;
    totalSaldo.textContent = formatRupiah(saldo);
    jumlahTransaksi.textContent = `${transaksiData.length} transaksi`;

    saldo < 50000 ? showLowBalance() : hideLowBalance();
    renderChart(masuk, keluar);
}

// Saldo rendah
function showLowBalance() {
    saldoAlert.style.display = "block";
    saldoAlert.innerText = "⚠️ Saldo Anda di bawah Rp 50.000!";
}
function hideLowBalance() {
    saldoAlert.style.display = "none";
}

// Hapus transaksi
function hapusTransaksi(id) {
    const semuaData = JSON.parse(localStorage.getItem("dataTransaksi") || "[]");
    const baru = semuaData.filter(item => item.id !== id);
    localStorage.setItem("dataTransaksi", JSON.stringify(baru));
    showToast("🗑️ Transaksi dihapus");
    loadTransaksi();
}

// Grafik
function renderChart(masuk, keluar) {
    const ctx = document.getElementById("chartKeuangan").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Pemasukan", "Pengeluaran"],
            datasets: [{
                data: [masuk, keluar],
                backgroundColor: ["#00ff7f", "#ff6347"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#fff" }
                }
            }
        }
    });
}

// Event
bulanFilter.addEventListener("change", () => {
    bulanAktif.textContent = bulanFilter.value;
    currentMonth = bulanFilter.value;
    loadTransaksi();
});

prosesBtn.addEventListener("click", () => {
    const input = inputTransaksi.value.trim();
    if (!input) return;
    const { jenis, jumlah } = parseTransaksi(input);
    if (!jenis || isNaN(jumlah) || jumlah <= 0) {
        statusMsg.textContent = "Format tidak dikenali. Gunakan kata kunci dan 'Rp'.";
        return;
    }
    simpanTransaksi(input, jenis, jumlah);
    inputTransaksi.value = "";
    statusMsg.textContent = "";
});

// Deteksi bulan berganti otomatis
setInterval(() => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    if (nowMonth !== currentMonth) {
        currentMonth = nowMonth;
        bulanFilter.value = nowMonth;
        bulanAktif.textContent = nowMonth;
        loadTransaksi();
        showToast("📅 Bulan berganti, data diperbarui otomatis.");
    }
}, 60000);

// Load pertama
loadTransaksi();
