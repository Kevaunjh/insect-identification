import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./../index.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const calculateCenter = (locations) => {
  if (locations.length === 0) return [40.7128, -74.006];
  const latSum = locations.reduce((sum, loc) => sum + loc.latitude, 0);
  const lonSum = locations.reduce((sum, loc) => sum + loc.longitude, 0);
  return [latSum / locations.length, lonSum / locations.length];
};

const ZoomToMarker = ({ position }) => {
  const map = useMap();

  const handleClick = () => {
    map.setView(position, 12, { animate: true });
  };

  return (
    <Marker position={position} eventHandlers={{ click: handleClick }}>
      <Popup>
        <div>
          <strong>Latitude:</strong> {position[0]}
          <br />
          <strong>Longitude:</strong> {position[1]}
        </div>
      </Popup>
    </Marker>
  );
};

function Maps() {
  const [locations, setLocations] = useState([]);
  const [initialPosition, setInitialPosition] = useState([40.7128, -74.006]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/location")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);

        if (data.length > 0) {
          const mostRecent = [
            data[data.length - 1].latitude,
            data[data.length - 1].longitude,
          ];
          setInitialPosition(mostRecent);
        }
      })
      .catch((error) => console.error("Error fetching locations:", error));
  }, []);

  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col md:flex-row h-full w-full">
        <MapContainer
          center={initialPosition}
          zoom={8}
          minZoom={3}
          className="w-full h-full z-5"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((location, index) => (
            <ZoomToMarker
              key={index}
              position={[location.latitude, location.longitude]}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Maps;
