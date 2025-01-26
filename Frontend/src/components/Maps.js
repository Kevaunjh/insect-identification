import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function Maps() {
  const [locations, setLocations] = useState([]);
  const [defaultPosition, setDefaultPosition] = useState([40.7128, -74.006]);

  useEffect(() => {
    fetch("/api/location")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
        if (data.length > 0) {
          const mostRecent = data[data.length - 1];
          setDefaultPosition([mostRecent.latitude, mostRecent.longitude]);
        }
      })
      .catch((error) => console.error("Error fetching locations:", error));
  }, []);

  return (
    <div
      className="flex flex-col items-center h-[calc(100vh-4rem)] w-full"
      style={{ zIndex: 0 }}
    >
      <MapContainer
        center={defaultPosition}
        zoom={5}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Maps;
