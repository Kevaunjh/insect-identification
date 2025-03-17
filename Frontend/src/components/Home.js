import React, { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";
import { FaTemperatureHigh, FaLightbulb, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";

function Home() {
  const [speciesData, setSpeciesData] = useState([]);
  const [factsData, setFactsData] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(DarkModeContext);

  const handleShowFactsToggle = () => {
    setShowFacts((prev) => !prev);
  };

  useEffect(() => {
    const fetchSpeciesData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/api/species");
        const result = await response.json();
        if (result) {
          setSpeciesData([result]);
          fetchFactsData(result.name);
        }
      } catch (error) {
        console.error("Error fetching species data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFactsData = async (speciesName) => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/speciesdata");
        const result = await response.json();
        const matchedFacts = result.find(
          (item) => item.speciesName === speciesName
        );
        setFactsData(matchedFacts || null);
      } catch (error) {
        console.error("Error fetching facts data:", error);
      }
    };

    fetchSpeciesData();
    const interval = setInterval(fetchSpeciesData, 10000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to safely format numeric values
  const formatCoordinate = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else if (typeof value === 'string') {
      // Try to convert string to number first
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    }
    return 'Unknown';
  };

  const DataCard = ({ icon, title, subtitle, value }) => (
    <div className={`flex items-center p-3 rounded-lg shadow-sm ${
      darkMode ? "bg-gray-700" : "bg-white"
    }`}>
      <div className={`p-3 rounded-full mr-3 ${
        darkMode ? "bg-gray-600 text-light-green" : "bg-light-green text-green"
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-xs opacity-80">{title}</p>
        {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
        <p className="font-medium">{value || "N/A"}</p>
      </div>
    </div>
  );

  // Helper function to safely format location
  const formatLocation = (lat, lng) => {
    if (!lat || !lng) return "Unknown";
    try {
      return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
    } catch (error) {
      console.error("Error formatting location:", error);
      return "Unknown";
    }
  };

  return (
    <div className={`flex flex-col items-center h-[calc(100vh-4rem)] w-full transition-colors duration-500 overflow-auto ${
      darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="w-full max-w-6xl mx-auto p-4 fade-in">
        <h1 className="text-2xl font-bold mb-2">
          Species Identification Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Currently detected invasive species and environmental data
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel - Species image and basic info */}
          <div className="w-full lg:w-2/3">
            <div className={`rounded-xl overflow-hidden shadow-lg transition-colors duration-500 h-full flex flex-col ${
              darkMode ? "bg-gray-700" : "bg-white"
            }`}>
              <div className={`p-4 border-b ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                <h2 className="text-xl font-bold">
                  {loading 
                    ? "Loading..." 
                    : speciesData.length > 0 
                      ? speciesData[0]?.name || "Unknown Species" 
                      : "No Species Detected"
                  }
                </h2>
                {!loading && speciesData.length > 0 && (
                  <div className={`flex items-center text-sm mt-1 ${
                    darkMode ? "text-emerald-400" : "text-green-600"
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      darkMode ? "bg-emerald-400" : "bg-green-600"
                    }`}></span>
                    <span>Confidence: {speciesData[0]?.confidence}%</span>
                  </div>
                )}
              </div>
              
              <div 
                className={`flex items-center justify-center p-5 flex-grow ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
                style={{ minHeight: "280px", maxHeight: "350px" }}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4">Loading species data...</p>
                  </div>
                ) : speciesData.length > 0 && speciesData[0]?.image ? (
                  <img
                    src={`data:image/jpeg;base64,${speciesData[0].image}`}
                    alt={speciesData[0].name || "Insect Image"}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FaInfoCircle size={45} className="text-gray-400 mb-4" />
                    <p>No image available</p>
                  </div>
                )}
              </div>
              
              {/* Environmental data */}
              <div className="p-4 mt-auto">
                <h3 className="font-medium mb-2">Environmental Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <DataCard 
                    icon={<FaTemperatureHigh />} 
                    title="Temperature" 
                    value={!loading && speciesData.length > 0 ? speciesData[0].temperature : "N/A"} 
                  />
                  <DataCard 
                    icon={<FaLightbulb />} 
                    title="Light Level" 
                    value={!loading && speciesData.length > 0 ? speciesData[0].light : "N/A"} 
                  />
                  <DataCard 
                    icon={<FaMapMarkerAlt />} 
                    title="Location" 
                    subtitle="(Longitude, Latitude)"
                    value={!loading && speciesData.length > 0 ? 
                      formatLocation(speciesData[0].latitude, speciesData[0].longitude) : 
                      "Unknown"} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Facts/Info */}
          <div className="w-full lg:w-1/3">
            <div className={`rounded-xl overflow-hidden shadow-lg h-full flex flex-col transition-colors duration-500 ${
              darkMode ? "bg-gray-700" : "bg-white"
            }`}>
              <div className={`p-4 border-b flex justify-between items-center ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                <h2 className="text-xl font-bold">
                  {showFacts ? "Species Facts" : "Species Information"}
                </h2>
                <button
                  onClick={handleShowFactsToggle}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-light-green hover:bg-green-200 text-green"
                  }`}
                >
                  Show {showFacts ? "Info" : "Facts"}
                </button>
              </div>
              
              <div className="p-5 flex-grow overflow-y-auto" style={{ maxHeight: "350px" }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4">Loading data...</p>
                  </div>
                ) : (
                  <>
                    {showFacts ? (
                      <div className="h-full">
                        {factsData ? (
                          <div className="space-y-4">
                            <h3 className="font-bold text-lg">{factsData.speciesName}</h3>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p>{factsData.description || "No description available."}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                              <h4 className="font-medium mb-2">Fun Fact</h4>
                              <p>{factsData.funFact || "No fun facts available."}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaInfoCircle size={32} className="text-gray-400 mb-4" />
                            <p>No facts available for this species.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full">
                        {speciesData.length > 0 ? (
                          <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                              <h4 className="font-medium mb-2">Scientific Classification</h4>
                              <p><strong>Name:</strong> {speciesData[0].name || "Unknown"}</p>
                              <p><strong>Species:</strong> {speciesData[0].scientific_name || "Unknown"}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                              <h4 className="font-medium mb-2">Detection Details</h4>
                              <p><strong>Date:</strong> {speciesData[0].date || "Unknown"}</p>
                              <p><strong>Time:</strong> {speciesData[0].time || "Unknown"}</p>
                              <p><strong>Confidence:</strong> {speciesData[0].confidence}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaInfoCircle size={32} className="text-gray-400 mb-4" />
                            <p>No species currently detected.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Adding an empty div to ensure consistent height with the left card */}
              <div className="p-4 mt-auto">
                <h3 className="font-medium mb-2 opacity-0">Spacer</h3>
                <div className="h-[103px]"></div> {/* This matches the height of the environmental data section */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;