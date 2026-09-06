# m-hadir 📱

> **Aplikasi Web Presensi Kelas Cepat, Fleksibel, & Offline-First untuk Ketua Kelas (KM / Koordinator Kelas)**  
> Dibangun dengan **Vue 3 + TypeScript + Tailwind CSS (PWA, Client-Side Tanpa Backend)**.

---

## 🌟 Fitur Unggulan

### 1. ⚡ 100% Offline-First (PWA Tanpa Backend)
- **Tanpa server / database luar**: Seluruh data tersimpan aman di `LocalStorage` browser perangkat pengguna.
- Tetap dapat digunakan saat ruangan kuliah minim sinyal atau tidak ada koneksi internet.
- **PWA (Progressive Web App)**: Bisa diinstal di homescreen smartphone (Android & iOS) dan dibuka layaknya aplikasi native tanpa address bar browser.

### 2. 📋 Input Data Massal via JSON (`{ } JSON`)
- Ingin memasukkan seluruh jadwal semester atau seluruh mahasiswa sekaligus? Cukup salin & tempel struktur JSON ke modal `{ } JSON`.
- **Dukungan Format Fleksibel**:
  - Format objek: `{ "courses": [...], "students": [...] }`
  - Format array matkul: `[ { "name": "...", "code": "...", "className": "...", "lecturer": "...", "time": "..." } ]`
  - Format array mahasiswa: `[ { "nim": "...", "name": "..." } ]`
- Tersedia opsi **Append** (tambah data baru tanpa menimpa data lama) dan **Reset / Gantikan Semua**.
- Tombol cepat `{ } JSON` tersedia di tab **Mata Kuliah**, tab **Mahasiswa**, dan menu **Pengaturan**.

### 3. 🎯 Manajemen Mahasiswa Revisi / Mengulang yang Terpadu
- Mendukung mahasiswa lintas angkatan / revisi yang hanya mengambil mata kuliah tertentu.
- **Dua Cara Pengaturan yang Tersinkronisasi**:
  - **Dari Tab Mahasiswa**: Atur lingkup matkul mahasiswa menjadi *"Hanya Matkul Tertentu (Revisi)"* dengan mencentang matkul yang diambil.
  - **Dari Tab Matkul**: Tambahkan langsung lewat tombol `+ Tambah Revisi` pada kartu mata kuliah yang bersangkutan.
- Kartu matkul otomatis menampilkan jumlah dan chip nama mahasiswa revisi (`Mahasiswa Revisi: X Orang`).
- Di layar presensi, mahasiswa reguler otomatis berlaku untuk semua matkul, sedangkan mahasiswa revisi hanya muncul di matkul yang dipilih (lengkap dengan badge ungu `Revisi`).

### 4. 📊 Smart Paste dari Excel / Spreadsheet
- Cukup salin dua kolom (**NIM** dan **Nama**) dari file Excel, Google Sheets, atau portal kampus (`Ctrl + C`), lalu klik **Paste Excel**.
- Algoritma Smart Paste otomatis mendeteksi baris, memisahkan NIM dan Nama, membersihkan spasi berlebih, serta mencegah duplikasi data.

### 5. 🟢 Kehadiran Cepat (H / I / S / A)
- Tombol sentuh 4 status:
  - **H**: Hadir (Hijau)
  - **I**: Izin (Kuning / Oranye)
  - **S**: Sakit (Biru)
  - **A**: Alpa / Tanpa Keterangan (Merah)
- Tombol **"Semua Hadir"**: Tandai seluruh kelas hadir dalam 1 ketukan, sehingga KM hanya perlu mengubah 1 atau 2 orang yang berhalangan.
- Fitur pencarian instan berdasarkan nama atau NIM, serta filter tab status (Hadir/Izin/Sakit/Alpa).

### 6. 💬 Generator Laporan WhatsApp 1-Klik
- Menghasilkan format pesan teks WhatsApp yang rapi dan siap dikirim ke Dosen Pengampu atau Grup Kelas.
- Pilihan ringkasan:
  - **Hanya yang Tidak Masuk (Izin/Sakit/Alpa)** *(Mode paling sering digunakan oleh KM)*
  - **Hanya Mahasiswa Hadir**
  - **Rekap Lengkap Seluruh Kelas**
