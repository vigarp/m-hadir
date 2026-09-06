# m-hadir 📱

> **Aplikasi Web Presensi Kelas Cepat & Offline untuk Ketua Kelas (KM)**  
> Dibuat dengan **Vue 3 + TypeScript + Tailwind CSS (PWA, Tanpa Backend)**.

---

## 🌟 Fitur Utama

1. **100% Offline-First (PWA & Tanpa Backend)**
   - Tidak butuh sinyal WiFi kampus maupun kuota seluler.
   - Semua data tersimpan aman di penyimpanan lokal perangkat (`LocalStorage`).
   - Dapat diinstal di layar utama smartphone (Android & iPhone) seperti aplikasi native tanpa address bar browser.

2. **Smart Paste dari Excel (Super Cepat)**
   - Tidak perlu repot input satu per satu. Cukup blok kolom **NIM** dan kolom **Nama** di Excel, tekan `Ctrl + C`, lalu paste di aplikasi.
   - Format tab dan baris akan otomatis di-parse menjadi daftar mahasiswa.

3. **Status Kehadiran Lengkap (H / I / S / A)**
   - **H**: Hadir (Hijau)
   - **I**: Izin (Kuning)
   - **S**: Sakit (Biru)
   - **A**: Alpa / Tidak Hadir (Merah)
   - Tombol **"Semua Hadir"** untuk menandai seluruh kelas hadir dalam 1 ketukan, sehingga KM cukup menandai 1 atau 2 orang yang berhalangan saja.

4. **Dukungan Mahasiswa Revisi / Mengulang**
   - Setiap mata kuliah bisa memiliki mahasiswa tambahan/revisi tersendiri di luar roster kelas utama.
   - Diberi penanda lencana `[Revisi]` yang jelas di layar dan di laporan.

5. **Generator Format WhatsApp 1-Klik**
   - Buat format teks WhatsApp siap kirim ke Dosen / Grup Kelas.
   - Pilihan: **Hanya Mahasiswa Tidak Masuk (Izin/Sakit/Alpa)**, **Hanya Mahasiswa Hadir**, atau **Rekap Lengkap**.
   - Opsi sertakan NIM, ringkasan jumlah, dan tombol salin / langsung buka WhatsApp.

6. **Cadangan Data (Backup & Restore)**
   - Ekspor dan impor seluruh data kelas dan riwayat presensi ke file `.json` agar data tidak pernah hilang saat ganti perangkat atau ganti browser.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan di Mode Development
```bash
npm run dev
```
Akses di browser: `http://localhost:5173`

### 2. Build untuk Production
```bash
npm run build
```
Output siap deploy berada di folder `dist/`.

### 3. Preview Hasil Build
```bash
npm run preview
```

---

## 📲 Cara Install di HP (PWA)

### Android (Google Chrome):
1. Buka URL aplikasi di Google Chrome.
2. Ketuk ikon menu titik tiga (⋮) di pojok kanan atas.
3. Pilih **"Tambahkan ke Layar Utama"** atau **"Instal Aplikasi"**.

### iPhone (Safari):
1. Buka URL aplikasi di Safari.
2. Ketuk tombol **Share** (ikon kotak dengan panah ke atas) di bagian bawah.
3. Gulir ke bawah dan pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.

