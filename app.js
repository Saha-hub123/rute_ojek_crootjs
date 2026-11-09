/**
 * Visualisasi Rute Ojek Online Rp10.000
 * Leaflet.js + GeoJSON + Filter Spasial CrootJS (Murni Client-Side / Tanpa Database)
 * Author: Mohammad Isa (NPM: 714240013) - ULBI
 */

// Import fungsi modul CrootJS dari CDN resmi jsDelivr
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

// State Global Aplikasi
let map;
let geojsonData = null;
let routeLayerGroup;
let driverLayerGroup;
let poiLayerGroup;
let zoneLayerGroup;
let bufferLayerGroup;
let activePolyline = null;
let isCardCollapsed = false;

// Koordinat Referensi: Kampus ULBI Bandung
const ULBI_COORDS = [-6.873691, 107.575541]; // [lat, lng] format Leaflet

// Inisialisasi saat DOM Siap
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  setupEventListeners();
  loadDefaultData();
});

/**
 * 1. Inisialisasi Peta Leaflet
 */
function initMap() {
  map = L.map("map", {
    center: ULBI_COORDS,
    zoom: 14,
    zoomControl: true
  });

  // Tile Layer OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | ULBI Bandung'
  }).addTo(map);

  // Inisialisasi Layer Groups
  routeLayerGroup = L.layerGroup().addTo(map);
  driverLayerGroup = L.layerGroup().addTo(map);
  poiLayerGroup = L.layerGroup().addTo(map);
  zoneLayerGroup = L.layerGroup().addTo(map);
  bufferLayerGroup = L.layerGroup().addTo(map);

  // Marker Utama Kampus ULBI (Pusat Layanan Mahasiswa)
  const ulbiIcon = L.divIcon({
    className: "custom-ulbi-icon",
    html: "🏛️",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  L.marker(ULBI_COORDS, { icon: ulbiIcon })
    .addTo(map)
    .bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px;">
        <strong style="color: #e11d48;">🏛️ Kampus ULBI Bandung</strong><br>
        <em>Universitas Logistik dan Bisnis Internasional</em><br>
        <span style="font-size: 11px; color: #64748b;">Pusat Titik Jemput Mahasiswa Sarijadi</span>
      </div>
    `);

  // Event Klik pada Peta untuk Inspeksi Koordinat
  map.on("click", (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    const distToUlbi = calculateDistance(ULBI_COORDS[0], ULBI_COORDS[1], e.latlng.lat, e.latlng.lng).toFixed(2);
    const inPromoZone = distToUlbi <= 4.0;

    const infoText = `Lat: ${lat}, Lng: ${lng} | Jarak ke ULBI: ${distToUlbi} km | Status: ${inPromoZone ? '✅ Masuk Zona Flat Rp10.000' : '⚠️ Di Luar Zona Promo'}`;
    setInnerText("click-coords", infoText);
  });
}

/**
 * 2. Setup Event Listeners dengan Helper CrootJS
 */
function setupEventListeners() {
  // Tombol aksi rute
  onClick("btn-show-route", handleSelectRoute);
  onClick("btn-reset-view", resetMapView);
  onChange("route-select", handleSelectRoute);

  // Filter Spasial
  onClick("btn-exec-query", executeSpatialFilter);
  onChange("radius-range", updateRadiusDisplay);
  onChange("query-type", handleQueryTypeChange);

  // Checkbox toggle layer
  onChange("layer-routes", toggleLayers);
  onChange("layer-drivers", toggleLayers);
  onChange("layer-poi", toggleLayers);
  onChange("layer-zone", toggleLayers);

  // Muat Data dari URL atau File Lokal
  onClick("btn-load-url", loadFromURL);
  onChange("file-input", loadFromFile);

  // Tombol Order & Modal & Minimize Card
  onClick("btn-order-now", openOrderModal);
  onClick("btn-close-modal", closeOrderModal);
  onClick("btn-copy-query", copySpatialInfo);
  onClick("btn-toggle-card", toggleOrderCard);
}

/**
 * 3. Memuat Data GeoJSON Default
 */
function loadDefaultData() {
  setInnerText("status", "Memuat data GeoJSON...");
  const defaultUrl = getValue("geojson-url") || "./data/rute_ojek_bandung.geojson";

  getJSON(defaultUrl, (response) => {
    if (response && response.features) {
      geojsonData = response;
      renderGeoJSONToMap(geojsonData);
      renderTable(geojsonData);
      setInnerText("status", `Sukses memuat ${geojsonData.features.length} fitur dari GeoJSON.`);
      updateSpatialInfoDisplay("near", 1000);
      handleSelectRoute();
    } else {
      // Fallback native fetch jika CrootJS getJSON butuh fallback
      fetch(defaultUrl)
        .then((res) => res.json())
        .then((data) => {
          geojsonData = data;
          renderGeoJSONToMap(geojsonData);
          renderTable(geojsonData);
          setInnerText("status", `Sukses memuat ${geojsonData.features.length} fitur dari GeoJSON.`);
          updateSpatialInfoDisplay("near", 1000);
          handleSelectRoute();
        })
        .catch((err) => {
          setInnerText("status", `Gagal memuat GeoJSON: ${err.message}`);
        });
    }
  });
}

/**
 * 4. Memuat GeoJSON dari URL Kustom
 */
function loadFromURL() {
  const url = getValue("geojson-url");
  if (!url) return;
  setInnerText("status", "Memuat dari URL...");
  
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      geojsonData = data;
      renderGeoJSONToMap(geojsonData);
      renderTable(geojsonData);
      setInnerText("status", `Berhasil memuat ${data.features.length} fitur dari URL.`);
    })
    .catch((err) => {
      setInnerText("status", `Error: ${err.message}`);
    });
}

/**
 * 5. Memuat GeoJSON dari File Lokal
 */
function loadFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && data.features) {
        geojsonData = data;
        renderGeoJSONToMap(geojsonData);
        renderTable(geojsonData);
        setInnerText("status", `Berhasil memuat ${data.features.length} fitur dari file ${file.name}.`);
      } else {
        setInnerText("status", "Format file tidak valid (bukan FeatureCollection).");
      }
    } catch (err) {
      setInnerText("status", `File JSON rusak: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * 6. Render Fitur GeoJSON ke Lapisan Peta Leaflet
 */
function renderGeoJSONToMap(geojson) {
  routeLayerGroup.clearLayers();
  driverLayerGroup.clearLayers();
  poiLayerGroup.clearLayers();
  zoneLayerGroup.clearLayers();
  bufferLayerGroup.clearLayers();

  let routeCount = 0;

  // 1. Render Poligon Zona Promo Rp10.000 (Layer Bawah)
  geojson.features.forEach((feature) => {
    const { geometry, properties } = feature;
    if (!geometry) return;

    if (geometry.type === "Polygon") {
      const polygonCoords = geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
      const polygonLayer = L.polygon(polygonCoords, {
        color: "#f59e0b",
        weight: 2,
        dashArray: "6, 6",
        fillColor: "#fef3c7",
        fillOpacity: 0.22
      });

      polygonLayer.bindPopup(`
        <div style="font-family: sans-serif;">
          <h4 style="color: #b45309; margin-bottom: 4px;">🟡 ${properties.name}</h4>
          <p style="font-size: 12px; margin: 4px 0;"><strong>Tarif Promo:</strong> Rp ${properties.tarif_flat ? properties.tarif_flat.toLocaleString('id-ID') : '10.000'}</p>
          <p style="font-size: 12px; margin: 4px 0;"><strong>Radius Maksimal:</strong> ${properties.max_jarak_km || '4.0'} km</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 6px;">${properties.deskripsi || ''}</p>
        </div>
      `);
      zoneLayerGroup.addLayer(polygonLayer);
    }
  });

  // 2. Render LineString (Rute Ojek)
  geojson.features.forEach((feature) => {
    const { geometry, properties } = feature;
    if (!geometry) return;

    if (geometry.type === "LineString") {
      routeCount++;
      const latlngs = geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const polyline = L.polyline(latlngs, {
        color: "#e11d48",
        weight: 5,
        opacity: 0.85,
        smoothFactor: 1
      });

      polyline.featureProperties = properties;

      polyline.bindPopup(`
        <div style="font-family: sans-serif; min-width: 190px;">
          <span style="background: #fef2f2; color: #991b1b; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${properties.id}</span>
          <h4 style="margin: 6px 0 4px; color: #0f172a; font-size: 13px;">${properties.name}</h4>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <div><strong>Tarif Promo:</strong> <span style="color: #059669; font-weight: bold;">Rp ${properties.tarif ? properties.tarif.toLocaleString('id-ID') : '10.000'}</span></div>
            <div><strong>Jarak:</strong> ${properties.jarak_km} km (~${properties.estimasi_menit} menit)</div>
          </div>
          <div style="font-size: 11px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            Driver: ${properties.driver_rekomendasi}
          </div>
        </div>
      `);

      polyline.on("mouseover", () => {
        polyline.setStyle({ weight: 7, color: "#059669" });
      });
      polyline.on("mouseout", () => {
        if (polyline !== activePolyline) {
          polyline.setStyle({ weight: 5, color: "#e11d48" });
        }
      });

      polyline.on("click", () => {
        highlightRoute(polyline, properties);
      });

      routeLayerGroup.addLayer(polyline);
    }
  });

  // 3. Render Points (Driver Ojek & Titik POI)
  geojson.features.forEach((feature) => {
    const { geometry, properties } = feature;
    if (!geometry || geometry.type !== "Point") return;

    const latlng = [geometry.coordinates[1], geometry.coordinates[0]];

    if (properties.kategori === "Driver Ojek") {
      const driverIcon = L.divIcon({
        className: "custom-driver-icon",
        html: "🛵",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13]
      });

      const marker = L.marker(latlng, { icon: driverIcon });
      marker.driverProperties = properties;
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 170px;">
          <span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">DRIVER OJEK ONLINE</span>
          <h4 style="margin: 5px 0 2px; color: #0f172a; font-size: 13px;">${properties.name}</h4>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">${properties.kendaraan}</p>
          <p style="font-size: 11px; margin: 2px 0;"><strong>Plat:</strong> ${properties.plat_nomor} • ⭐ ${properties.rating}</p>
          <p style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 4px;">Status: ${properties.status}</p>
        </div>
      `);
      driverLayerGroup.addLayer(marker);
    } else {
      const isPickup = properties.kategori === "Titik Penjemputan";
      const poiIcon = L.divIcon({
        className: "custom-poi-icon",
        html: isPickup ? "📍" : "🏁",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker(latlng, { icon: poiIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <span style="background: #dbeafe; color: #1e40af; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${properties.kategori}</span>
          <h4 style="margin: 5px 0 3px; font-size: 13px;">${properties.name}</h4>
          <p style="font-size: 11px; color: #475569;">${properties.deskripsi || ''}</p>
        </div>
      `);
      poiLayerGroup.addLayer(marker);
    }
  });

  setInnerText("route-count", `${routeCount} Rute`);
  setInnerText("feature-count", `${geojson.features.length} Fitur`);
}

