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
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Konfigurasi Firebase
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

onAuthStateChanged(auth, user => {
    if (user) {
        const email = user.email;
        initApp(email);
    } else {
        window.location.href = "index.html";
    }
});

function initApp(email) {
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

    function getSapaan() {
        const jam = new Date().getHours();
        if (jam >= 4 && jam < 11) return "Selamat pagi";
        if (jam >= 11 && jam < 15) return "Selamat siang";
        if (jam >= 15 && jam < 18) return "Selamat sore";
        return "Selamat malam";
    }

    function tampilkanWaktu() {
        const now = new Date();
        tanggalSekarang.textContent = now.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
        navbarUser.textContent = `${getSapaan()}, ${email}!`;
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

    const kataMasuk = ["gaji", "dapat", "dapet", "terima", "bonus", "masuk", "transfer", "saldo awal"];
    const kataKeluar = ["beli", "bayar", "makan", "jajan", "keluar", "tagihan"];

    function formatRupiah(angka) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR"
        }).format(angka);
    }

    function parseTransaksi(text) {
        const lower = text.toLowerCase();
        const isMasuk = kataMasuk.some(k => lower.includes(k));
        const isKeluar = kataKeluar.some(k => lower.includes(k));
        const match = text.match(/rp\s?([\d.]+)/i);
        const jumlah = match ? parseInt(match[1].replace(/\./g, "")) : 0;
        const jenis = isMasuk ? "Pemasukan" : isKeluar ? "Pengeluaran" : null;
        return { jenis, jumlah };
    }

    async function simpanTransaksi(catatan, jenis, jumlah) {
        const tanggal = new Date().toISOString().split("T")[0];
        const waktu = new Date().toTimeString().split(" ")[0];
        const data = {
            email,
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
            console.error("❌ Gagal menyimpan:", error);
            showToast("❌ Gagal menyimpan ke database!");
        }
    }

    async function loadTransaksi() {
        const [tahun, bln] = bulanFilter.value.split("-");
        transaksiData = [];

        try {
            const q = query(collection(db, "transaksi"), where("email", "==", email));
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
            console.error("❌ Gagal memuat data:", error);
            showToast("❌ Gagal mengambil data!");
        }
    }

    async function hapusTransaksi(id) {
        try {
            await deleteDoc(doc(db, "transaksi", id));
            showToast("🗑️ Transaksi dihapus");
            loadTransaksi();
        } catch (error) {
            console.error("❌ Gagal hapus:", error);
            showToast("❌ Gagal menghapus data!");
        }
    }

    function showLowBalance() {
        saldoAlert.style.display = "block";
        saldoAlert.innerText = "⚠️ Saldo Anda di bawah Rp 50.000!";
    }

    function hideLowBalance() {
        saldoAlert.style.display = "none";
    }

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
        const nowMonth = new Date().toISOString().slice(0, 7);
        if (nowMonth !== currentMonth) {
            currentMonth = nowMonth;
            bulanFilter.value = nowMonth;
            bulanAktif.textContent = nowMonth;
            loadTransaksi();
            showToast("📅 Bulan berganti, data diperbarui otomatis.");
        }
    }, 60000);

    function updateUI() {
        let masuk = 0, keluar = 0;
        riwayatList.innerHTML = "";

        transaksiData.sort((a, b) => {
            if (a.dibuat && b.dibuat) {
                return b.dibuat.seconds - a.dibuat.seconds;
            }
            return new Date(b.Tanggal + "T" + b.Waktu) - new Date(a.Tanggal + "T" + a.Waktu);
        });

        transaksiData.forEach(item => {
            const template = document.getElementById("transaksiItemTemplate");
            const clone = template.content.cloneNode(true);
            clone.querySelector(".tanggal").textContent = `${item.Tanggal}`;
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
        renderChart(masuk, keluar);
    }

    // ✅ Fitur ekspor CSV per bulan dan per akun dengan tanggal
    exportBtn.addEventListener("click", async () => {
        try {
            const [tahun, bulan] = bulanFilter.value.split("-");
            const q = query(collection(db, "transaksi"), where("email", "==", email));
            const snapshot = await getDocs(q);

            const dataCSV = [];

            snapshot.forEach(doc => {
                const d = doc.data();
                if (!d.Tanggal) return;
                const tanggal = new Date(d.Tanggal);
                const tBulan = tanggal.getMonth() + 1;
                const tTahun = tanggal.getFullYear();

                if (parseInt(bulan) === tBulan && parseInt(tahun) === tTahun) {
                    dataCSV.push({
                        Tanggal: d.Tanggal,
                        Waktu: d.Waktu || "",
                        Jenis: d.Jenis || "",
                        Catatan: d.Catatan || "",
                        Jumlah: d.Jumlah || 0
                    });
                }
            });

            if (dataCSV.length === 0) {
                showToast("⚠️ Tidak ada data untuk bulan ini.");
                return;
            }

            const header = "Tanggal,Waktu,Jenis,Catatan,Jumlah";
            const rows = dataCSV.map(d =>
                `"${d.Tanggal}","${d.Waktu}","${d.Jenis}","${d.Catatan.replace(/"/g, '""')}","${d.Jumlah}"`
            );
            const csvContent = [header, ...rows].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `keuangan_${email.replace(/[@.]/g, "_")}_${tahun}_${bulan.padStart(2, "0")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("❌ Gagal ekspor data:", error);
            showToast("❌ Gagal ekspor ke CSV.");
        }
    });

    loadTransaksi();
}
