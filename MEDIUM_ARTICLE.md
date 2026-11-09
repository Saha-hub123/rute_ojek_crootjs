# Judul: Visualisasi Rute Ojek Online Rp10.000 Menggunakan Leaflet, GeoJSON, dan Croot.js

> **Studi Kasus Pemetaan Jalur Promo Mahasiswa, Filter Spasial Radius Driver, dan Implementasi WebGIS Modern Tanpa Database**
> 
> *Penulis: **Mohammad Isa** (NPM: **714240013**) — Universitas Logistik dan Bisnis Internasional (ULBI)*  
> *Kategori: Sistem Informasi Geografis (SIG), Leaflet.js, GeoJSON, Croot.js, Web Development*

---

![Banner Visualisasi Peta Rute Ojek Rp10.000](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80)
*Gambar: Ilustrasi visualisasi data geospasial dan rute mobilitas transportasi online modern.*

---

## 🛵 1. Latar Belakang: Studi Kasus Tarif Ojek Flat Rp10.000

Bagi mahasiswa, transportasi ojek online adalah pilihan utama untuk bepergian dari kampus ke kosan, stasiun kereta, minimarket, maupun pusat perbelanjaan. Di kawasan **Kampus ULBI (Universitas Logistik dan Bisnis Internasional)** Sarijadi, Bandung, sering kali terdapat skenario perjalanan jarak pendek (radius 1–3.5 km) dengan penawaran tarif ekonomis khusus mahasiswa: **Tarif Promo Flat Rp 10.000**.

Dalam pembuatan aplikasi Sistem Informasi Geografis (SIG) berbasis web, sering muncul anggapan bahwa kita harus selalu memasang basis data spasial yang berat (*database server* seperti PostgreSQL/PostGIS atau MongoDB) hanya untuk memetakan rute dan menghitung jarak. Padahal, untuk studi kasus webgis interaktif, kita dapat memanfaatkan kekuatan format terbuka **GeoJSON**, pustaka pemetaan **Leaflet.js**, dan modul JavaScript ringan **Croot.js** (`crootjs/lib`).

Dengan pendekatan ini:
- ⚡ **Tanpa Database Server**: Tidak perlu instalasi database lokal atau konfigurasi port yang rumit.
- 🚀 **Super Ringan & Cepat**: Berjalan langsung di peramban (*client-side*) menggunakan ES6 Modules.
- 🌐 **Mudah Di-deploy**: Cukup diunggah ke **GitHub Pages** atau dijalankan via **Live Server**.

---

## 🛠️ 2. Komponen Utama Teknologi

| Komponen | Peran dalam Aplikasi | Keunggulan |
| :--- | :--- | :--- |
| **GeoJSON** | Format Data Geospasial Standar | Menyimpan titik jemput/tujuan (*Point*), garis jalur jalan (*LineString*), dan batas wilayah promo (*Polygon*) dalam satu berkas terstruktur. |
| **Leaflet.js** | Engine Peta Web Interaktif | Pustaka pemetaan open-source yang sangat populer, ringan (~42 KB), dan mudah dikustomisasi dengan custom marker serta popup. |
| **Croot.js** | Pustaka Helper DOM & Modular ES6 | Menyediakan fungsi deklaratif untuk manipulasi DOM (`onClick`, `onChange`, `getValue`, `setInnerText`, `container`) dan pengambilan data (`getJSON`) via CDN resmi. |

```
+-------------------------------------------------------------+
|                      ARSITEKTUR APLIKASI                    |
+-------------------------------------------------------------+
|  [ File Spasial: rute_ojek_bandung.geojson ]                |
|       - LineString (6 Rute Ojek Promo Rp10.000)             |
|       - Point (Driver Aktif & Titik POI Jemput/Antar)       |
|       - Polygon (Zona Wilayah Promo Flat Rp10.000)          |
|                         │                                   |
|                         ▼                                   |
|  [ CrootJS Data Engine: getJSON & DOM Helpers ]             |
|       - Memuat data GeoJSON secara asinkron                 |
|       - Menghubungkan dropdown rute & slider radius         |
|                         │                                   |
|                         ▼                                   |
|  [ Leaflet.js Mapping Visualizer ]                          |
|       - Render Polyline Jalur Ojek & Efek Hover             |
|       - Marker Kustom Driver Motor 🛵 & Titik Kampus ULBI   |
|       - Buffer Radius Pencarian Driver (Haversine Formula)  |
|                         │                                   |
|                         ▼                                   |
|  [ UI Interaktif: Floating Order Card & Tabel Fitur ]       |
|       - Ringkasan tarif promo Rp10.000 & estimasi waktu     |
|       - Modal konfirmasi pemesanan interaktif               |
+-------------------------------------------------------------+
```

---

