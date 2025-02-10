import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../index.css";

import { FaSun, FaMap } from "react-icons/fa";

const blueMarker = new L.Icon({
  iconUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 40],
  popupAnchor: [1, -34],
});

const yellowMarker = new L.Icon({
  iconUrl: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 40],
  popupAnchor: [1, -34],
});

const placeholderImage = "https://via.placeholder.com/100?text=No+Image";

const SpeciesMarker = ({ position, name, image, icon }) => (
  <Marker position={position} icon={icon}>
    <Popup>
      <div className="text-center items-center flex-col flex">
        <strong>{name}</strong>
        <img
          src={image || placeholderImage}
          alt={name}
          className="mb-2 mt-1 w-28 h-28 border-2 rounded-xl object-cover"
        />
        <div>
          <strong>Latitude:</strong> {position[0]}
          <br />
          <strong>Longitude:</strong> {position[1]}
        </div>
      </div>
    </Popup>
  </Marker>
);

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14, { animate: true });
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
  const [observations, setObservations] = useState([]);
  const [archiveSpecies, setArchiveSpecies] = useState([]);
  const [mostRecent, setMostRecent] = useState(null);
  const [heatmap, setHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/location")
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((species) => ({
          ...species,
          image: species.image
            ? `data:image/jpeg;base64,${species.image}`
            : null,
          intensity: species.count >= 10 ? 1 : species.count >= 5 ? 0.5 : 0.1,
        }));
        setObservations(processedData);
        if (data.length > 0) {
          setMostRecent([
            data[data.length - 1].latitude,
            data[data.length - 1].longitude,
          ]);
        }
      })
      .catch((error) => console.error("Error fetching observations:", error))
      .finally(() => setLoading(false));

    fetch("http://127.0.0.1:5000/api/archivespecies")
      .then((response) => response.json())
      .then((data) =>
        setArchiveSpecies(
          data.map((species) => ({
            ...species,
            image: species.image
              ? `data:image/jpeg;base64,${species.image}`
              : null,
          }))
        )
      )
      .catch((error) =>
        console.error("Error fetching archive species:", error)
      );
  }, []);

  return (
    <div className="relative flex flex-col items-center h-[calc(100vh-4rem)] w-full">
      <div className="absolute inset-0 z-0">
        {!loading && mostRecent ? (
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
              observations.map((species, index) => (
                <SpeciesMarker
                  key={`observation-${index}`}
                  position={[species.latitude, species.longitude]}
                  name={species.name}
                  image={species.image}
                  icon={blueMarker}
                />
              ))}

            {!heatmap &&
              archiveSpecies.map((species, index) => (
                <SpeciesMarker
                  key={`archive-${index}`}
                  position={[species.latitude, species.longitude]}
                  name={`Archive: ${species.name}`}
                  image={species.image}
                  icon={yellowMarker}
                />
              ))}

            {heatmap && (
              <HeatmapLayer data={[...observations, ...archiveSpecies]} />
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xl font-semibold">
            Loading Map...
          </div>
        )}
      </div>
      <button
        className="absolute top-20 left-2.5 z-50 bg-white p-2 rounded-md shadow-lg border border-black"
        onClick={() => setHeatmap(!heatmap)}
      >
        {heatmap ? <FaMap /> : <FaSun />}
      </button>
    </div>
  );
}

export default Maps;
