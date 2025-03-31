import React, { useEffect, useState, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { FaMapMarkedAlt, FaFireAlt, FaLayerGroup, FaInfoCircle } from "react-icons/fa";
import { DarkModeContext } from "../context/DarkModeContext";

// Add this utility function at the top of the file, before any components
const isValidCoordinate = (value) => {
  // Check if value is a valid number and within reasonable latitude/longitude range
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// Create custom markers with improved styling
const blueMarker = new L.Icon({
  iconUrl: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
});

const yellowMarker = new L.Icon({
  iconUrl: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
});

const placeholderImage = "https://via.placeholder.com/100?text=No+Image";

// Helper function to safely format numeric values
const formatCoordinate = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(6);
  } else if (typeof value === 'string') {
    // Try to convert string to number first
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(6);
  }
  return 'Unknown';
};

const SpeciesMarker = ({ position, name, image, icon, date }) => {
  // Validate coordinates before creating the marker
  if (!position || !isValidCoordinate(position[0]) || !isValidCoordinate(position[1])) {
    console.error("Invalid coordinates:", position);
    return null; // Don't render the marker if coordinates are invalid
  }

  return (
    <Marker position={position} icon={icon}>
      <Popup className="species-popup">
        <div className="text-center items-center flex-col flex">
          <strong className="text-lg">{name}</strong>
          <img
            src={image || placeholderImage}
            alt={name}
            className="my-2 w-28 h-28 border-2 border-gray-300 rounded-lg object-cover shadow-sm"
          />
          <div className="text-sm mt-1">
            <div><strong>Latitude:</strong> {formatCoordinate(position[0])}</div>
            <div><strong>Longitude:</strong> {formatCoordinate(position[1])}</div>
            {date && <div><strong>Date:</strong> {date}</div>}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    // Validate position before trying to center the map
    if (position && isValidCoordinate(position[0]) && isValidCoordinate(position[1])) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);
  return null;
};

const HeatmapLayer = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || data.length === 0) return;

    // Filter out invalid coordinates
    const validData = data.filter(location => 
      isValidCoordinate(location.latitude) && 
      isValidCoordinate(location.longitude)
    );

    if (validData.length === 0) {
      console.warn("No valid coordinates for heatmap");
      return;
    }

    const heatLayer = L.heatLayer(
      validData.map((location) => [
        location.latitude,
        location.longitude,
        location.intensity || 0.2,
      ]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.2: 'blue', 0.5: 'lime', 0.8: 'yellow', 1.0: 'red' },
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
};

function Maps() {
  const { darkMode } = useContext(DarkModeContext);
  const [observations, setObservations] = useState([]);
  const [archiveSpecies, setArchiveSpecies] = useState([]);
  const [mostRecent, setMostRecent] = useState(null);
  const [mapMode, setMapMode] = useState("markers"); // "markers", "heatmap", "both"
  const [loading, setLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Fetch active observations
    fetch("http://127.0.0.1:5000/api/location")
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((species) => ({
          ...species,
          image: species.image
            ? `data:image/jpeg;base64,${species.image}`
            : null,
          intensity: species.count >= 10 ? 1 : species.count >= 5 ? 0.6 : 0.2,
        }));
        setObservations(processedData);
        if (data.length > 0) {
          setMostRecent([
            data[data.length - 1].latitude,
            data[data.length - 1].longitude,
          ]);
        }
      })
      .catch((error) => {
        console.error("Error fetching observations:", error);
      });

    // Fetch archived species
    fetch("http://127.0.0.1:5000/api/archivespecies")
      .then((response) => response.json())
      .then((data) =>
        setArchiveSpecies(
          data.map((species) => ({
            ...species,
            image: species.image
              ? `data:image/jpeg;base64,${species.image}`
              : null,
            intensity: 0.4,
          }))
        )
      )
      .catch((error) => {
        console.error("Error fetching archive species:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleMapMode = () => {
    if (mapMode === "markers") setMapMode("heatmap");
    else if (mapMode === "heatmap") setMapMode("both");
    else setMapMode("markers");
  };

  return (
    <div className="relative flex flex-col items-center h-[calc(100vh-4rem)] w-full fade-in">
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
              url={darkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <RecenterMap position={mostRecent} />

            {/* Show markers based on the current mode */}
            {(mapMode === "markers" || mapMode === "both") && (
              <>
                {observations.map((species, index) => (
                  <SpeciesMarker
                    key={`observation-${index}`}
                    position={[species.latitude, species.longitude]}
                    name={species.name}
                    image={species.image}
                    icon={blueMarker}
                    date={species.date}
                  />
                ))}

                {archiveSpecies.map((species, index) => (
                  <SpeciesMarker
                    key={`archive-${index}`}
                    position={[species.latitude, species.longitude]}
                    name={`${species.name} (Archived)`}
                    image={species.image}
                    icon={yellowMarker}
                    date={species.date}
                  />
                ))}
              </>
            )}

            {/* Show heatmap based on the current mode */}
            {(mapMode === "heatmap" || mapMode === "both") && (
              <HeatmapLayer data={[...observations, ...archiveSpecies]} />
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xl font-semibold bg-gray-100 dark:bg-gray-800">
            <div className="text-center p-8">
              <div className="inline-block animate-spin mb-4">
                <FaMapMarkedAlt size={32} className="text-green dark:text-light-green" />
              </div>
              <p>Loading Map Data...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          className={`p-3 rounded-full shadow-lg border border-gray-300 transition-colors duration-300 ${
            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
          onClick={toggleMapMode}
          title={`Current mode: ${mapMode}. Click to change.`}
        >
          {mapMode === "markers" && <FaMapMarkedAlt size={18} />}
          {mapMode === "heatmap" && <FaFireAlt size={18} />}
          {mapMode === "both" && <FaLayerGroup size={18} />}
        </button>
        
        <button
          className={`p-3 rounded-full shadow-lg border border-gray-300 transition-colors duration-300 ${
            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
          onClick={() => setInfoOpen(!infoOpen)}
          title="Map information"
        >
          <FaInfoCircle size={18} />
        </button>
      </div>
      
      {/* Info panel */}
      {infoOpen && (
        <div 
          className={`absolute bottom-4 right-4 z-10 p-4 rounded-lg shadow-lg border max-w-xs transition-all duration-300 ${
            darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          <h3 className="font-bold mb-2">Map Legend</h3>
          <div className="flex items-center my-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span>Current Observations</span>
          </div>
          <div className="flex items-center my-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>Archived Species</span>
          </div>
          <div className="mt-2 text-sm">
            <p>Toggle between marker view, heatmap, or both using the button above.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maps;