- Tombol **Salin Teks** dan tombol langsung **Buka WhatsApp**.

### 7. 💾 Cadangan & Pemulihan Data (Backup & Restore)
- Ekspor seluruh database kelas, jadwal matkul, dan riwayat presensi ke file `.json`.
- Impor kembali kapan saja saat berpindah perangkat atau browser.

---

## 🛠️ Format JSON Input Massal

Contoh format JSON lengkap yang dapat langsung di-paste pada menu `{ } JSON`:

```json
{
  "courses": [
    {
      "name": "PEMROGRAMAN BERORIENTASI OBYEK (JAVA I)",
      "code": "22SIF0103",
      "className": "03SIFE003",
      "lecturer": "ABDURRAHMAN HARITS, S.Kom., M.Kom.",
      "time": "Sabtu, 07.40 - 09.20"
    },
    {
      "name": "ANALISA PROSES BISNIS",
      "code": "22SIF0112",
      "className": "03SIFE003",
      "lecturer": "FINGKI MARWATI, S.Kom., M.Kom.",
      "time": "Sabtu, 13.50 - 15.30"
    }
  ],
  "students": [
    { "nim": "251011700001", "name": "Ahmad Fauzi" },
    { "nim": "251011700002", "name": "Annisa Putri" },
    {
      "nim": "211011750082",
      "name": "Muhammad Rizal (Mahasiswa Revisi)",
      "courseNames": ["PEMROGRAMAN BERORIENTASI OBYEK (JAVA I)"]
    }
  ]
}
```

---

## 🚀 Menjalankan Secara Lokal

Pastikan telah menginstal **Node.js** (versi 18 ke atas disarankan).

```bash
# 1. Clone repository
git clone https://github.com/vigarp/m-hadir.git
cd m-hadir

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Jalankan unit test (Vitest)
npm test

# 5. Build untuk production
npm run build

# 6. Preview hasil build
npm run preview
```

---

## 🌐 Panduan Deploy ke Vercel

Aplikasi ini 100% statis (SPA), sehingga sangat cocok dan gratis di-deploy ke **Vercel**:

1. Push repository ini ke akun GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com/) dan pilih **Add New Project**.
3. Import repository `m-hadir`.
4. Pengaturan Framework Preset: **Vite** (otomatis terdeteksi).
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik **Deploy**.

### Menghubungkan Custom Domain (Contoh: `m-hadir.vigarp.id`)
1. Di project Vercel, buka tab **Settings** > **Domains**.
2. Masukkan subdomain Anda: `m-hadir.vigarp.id` lalu klik **Add**.
3. Masuk ke dashboard DNS penyedia domain Anda (Cloudflare / Niagahoster / Rumahweb / dsb.), lalu tambahkan CNAME Record:
   - **Type**: `CNAME`
   - **Name**: `m-hadir`
   - **Target / Value**: `cname.vercel-dns.com`
4. Tunggu beberapa saat hingga verifikasi DNS dan SSL di Vercel selesai (berstatus *Valid Configuration*).

---

## 📲 Cara Instalasi di HP (PWA)

### Android (Google Chrome)
1. Buka aplikasi di Google Chrome.
2. Ketuk tombol **"Instal Aplikasi"** pada pop-up bawaan atau ketuk menu titik tiga (⋮) di kanan atas.
3. Pilih **"Tambahkan ke Layar Utama"** / **"Install app"**.

### iPhone / iPad (Safari)
1. Buka aplikasi di browser Safari.
2. Ketuk ikon **Share** (kotak dengan panah ke atas) di bilah bawah.
3. Gulir ke bawah dan pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.

---

## 🧱 Tech Stack
- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Bundler**: [Vite](https://vite.dev/)

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Silakan gunakan dan sesuaikan untuk kebutuhan kelas masing-masing.

