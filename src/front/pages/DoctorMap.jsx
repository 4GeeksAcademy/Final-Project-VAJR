import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export const DoctorMap = ({ doctor }) => {
    
  if (!doctor?.location?.lat || !doctor?.location?.lng) {
    return <p className="fw-light">I can't find this location</p>;
  }

  const mapsUrl = /iPad|iPhone|iPod/.test(navigator.userAgent)
    ? `https://maps.apple.com/?daddr=${doctor.location.lat},${doctor.location.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${doctor.location.lat},${doctor.location.lng}`;

  return (
    <div style={{ width: "100%" }}>
      <MapContainer
        center={[doctor.location.lat, doctor.location.lng]}
        zoom={15}
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Marker position={[doctor.location.lat, doctor.location.lng]}>
          <Popup>
            <strong>Dr. {doctor.name}</strong> <br />
            {doctor.address} <br /><br />
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              How to get there?
            </a>
          </Popup>
        </Marker>
      </MapContainer>

      <div className="mt-3">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fw-semibold"
          style={{ color: "#468BE6" }}
        >
          See directions on the map
        </a>
      </div>
    </div>
  );
};
