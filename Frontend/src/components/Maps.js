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

const ZoomToMarker = ({ position }) => {
  return (
    <Marker position={position}>
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

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);

  return null;
};

function Maps() {
  const [locations, setLocations] = useState([]);
  const [mostRecent, setMostRecent] = useState([43.945969, -78.8938948]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/location")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);

        if (data.length > 0) {
          setMostRecent([
            data[data.length - 1].latitude,
            data[data.length - 1].longitude,
          ]);
        }
      })
      .catch((error) => console.error("Error fetching locations:", error));
  }, []);

  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col md:flex-row h-full w-full">
        <MapContainer
          center={mostRecent}
          zoom={14}
          minZoom={3}
          className="w-full h-full z-5"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap position={mostRecent} />
          {locations.map((location, index) => (
            <ZoomToMarker
              key={index}
              zoom={15}
              position={[location.latitude, location.longitude]}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Maps;
