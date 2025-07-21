// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Firebase Konfigurasi
const firebaseConfig = {
    apiKey: "AIzaSyD5H7rS9_ny1C4x5UrpgFjI-fRLYQLqeys",
    authDomain: "catatankeuangan-8dbc5.firebaseapp.com",
    projectId: "catatankeuangan-8dbc5",
    storageBucket: "catatankeuangan-8dbc5.firebasestorage.app",
    messagingSenderId: "196148251395",
    appId: "1:196148251395:web:279c4d4bc9753dd783b736"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Autentikasi
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        let displayName = "Pengguna";
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                displayName = data.nama;
                document.getElementById("navbarUser").textContent = `Selamat Pagi, ${displayName}!`;
            }
        } catch (error) {
            console.error("Gagal ambil user:", error);
        }
        initApp(displayName);
    } else {
        window.location.href = "index.html";
    }
});

function getSapaan() {
    const jam = new Date().getHours();
    if (jam >= 4 && jam < 11) return "Selamat Pagi";
    if (jam >= 11 && jam < 15) return "Selamat Siang";
    if (jam >= 15 && jam < 18) return "Selamat Sore";
    return "Selamat Malam";
}

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
    }).format(angka);
}

function parseTransaksi(text) {
    const kataMasuk = ["gaji", "dapat", "dapet", "terima", "bonus", "masuk", "transfer", "saldo awal", "pemasukan", "upah"];
    const kataKeluar = ["beli", "bayar", "makan", "jajan", "keluar", "tagihan", "kasih", "pengeluaran", "belanja", "pajak"];
    const lower = text.toLowerCase();
    const isMasuk = kataMasuk.some(k => lower.includes(k));
    const isKeluar = kataKeluar.some(k => lower.includes(k));
    const match = text.match(/rp\s?([\d.]+)/i);
    const jumlah = match ? parseInt(match[1].replace(/\./g, "")) : 0;
    const jenis = isMasuk ? "Pemasukan" : isKeluar ? "Pengeluaran" : null;
    return { jenis, jumlah };
}

