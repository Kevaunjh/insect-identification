import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../index.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { FaSun, FaMap } from "react-icons/fa";

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

const HeatmapLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    const heatLayer = L.heatLayer(
      data.map((location) => [
        location.latitude,
        location.longitude,
        location.intensity || 0.1,
      ]),
      {
        radius: 25,
        blur: 20,
        maxZoom: 17,
        gradient: { 0.1: "blue", 0.5: "yellow", 1: "red" },
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
};

function Maps() {
  const [locations, setLocations] = useState([]);
  const [mostRecent, setMostRecent] = useState([43.945969, -78.8938948]);
  const [heatmap, setHeatmap] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/location")
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((location) => ({
          ...location,
          intensity: location.count >= 10 ? 1 : location.count >= 5 ? 0.5 : 0.1,
        }));
        setLocations(processedData);
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
    <div className="relative flex flex-col items-center h-[calc(100vh-4rem)] w-full">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mostRecent}
          zoom={14}
          minZoom={3}
          maxBounds={[
            [85, -180],
            [-85, 180],
          ]}
          maxBoundsViscosity={1.0}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap position={mostRecent} />
          {!heatmap &&
            locations.map((location, index) => (
              <ZoomToMarker
                key={index}
                position={[location.latitude, location.longitude]}
              />
            ))}
          {heatmap && <HeatmapLayer data={locations} />}
        </MapContainer>
      </div>
      <button
        className="absolute top-20 left-3 z-50 bg-white p-2 rounded-md shadow-lg border border-black"
        onClick={() => setHeatmap(!heatmap)}
      >
        {heatmap ? <FaMap /> : <FaSun />}
      </button>
    </div>
  );
}

export default Maps;
