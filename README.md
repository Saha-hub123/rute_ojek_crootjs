# 🛵 Visualisasi Rute Ojek Online Rp10.000 (Leaflet, GeoJSON & CrootJS)

> **Proyek WebGIS Sistem Informasi Geografis (SIG) — Murni Client-Side & Tanpa Database Server**  
> Dibuat oleh: **Mohammad Isa** (NPM: **714240013**)  
> Program Studi D4 Teknik Informatika — **Universitas Logistik dan Bisnis Internasional (ULBI)** Bandung  
> GitHub: [@Saha-hub123](https://github.com/Saha-hub123)

---

## 📌 Ringkasan Proyek

Proyek ini adalah implementasi praktis Sistem Informasi Geografis (SIG) interaktif untuk memvisualisasikan **Rute Ojek Online Promo Rp10.000** bagi mahasiswa di sekitar kawasan **Kampus ULBI (Sarijadi, Bandung)**. 

Aplikasi ini dibangun murni menggunakan teknologi web modern berbobot ringan:
- **Leaflet.js** untuk render peta interaktif OpenStreetMap, polyline rute, dan marker kustom.
- **GeoJSON** untuk merepresentasikan data spasial rute (`LineString`), driver & titik penjemputan (`Point`), serta zona operasional (`Polygon`).
- **Croot.js (JSCroot)** sebagai pustaka helper modular Vanilla ES6 via CDN untuk manipulasi DOM deklaratif dan pengambilan data.
- **100% Client-Side**: Tanpa database server eksternal, tanpa dependensi node_modules, dan siap dijalankan langsung di browser atau dideploy ke GitHub Pages!

---

## 📁 Struktur Berkas

```
rute_ojek_crootjs/
├── index.html                     # Halaman WebGIS Utama (Leaflet & UI CrootJS)
├── style.css                      # Desain Responsif, Glassmorphic & Rapi (No Overflow)
├── app.js                         # Logika Aplikasi (ES Module Leaflet + CrootJS)
├── MEDIUM_ARTICLE.md              # 📄 Naskah Lengkap Siap Publish ke Medium
├── README.md                      # Dokumentasi Proyek
└── data/
    └── rute_ojek_bandung.geojson  # Dataset Geospasial Lengkap (18 Fitur)
```

---

## ✨ Fitur-Fitur Utama

1. **Visualisasi Peta Interaktif (Leaflet.js)**:
   - Tile OpenStreetMap berpusat di **Kampus ULBI Bandung** (`[-6.873691, 107.575541]`).
   - Garis rute ojek promo Rp10.000 dengan efek highlight seleksi dan auto-zoom.
   - Marker custom driver motor 🛵 dan titik penjemputan/tujuan.
   - Poligon batas wilayah jangkauan promo flat Rp10.000.

2. **Filter Spasial Driver & Rute (CrootJS)**:
   - **Filter Radius Driver**: Menghitung jarak driver terdekat ke Kampus ULBI dengan rumus Haversine, lengkap dengan visualisasi lingkaran buffer radius (300m - 3.500m).
   - **Filter Zona Promo**: Memfilter rute yang berada di dalam kawasan operasional promo.

3. **Floating Order Summary Card**:
   - Menghitung jarak tempuh rute (km), estimasi durasi (menit), penetapan driver, dan tarif promo tetap **Rp 10.000 FLAT**.
   - Dilengkapi tombol minimize (`−` / `+`) agar tampilan peta tetap leluasa di layar laptop/HP.
   - Tombol pesan interaktif dengan pop-up modal konfirmasi.

4. **GeoJSON Spatial Inspector & Table**:
   - Konsol visualizer yang menampilkan informasi teknis fitur spasial aktif secara live.
   - Tabel dinamis yang memuat seluruh 18 fitur GeoJSON.

---

## 🚀 Panduan Menjalankan

Karena tidak memerlukan database server maupun backend, aplikasi dapat langsung dijalankan:

### Opsi 1: VS Code Live Server (Direkomendasikan)
1. Buka folder `rute_ojek_crootjs` di Visual Studio Code.
2. Klik kanan file `index.html` > pilih **Open with Live Server**.
3. Browser akan otomatis terbuka pada `http://127.0.0.1:5500`.

### Opsi 2: Node.js `npx serve`
```bash
npx serve .
```

### Opsi 3: Publikasi ke GitHub Pages
Proyek ini siap di-host secara gratis di GitHub Pages:
1. `git init && git add . && git commit -m "feat: webgis rute ojek leaflet crootjs"`
2. Push ke repositori GitHub Anda.
3. Di tab **Settings** > **Pages**, pilih Branch `main` dan folder `/(root)`.
4. Website langsung online dan bisa diakses publik!

---

## 📝 Naskah Artikel Medium

Artikel teknis lengkap dengan format markdown yang siap disalin dan dipublikasikan ke Medium tersedia pada:  
👉 **[`MEDIUM_ARTICLE.md`](./MEDIUM_ARTICLE.md)**

---
*Dibuat untuk praktikum Sistem Informasi Geografis (SIG) — ULBI 2026.*