## 📍 3. Merancang Data Spasial GeoJSON

Data spasial disimpan dalam berkas `data/rute_ojek_bandung.geojson`. Format GeoJSON (RFC 7946) mendukung berbagai jenis geometri dalam satu `FeatureCollection`:

### A. Geometri `LineString` (Lintasan Rute Ojek Promo Rp10.000)
Garis rute menghubungkan koordinat jalan dari Kampus ULBI menuju tujuan (contoh: Mall Paris Van Java):

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [107.575541, -6.873691], // Titik Awal: Kampus ULBI
      [107.576200, -6.874500],
      [107.580200, -6.880500],
      [107.589000, -6.886500],
      [107.596100, -6.889400]  // Titik Akhir: Mall Paris Van Java (PVJ)
    ]
  },
  "properties": {
    "id": "RUTE-01",
    "name": "Rute Kampus ULBI - Paris Van Java (PVJ)",
    "kategori": "Rute Ojek",
    "tarif": 10000,
    "jarak_km": 3.2,
    "estimasi_menit": 10,
    "titik_jemput": "Gerbang Utama Kampus ULBI Bandung",
    "titik_tujuan": "Lobby Utama Mall Paris Van Java (PVJ)",
    "jalur_jalan": "Jl. Sari Asih -> Jl. Surya Sumantri -> Jl. Sukajadi",
    "driver_rekomendasi": "Kang Asep Saepudin (D 4521 SAH)"
  }
}
```

### B. Geometri `Point` (Posisi Driver Ojek Online)
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [107.575800, -6.873900]
  },
  "properties": {
    "id": "DRV-001",
    "name": "Kang Asep Saepudin",
    "kategori": "Driver Ojek",
    "kendaraan": "Honda Vario 160 Hitam",
    "plat_nomor": "D 4521 SAH",
    "rating": 4.95,
    "status": "Tersedia"
  }
}
```

### C. Geometri `Polygon` (Zona Operasional Promo Flat Rp10.000)
Poligon ini mencakup wilayah Sarijadi, Sukajadi, Pasteur, Polban, dan Cimindi:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [107.555000, -6.865000],
        [107.605000, -6.865000],
        [107.605000, -6.905000],
        [107.555000, -6.905000],
        [107.555000, -6.865000]
      ]
    ]
  },
  "properties": {
    "name": "Zona Promo Ojek Online Flat Rp10.000",
    "tarif_flat": 10000,
    "max_jarak_km": 4.0
  }
}
```

---

## 💻 4. Implementasi Logika Aplikasi (`app.js`)

Dengan memanfaatkan modul **CrootJS** dari CDN jsDelivr, kita mengimpor helper DOM dan pemanggilan data JSON:

```javascript
import { 
  onClick, 
  onChange, 
  getValue, 
  setInnerText, 
  container 
} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/element.min.js";

import { 
  getJSON 
} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/api.min.js";
```

### 1. Inisialisasi Peta Leaflet Berpusat di Kampus ULBI
```javascript
const ULBI_COORDS = [-6.873691, 107.575541]; // [lat, lng]
const map = L.map("map").setView(ULBI_COORDS, 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap | ULBI Bandung'
}).addTo(map);

// Layer Group untuk mengorganisasi fitur
const routeLayerGroup = L.layerGroup().addTo(map);
const driverLayerGroup = L.layerGroup().addTo(map);
const zoneLayerGroup = L.layerGroup().addTo(map);
const bufferLayerGroup = L.layerGroup().addTo(map);
```

### 2. Memuat Data GeoJSON dengan `getJSON` CrootJS
```javascript
function loadDefaultData() {
  getJSON("./data/rute_ojek_bandung.geojson", (data) => {
    if (data && data.features) {
      renderGeoJSONToMap(data);
      renderTable(data);
    }
  });
}
```

### 3. Filter Spasial Radius Driver (Kalkulasi Haversine Formula)
Tanpa membutuhkan server database, kita dapat melakukan filter jarak driver secara instan menggunakan rumus matematika trigonometri bola bumi (*Haversine Formula*):

```javascript
function filterNearbyDrivers(maxDistanceMeters) {
  bufferLayerGroup.clearLayers();

  // 1. Gambar lingkaran buffer radius di atas peta
  const circle = L.circle(ULBI_COORDS, {
    radius: maxDistanceMeters,
    color: "#059669",
    weight: 2,
    dashArray: "4, 4",
    fillColor: "#10b981",
    fillOpacity: 0.15
  }).addTo(bufferLayerGroup);

  map.fitBounds(circle.getBounds(), { padding: [25, 25] });

  // 2. Filter driver yang berjarak <= maxDistanceMeters
  driverLayerGroup.eachLayer((marker) => {
    const pos = marker.getLatLng();
    const distMeter = calculateDistance(ULBI_COORDS[0], ULBI_COORDS[1], pos.lat, pos.lng) * 1000;
    
    if (distMeter <= maxDistanceMeters) {
      marker.setOpacity(1.0); // Tampilkan driver aktif
    } else {
      marker.setOpacity(0.25); // Redupkan driver di luar radius
    }
  });
}

