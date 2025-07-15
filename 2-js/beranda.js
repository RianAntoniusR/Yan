// Cek login
const username = localStorage.getItem("loggedInUser");
if (!username || username.trim() === "") {
    window.location.href = "index.html";
}

// Elemen HTML
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

const sheetAPI = "https://sheetdb.io/api/v1/fon8xhkttw3ou";
const sheetName = "Untuk menyimpan data keuangan";
let transaksiData = [];
let chart;
let currentMonth = new Date().toISOString().slice(0, 7);

// Set tanggal & user
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

// Kata kunci transaksi
const kataMasuk = ["gaji", "dapat", "dapet", "terima", "bonus", "masuk", "transfer", "saldo awal"];
const kataKeluar = ["beli", "bayar", "makan", "jajan", "keluar", "tagihan"];

// Format ke rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR"
    }).format(angka);
}

// Parsing input
function parseTransaksi(text) {
    const lower = text.toLowerCase();
    const isMasuk = kataMasuk.some(k => lower.includes(k));
    const isKeluar = kataKeluar.some(k => lower.includes(k));
    const match = text.match(/rp\s?([\d.]+)/i);
    const jumlah = match ? parseInt(match[1].replace(/\./g, "")) : 0;
    const jenis = isMasuk ? "Pemasukan" : isKeluar ? "Pengeluaran" : null;
    return { jenis, jumlah };
}

// Simpan transaksi
async function simpanTransaksi(catatan, jenis, jumlah) {
    try {
        const tgl = new Date().toISOString().split("T")[0];
        const id = Date.now().toString();

        const data = {
            id,
            Username: username,
            Tanggal: tgl,
            Jenis: jenis,
            Catatan: catatan,
            Jumlah: jumlah.toString()
        };

        const res = await fetch(`${sheetAPI}?sheet=${sheetName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data })
        });

        if (!res.ok) throw new Error("Gagal simpan");
        showToast("✅ Transaksi berhasil disimpan!");
        loadTransaksi();
    } catch (err) {
        console.error(err);
        showToast("❌ Gagal menyimpan transaksi");
    }
}

// Ambil transaksi
async function loadTransaksi() {
    try {
        const bulan = bulanFilter.value;
        const [tahun, bln] = bulan.split("-");

        const res = await fetch(`${sheetAPI}/search?sheet=${sheetName}&Username=${username}`);
        const data = await res.json();

        transaksiData = data.filter(item => {
            const t = new Date(item.Tanggal);
            return t.getFullYear() == tahun && (t.getMonth() + 1) == parseInt(bln);
        });

        updateUI();
    } catch (err) {
        console.error(err);
        showToast("❌ Gagal memuat data");
    }
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
        row.innerHTML = `
            <span class="tgl">${item.Tanggal}</span>
            <span class="jenis">${item.Jenis}</span>
            <span class="catatan">${item.Catatan}</span>
            <span class="jumlah">${formatRupiah(item.Jumlah)}</span>
            <span class="aksi"><button class="hapusBtn">❌</button></span>
        `;
        row.querySelector(".hapusBtn").addEventListener("click", () => hapusTransaksi(item));
        riwayatList.appendChild(row);

        if (item.Jenis === "Pemasukan") masuk += parseInt(item.Jumlah);
        if (item.Jenis === "Pengeluaran") keluar += parseInt(item.Jumlah);
    });

    totalMasuk.textContent = formatRupiah(masuk);
    totalKeluar.textContent = formatRupiah(keluar);
    const saldo = masuk - keluar;
    totalSaldo.textContent = formatRupiah(saldo);
    jumlahTransaksi.textContent = `${transaksiData.length} transaksi`;

    // Pengingat saldo rendah
    if (saldo < 50000) {
        showLowBalance();
    } else {
        hideLowBalance();
    }

    renderChart(masuk, keluar);
}

function showLowBalance() {
    if (saldoAlert) {
        saldoAlert.style.display = "block";
        saldoAlert.innerText = "⚠️ Saldo anda dibawah Rp 50.000! Menghematlah kawan.";
    }
}

function hideLowBalance() {
    if (saldoAlert) {
        saldoAlert.style.display = "none";
    }
}

// Hapus transaksi
async function hapusTransaksi(item) {
    try {
        if (!item.id) return alert("ID tidak tersedia.");
        const res = await fetch(`${sheetAPI}/id/${item.id}?sheet=${sheetName}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Gagal hapus");
        showToast("🗑️ Transaksi dihapus");
        loadTransaksi();
    } catch (err) {
        console.error(err);
        showToast("❌ Gagal menghapus transaksi");
    }
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

// Deteksi pergantian bulan otomatis
setInterval(() => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    if (nowMonth !== currentMonth) {
        currentMonth = nowMonth;
        bulanFilter.value = nowMonth;
        bulanAktif.textContent = nowMonth;
        loadTransaksi();
        showToast("📅 Bulan berganti. Data diperbarui otomatis.");
    }
}, 60 * 1000);

// Load awal
loadTransaksi();