function initApp(displayName) {
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
    const exportBtn = document.getElementById("exportBtn");

    let transaksiData = [];
    let chart;
    let currentMonth = new Date().toISOString().slice(0, 7);
    let lastDate = new Date().toISOString().slice(0, 10);

    function tampilkanWaktu() {
        const now = new Date();
        tanggalSekarang.textContent = now.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
        navbarUser.textContent = `${getSapaan()}, ${displayName}!`;
    }

    tampilkanWaktu();
    setInterval(tampilkanWaktu, 60000);

    bulanFilter.min = "2025-01";
    bulanFilter.value = currentMonth;
    bulanAktif.textContent = currentMonth;

    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });

    function showToast(pesan) {
        toast.textContent = pesan;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    async function simpanTransaksi(catatan, jenis, jumlah) {
        const tanggal = new Date().toISOString().split("T")[0];
        const waktu = new Date().toTimeString().split(" ")[0];
        const data = {
            email: displayName,
            Tanggal: tanggal,
            Waktu: waktu,
            Jenis: jenis,
            Catatan: catatan,
            Jumlah: jumlah,
            dibuat: Timestamp.now()
        };
        try {
            await addDoc(collection(db, "transaksi"), data);
            showToast("✅ Transaksi disimpan!");
            loadTransaksi();
        } catch (error) {
            console.error("❌ Gagal simpan:", error);
            showToast("❌ Gagal menyimpan data!");
        }
    }

    async function hapusTransaksi(id) {
        try {
            await deleteDoc(doc(db, "transaksi", id));
            showToast("🗑️ Transaksi dihapus");
            loadTransaksi();
        } catch (error) {
            console.error("❌ Gagal hapus:", error);
            showToast("❌ Gagal menghapus!");
        }
    }

    function showLowBalance() {
        saldoAlert.style.display = "block";
        saldoAlert.innerText = "⚠️ Saldo Anda di bawah Rp 50.000!";
    }

    function hideLowBalance() {
        saldoAlert.style.display = "none";
    }

    function renderChart() {
        const ctx = document.getElementById("chartKeuangan").getContext("2d");
        if (chart) chart.destroy();

        const labels = transaksiData.map(t => t.Tanggal);
        const dataMasuk = transaksiData.map(t => t.Jenis === "Pemasukan" ? t.Jumlah : 0);
        const dataKeluar = transaksiData.map(t => t.Jenis === "Pengeluaran" ? t.Jumlah : 0);

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    { label: "Pemasukan", data: dataMasuk, borderColor: "#00ff7f", fill: false },
                    { label: "Pengeluaran", data: dataKeluar, borderColor: "#ff6347", fill: false }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom", labels: { color: "#fff" } }
                },
                scales: {
                    x: { ticks: { color: "#fff" } },
                    y: { ticks: { color: "#fff" } }
                }
            }
        });
    }

    async function loadTransaksi() {
        const [tahun, bln] = bulanFilter.value.split("-");
        transaksiData = [];

        try {
            const q = query(collection(db, "transaksi"), where("email", "==", displayName));
            const snapshot = await getDocs(q);

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const tanggal = new Date(data.Tanggal);
                const tBulan = tanggal.getMonth() + 1;
                const tTahun = tanggal.getFullYear();
                if (parseInt(bln) === tBulan && parseInt(tahun) === tTahun) {
                    transaksiData.push({ ...data, id: docSnap.id });
                }
            });

            updateUI();
        } catch (error) {
            console.error("❌ Gagal load transaksi:", error);
            showToast("❌ Gagal ambil data!");
        }
    }

    function updateUI() {
        let masuk = 0, keluar = 0;
        riwayatList.innerHTML = "";

        transaksiData.sort((a, b) => b.dibuat?.seconds - a.dibuat?.seconds);

        transaksiData.forEach(item => {
            const template = document.getElementById("transaksiItemTemplate");
            const clone = template.content.cloneNode(true);
            clone.querySelector(".tanggal").textContent = item.Tanggal;
            clone.querySelector(".waktu").textContent = item.Waktu;
            clone.querySelector(".jenis").textContent = item.Jenis;
            clone.querySelector(".catatan").textContent = item.Catatan.replace(/\s*rp\s?[\d.]+/gi, "").trim();
            clone.querySelector(".jumlah").textContent = formatRupiah(item.Jumlah);
            clone.querySelector(".hapusBtn").addEventListener("click", () => hapusTransaksi(item.id));
            riwayatList.appendChild(clone);

            if (item.Jenis === "Pemasukan") masuk += item.Jumlah;
            else if (item.Jenis === "Pengeluaran") keluar += item.Jumlah;
        });

        const saldo = masuk - keluar;
        totalMasuk.textContent = formatRupiah(masuk);
        totalKeluar.textContent = formatRupiah(keluar);
        totalSaldo.textContent = formatRupiah(saldo);
        jumlahTransaksi.textContent = `${transaksiData.length} transaksi`;

        saldo < 50000 ? showLowBalance() : hideLowBalance();
        renderChart();
    }

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

    setInterval(() => {
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const nowMonth = now.toISOString().slice(0, 7);

        if (nowMonth !== currentMonth) {
            currentMonth = nowMonth;
            bulanFilter.value = nowMonth;
            bulanAktif.textContent = nowMonth;
            loadTransaksi();
            showToast("📅 Bulan berganti, data diperbarui otomatis.");
        }

        if (today !== lastDate) {
            lastDate = today;
            loadTransaksi();
            showToast("📅 Hari berganti, data diperbarui otomatis.");
        }
    }, 60000);

    exportBtn.addEventListener("click", () => {
        if (transaksiData.length === 0) {
            showToast("⚠️ Tidak ada data untuk bulan ini.");
            return;
        }

        const [tahun, bulan] = bulanFilter.value.split("-");
        const formatTanggal = (isoDate) => {
            const [y, m, d] = isoDate.split("-");
            return `${d}/${m}/${y}`;
        };

        const header = "Tanggal,Waktu,Jenis,Catatan,Jumlah";
        const rows = transaksiData.map(d =>
            `"${formatTanggal(d.Tanggal)}","${d.Waktu}","${d.Jenis}","${d.Catatan.replace(/"/g, '""')}","${d.Jumlah}"`
        );

        const csvContent = [header, ...rows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `keuangan_${displayName.replace(/[@.]/g, "_")}_${tahun}_${bulan.padStart(2, "0")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    loadTransaksi();
}