/**
 * 7. Highlight dan Pilih Rute Spesifik
 */
function handleSelectRoute() {
  const selectedRouteId = getValue("route-select");
  if (!geojsonData) return;

  if (selectedRouteId === "ALL") {
    resetMapView();
    return;
  }

  const targetFeature = geojsonData.features.find(f => f.properties && f.properties.id === selectedRouteId);
  if (!targetFeature) return;

  routeLayerGroup.eachLayer((layer) => {
    if (layer.featureProperties && layer.featureProperties.id === selectedRouteId) {
      highlightRoute(layer, targetFeature.properties);
    } else {
      layer.setStyle({ color: "#cbd5e1", weight: 3, opacity: 0.45 });
    }
  });
}

function highlightRoute(polyline, properties) {
  if (activePolyline) {
    activePolyline.setStyle({ color: "#e11d48", weight: 5, opacity: 0.85 });
  }

  activePolyline = polyline;
  polyline.setStyle({ color: "#059669", weight: 7, opacity: 1.0 });
  polyline.bringToFront();

  map.fitBounds(polyline.getBounds(), { padding: [35, 35] });

  // Update Floating Order Card
  setInnerText("order-route-name", properties.name);
  setInnerText("order-distance", `${properties.jarak_km} km`);
  setInnerText("order-time", `~${properties.estimasi_menit} mnt`);
  setInnerText("driver-assigned", properties.driver_rekomendasi || "Kang Asep Saepudin");
  setInnerText("driver-vehicle", `Tarif Promo Flat Rp 10.000 • Terverifikasi`);
  setInnerText("order-status", "Rute Siap!");

  setInnerText("click-coords", `Rute Terpilih: ${properties.name} (${properties.jarak_km} km via ${properties.jalur_jalan || 'Jalan Raya'})`);
  updateSpatialInfoDisplay("route", properties);
}

