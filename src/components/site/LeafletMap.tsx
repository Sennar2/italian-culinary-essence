import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ChapterPopupBody, type ChapterPin } from "./ChaptersMap";

// CSS-only marker — gold ring with forest dot. Avoids broken default-marker PNG paths.
const iccIcon = L.divIcon({
  className: "icc-map-marker",
  html: `<span class="icc-marker-outer"><span class="icc-marker-inner"></span></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

export default function ChaptersMapClient({ chapters }: { chapters: ChapterPin[] }) {
  const lats = chapters.map((c) => Number(c.lat));
  const lngs = chapters.map((c) => Number(c.lng));
  const center: [number, number] = chapters.length > 0
    ? [lats.reduce((a, b) => a + b, 0) / lats.length, lngs.reduce((a, b) => a + b, 0) / lngs.length]
    : [20, 10];
  const zoom = chapters.length === 1 ? 5 : 2;

  return (
    <>
      <style>{`
        .leaflet-container { background: #f8f6f2; font-family: var(--font-sans); }
        .leaflet-popup-content-wrapper { border-radius: 0; border: 1px solid var(--color-border); box-shadow: 0 12px 30px -12px rgba(15,61,46,0.25); }
        .leaflet-popup-tip { background: #fff; }
        .icc-map-marker .icc-marker-outer { position: relative; display: block; width: 28px; height: 28px; border-radius: 9999px; background: rgba(185,154,93,0.25); display: flex; align-items: center; justify-content: center; }
        .icc-map-marker .icc-marker-inner { width: 12px; height: 12px; border-radius: 9999px; background: var(--color-forest); border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .leaflet-control-attribution { font-size: 10px; }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        scrollWheelZoom={false}
        worldCopyJump
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {chapters.map((c) => (
          <Marker key={c.slug} position={[Number(c.lat), Number(c.lng)]} icon={iccIcon}>
            <Popup>
              <ChapterPopupBody c={c} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}