// Rumus Haversine dalam satuan kilometer
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
```

### 4. Interaktivitas Seleksi Rute & Pembaruan UI
Ketika pengguna memilih rute pada elemen dropdown:
```javascript
onChange("route-select", () => {
  const selectedId = getValue("route-select");

  routeLayerGroup.eachLayer((layer) => {
    if (layer.featureProperties?.id === selectedId) {
      layer.setStyle({ color: "#059669", weight: 7, opacity: 1.0 });
      map.fitBounds(layer.getBounds(), { padding: [35, 35] });

      // Perbarui Floating Order Card via CrootJS
      setInnerText("order-route-name", layer.featureProperties.name);
      setInnerText("order-distance", `${layer.featureProperties.jarak_km} km`);
      setInnerText("order-time", `~${layer.featureProperties.estimasi_menit} mnt`);
      setInnerText("driver-assigned", layer.featureProperties.driver_rekomendasi);
    } else {
      layer.setStyle({ color: "#cbd5e1", weight: 3, opacity: 0.45 });
    }
  });
});
```

---

## 🎨 5. Tampilan dan Fitur Unggulan Antarmuka

1. **Floating Order Summary Card**:
   - Menampilkan tarif promo tetap **Rp 10.000**, jarak tempuh, estimasi waktu perjalanan, dan driver yang ditugaskan.
   - Dilengkapi tombol minimize (`−` / `+`) agar peta tetap leluasa saat pengguna ingin mengeksplorasi rute.
2. **Filter Spasial Interaktif**:
   - Mengatur radius jangkauan penjemputan (misal 500m hingga 3.500m) menggunakan slider dinamis.
   - Menggambar lingkaran buffer radius secara visual di atas peta.
3. **GeoJSON Spatial Inspector**:
   - Area konsol live yang menampilkan koordinat rute aktif, nama jalan yang dilintasi, dan status kalkulasi jarak driver.
4. **Data Table Geospasial**:
   - Tabel dinamis yang menyajikan daftar 18 fitur GeoJSON lengkap dengan tombol klik untuk mengarahkan peta ke koordinat objek.

---

## 🚀 6. Cara Menjalankan Proyek

Karena proyek ini 100% berbasis file statis murni, Anda dapat menjalankannya langsung tanpa instalasi software server:

### Opsi A: Live Server di VS Code (Paling Mudah)
1. Buka folder proyek di VS Code.
2. Klik kanan pada file `index.html` > pilih **Open with Live Server**.
3. Peta akan otomatis terbuka di browser pada `http://127.0.0.1:5500`.

### Opsi B: Publikasi ke GitHub Pages
1. Push proyek ke repositori GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: visualisasi rute ojek rp10000 leaflet crootjs"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git push -u origin main
   ```
2. Di GitHub, buka menu **Settings** > **Pages** > pilih Branch **main** / root.
3. Website WebGIS langsung dapat diakses online oleh siapa pun di seluruh dunia!

---

## 📊 7. Kesimpulan

Membangun aplikasi WebGIS interaktif yang fungsional dan estetis tidak selalu memerlukan arsitektur basis data yang rumit. Dengan memadukan format standar **GeoJSON**, keandalan pemetaan **Leaflet.js**, dan kesederhanaan **Croot.js**, kita dapat menciptakan aplikasi simulasi rute ojek online promo Rp10.000 yang:
- **Nol Konfigurasi Server**: Siap dijalankan di komputer mana pun tanpa kendala koneksi database.
- **Performa Tinggi**: Waktu muat awal instan dan mulus saat digeser maupun diperbesar.
- **Ramah Pembelajaran**: Kode bersih, modular, dan mudah dipahami oleh mahasiswa maupun pengembang pemula.

Semoga artikel dan tutorial ini bermanfaat bagi rekan-rekan yang sedang mempelajari Sistem Informasi Geografis dan teknologi pemetaan web! 🚀

---

## 👨‍💻 Profil Penulis

* **Penulis:** Mohammad Isa  
* **NPM:** 714240013  
* **Program Studi:** D4 Teknik Informatika / Sistem Informasi Geografis (SIG)  
* **Institusi:** Universitas Logistik dan Bisnis Internasional (ULBI) Bandung  
* **GitHub:** [@Saha-hub123](https://github.com/Saha-hub123)

---
*Jika tulisan ini bermanfaat, silakan berikan Clap 👏 dan bagikan ke teman-teman Anda!*