/**
 * 8. Reset Tampilan Peta
 */
function resetMapView() {
  bufferLayerGroup.clearLayers();
  routeLayerGroup.eachLayer((layer) => {
    layer.setStyle({ color: "#e11d48", weight: 5, opacity: 0.85 });
  });
  activePolyline = null;
  map.setView(ULBI_COORDS, 14);
  setInnerText("click-coords", "Tampilan peta di-reset ke Kampus ULBI Bandung.");
  updateSpatialInfoDisplay("all");
}

/**
 * 9. Filter Spasial Ojek (CrootJS Client-Side Spatial Engine)
 */
function executeSpatialFilter() {
  const queryType = getValue("query-type");
  const maxDistance = parseInt(getValue("radius-range"), 10) || 1000;

  bufferLayerGroup.clearLayers();

  if (queryType === "near") {
    // Lingkaran visual buffer radius pencarian
    const radiusCircle = L.circle(ULBI_COORDS, {
      radius: maxDistance,
      color: "#059669",
      weight: 2,
      dashArray: "4, 4",
      fillColor: "#10b981",
      fillOpacity: 0.14
    });

    radiusCircle.bindTooltip(`Radius: ${maxDistance} m`, { permanent: true, direction: "center" });
    bufferLayerGroup.addLayer(radiusCircle);
    map.fitBounds(radiusCircle.getBounds(), { padding: [25, 25] });

    // Hitung driver yang masuk dalam radius menggunakan rumus Haversine
    let matchedDrivers = [];
    driverLayerGroup.eachLayer((marker) => {
      const latlng = marker.getLatLng();
      const distMeter = calculateDistance(ULBI_COORDS[0], ULBI_COORDS[1], latlng.lat, latlng.lng) * 1000;
      if (distMeter <= maxDistance) {
        matchedDrivers.push({
          name: marker.driverProperties?.name || "Driver",
          dist: Math.round(distMeter),
          motor: marker.driverProperties?.kendaraan || "Motor"
        });
        marker.setOpacity(1.0);
      } else {
        marker.setOpacity(0.3); // Redupkan driver di luar radius
      }
    });

    setInnerText("click-coords", `Filter Radius: Ditemukan ${matchedDrivers.length} driver dalam radius ${maxDistance}m dari ULBI.`);
    updateSpatialInfoDisplay("near", { distance: maxDistance, drivers: matchedDrivers });

  } else if (queryType === "within") {
    // Tampilkan semua driver yang berada di dalam zona promo
    driverLayerGroup.eachLayer(m => m.setOpacity(1.0));
    map.setView(ULBI_COORDS, 13);
    setInnerText("click-coords", "Filter Zona: Menampilkan semua rute & driver yang berada dalam Zona Promo Rp10.000.");
    updateSpatialInfoDisplay("within");

  } else {
    // Tampilkan semua
    driverLayerGroup.eachLayer(m => m.setOpacity(1.0));
    resetMapView();
  }
}

