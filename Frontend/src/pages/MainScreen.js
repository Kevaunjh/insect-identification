import React, { useEffect, useState, useContext } from "react";
import Home from "../components/Home";
import Species from "../components/Species";
import Recent from "../components/Recent";
import {
  FaSync,
  FaBars,
  FaSun,
  FaMoon,
  FaHome,
  FaBug,
  FaClock,
  FaMap,
  FaArchive,
} from "react-icons/fa";
import { DarkModeContext } from "../context/DarkModeContext";

function MainScreen() {
  const [speciesData, setSpeciesData] = useState([]);
  const [factsData, setFactsData] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Home");

  const fetchSpeciesData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/species");
      const result = await response.json();
      if (result) {
        setSpeciesData([result]);
        fetchFactsData(result.name);
      }
    } catch (error) {
      console.error("Error fetching species data:", error);
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

  useEffect(() => {
    fetchSpeciesData();
    const interval = setInterval(() => {
      fetchSpeciesData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleShowFactsToggle = () => {
    setShowFacts((prev) => !prev);
  };

  const handleNextImage = () => {
    if (speciesData.length > 0 && speciesData[0].images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % speciesData[0].images.length);
    }
  };

  const handleSync = () => {
    fetchSpeciesData();
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Home":
        return <Home />;
      case "Species":
        return <Species />;
      case "Recent":
        return <Recent />;
      case "Map":
        return <div>Map View</div>;
      case "Archive":
        return <div>Archived Data</div>;
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <div className="relative h-screen w-screen transition-colors duration-500 overflow-auto">
      <div
        className={` h-16 flex justify-between items-center pl-6 pr-2 text-2xl shadow transition-colors duration-500 ${
          darkMode ? "bg-green text-light-green" : "bg-light-green text-green"
        }`}
      >
        <div className="flex items-center">
          <FaBars
            className="mr-6 cursor-pointer text-lg"
            onClick={handleSidebarToggle}
          />
          <div>
            <div className="md:text-xl font-bold text-sm">
              Invasive Species Identification
            </div>
            <div className="text-sm">Capstone Project</div>
          </div>
        </div>
        <div className="flex items-center">
          <button
            className="px-4 py-2 rounded-md"
            onClick={handleDarkModeToggle}
          >
            {darkMode ? (
              <FaSun className="text-lg" />
            ) : (
              <FaMoon className="text-lg" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-15 left-0 h-full bg-gray-200 ${
          darkMode ? "bg-zinc-800" : "bg-zinc-100"
        } shadow-lg transition-transform duration-500 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "18rem" }}
      >
        <ul className="space-y-6 p-2">
          <li
            className={`flex items-center cursor-pointer ${
              selectedTab === "Home"
                ? darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
                : ""
            } rounded-md pl-10 py-2`}
            onClick={() => setSelectedTab("Home")}
          >
            <FaHome className="mr-8 text-2xl" /> Home
          </li>
          <li
            className={`flex items-center cursor-pointer ${
              selectedTab === "Species"
                ? darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
                : ""
            } rounded-md pl-10 py-2`}
            onClick={() => setSelectedTab("Species")}
          >
            <FaBug className="mr-8 text-2xl" /> Species
          </li>
          <li
            className={`flex items-center cursor-pointer ${
              selectedTab === "Recent"
                ? darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
                : ""
            } rounded-md pl-10 py-2`}
            onClick={() => setSelectedTab("Recent")}
          >
            <FaClock className="mr-8 text-2xl" /> Recent
          </li>
          <li
            className={`flex items-center cursor-pointer ${
              selectedTab === "Map"
                ? darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
                : ""
            } rounded-md pl-10 py-2`}
            onClick={() => setSelectedTab("Map")}
          >
            <FaMap className="mr-8 text-2xl" /> Map
          </li>
          <li
            className={`flex items-center cursor-pointer ${
              selectedTab === "Archive"
                ? darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
                : ""
            } rounded-md pl-10 py-2`}
            onClick={() => setSelectedTab("Archive")}
          >
            <FaArchive className="mr-8 text-2xl" /> Archive
          </li>
        </ul>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40" onClick={handleSidebarToggle}></div>
      )}

      <div className="relative flex-grow">{renderContent()}</div>
    </div>
  );
}

export default MainScreen;