function handleQueryTypeChange() {
  const queryType = getValue("query-type");
  const radiusGroup = container("radius-group");
  if (queryType === "near") {
    radiusGroup.style.display = "block";
  } else {
    radiusGroup.style.display = "none";
  }
}

/**
 * 10. Update Tampilan GeoJSON Spatial Inspector Console
 */
function updateSpatialInfoDisplay(type, data) {
  let logText = "";

  if (type === "near") {
    const dist = data?.distance || 1000;
    const list = data?.drivers || [];
    logText = `// ⚡ [CrootJS Spatial Filter] Radius Driver Terdekat
Pusat Penjemputan : Kampus ULBI [-6.873691, 107.575541]
Radius Buffer     : ${dist} meter (${(dist/1000).toFixed(1)} km)
Driver Terdeteksi : ${list.length} Driver Aktif

Hasil Kalkulasi Haversine:
${list.map((d, i) => `[${i+1}] ${d.name} (${d.motor}) -> Jarak: ${d.dist} meter`).join('\n') || 'Menunggu kalkulasi...'}`;

  } else if (type === "within") {
    logText = `// 📍 [CrootJS Spatial Filter] Zona Operasional Promo Rp10.000
Geometri Area    : Polygon (5 Titik Cincin Tertutup)
Batas Wilayah    : Sarijadi - Sukajadi - Pasteur - Ciwaruga - Cimindi
Tarif Promo      : Flat Rp 10.000 (Maksimal 4.0 km)
Status Cakupan   : Seluruh 6 Rute Ojek Promo Mahasiswa Masuk Batas Area.`;

  } else if (type === "route") {
    logText = `// 🛵 [CrootJS Feature Inspector] Rute Terpilih
ID Rute          : ${data.id}
Nama Jalur       : ${data.name}
Jarak / Durasi   : ${data.jarak_km} km (~${data.estimasi_menit} menit)
Titik Jemput     : ${data.titik_jemput}
Titik Tujuan     : ${data.titik_tujuan}
Driver Tugas     : ${data.driver_rekomendasi}
Tarif Final      : Rp ${data.tarif ? data.tarif.toLocaleString('id-ID') : '10.000'} (Promo Mahasiswa)`;

  } else {
    logText = `// 🌐 [CrootJS GeoJSON Status]
Pusat Peta       : Kampus ULBI Sarijadi [-6.873691, 107.575541]
Total Fitur      : ${geojsonData ? geojsonData.features.length : 18} Fitur Spasial
Format Data      : GeoJSON RFC 7946 (Point, LineString, Polygon)
Engine Pemetaan  : Leaflet.js + CrootJS ES6 Modules`;
  }

  setInnerText("mongo-query-code", logText);
}

function updateRadiusDisplay() {
  const val = getValue("radius-range");
  setInnerText("radius-val", `${val} m`);
}

/**
 * 11. Toggle Layer Peta
 */
function toggleLayers() {
  const showRoutes = container("layer-routes").checked;
  const showDrivers = container("layer-drivers").checked;
  const showPoi = container("layer-poi").checked;
  const showZone = container("layer-zone").checked;

  if (showRoutes) map.addLayer(routeLayerGroup); else map.removeLayer(routeLayerGroup);
  if (showDrivers) map.addLayer(driverLayerGroup); else map.removeLayer(driverLayerGroup);
  if (showPoi) map.addLayer(poiLayerGroup); else map.removeLayer(poiLayerGroup);
  if (showZone) map.addLayer(zoneLayerGroup); else map.removeLayer(zoneLayerGroup);
}

/**
 * 12. Render Tabel Data Geospasial
 */
function renderTable(geojson) {
  const thead = container("table-head");
  const tbody = container("table-body");

  thead.innerHTML = `
    <tr>
      <th>No</th>
      <th>ID</th>
      <th>Nama Fitur</th>
      <th>Kategori</th>
      <th>Tipe</th>
      <th>Tarif</th>
      <th>Detail / Keterangan</th>
    </tr>
  `;

  tbody.innerHTML = "";

  geojson.features.forEach((feature, index) => {
    const { geometry, properties } = feature;
    const tr = document.createElement("tr");

    const tarifText = properties.tarif ? `Rp ${properties.tarif.toLocaleString('id-ID')}` : (properties.tarif_flat ? `Flat Rp ${properties.tarif_flat.toLocaleString('id-ID')}` : "-");
    const detailText = properties.jalur_jalan || properties.kendaraan || properties.deskripsi || `${geometry.coordinates[0]}, ${geometry.coordinates[1]}`;

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><code>${properties.id || `FT-${index+1}`}</code></td>
      <td><strong>${properties.name}</strong></td>
      <td>${properties.kategori || '-'}</td>
      <td><span class="badge" style="background:#f1f5f9; color:#334155;">${geometry ? geometry.type : 'Unknown'}</span></td>
      <td style="color:#059669; font-weight:bold;">${tarifText}</td>
      <td style="font-size:11px; max-width:200px; overflow:hidden; text-overflow:ellipsis;">${detailText}</td>
    `;

    tr.style.cursor = "pointer";
    tr.addEventListener("click", () => {
      if (geometry.type === "Point") {
        map.setView([geometry.coordinates[1], geometry.coordinates[0]], 16);
      } else if (geometry.type === "LineString") {
        const bounds = L.latLngBounds(geometry.coordinates.map(c => [c[1], c[0]]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    tbody.appendChild(tr);
  });
}

/**
 * 13. Minimize / Expand Floating Order Card
 */
function toggleOrderCard() {
  const content = container("card-collapsible");
  const btn = container("btn-toggle-card");
  isCardCollapsed = !isCardCollapsed;

  if (isCardCollapsed) {
    content.style.display = "none";
    btn.textContent = "+";
    btn.title = "Buka Detail Pesanan";
  } else {
    content.style.display = "block";
    btn.textContent = "−";
    btn.title = "Sembunyikan";
  }
}

/**
 * 14. Modal Dialog Order Ojek
 */
function openOrderModal() {
  const driverName = container("driver-assigned").textContent;
  const driverVehicle = container("driver-vehicle").textContent;

  setInnerText("modal-driver-name", driverName);
  setInnerText("modal-driver-vehicle", driverVehicle);
  container("order-modal").style.display = "flex";
}

function closeOrderModal() {
  container("order-modal").style.display = "none";
}

/**
 * 15. Salin Info Spasial ke Clipboard
 */
function copySpatialInfo() {
  const code = container("mongo-query-code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = container("btn-copy-query");
    btn.textContent = "✅ Tersalin!";
    setTimeout(() => {
      btn.textContent = "📋 Salin Info";
    }, 2000);
  });
}

/**
 * Helper: Menghitung Jarak Dua Titik Koordinat (Haversine Formula) dalam km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}