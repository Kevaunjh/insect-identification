import React, { useEffect, useState } from "react";
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

function MainScreen() {
  const [speciesData, setSpeciesData] = useState([]);
  const [factsData, setFactsData] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div
      className={`h-screen w-screen ${
        darkMode ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-800"
      }`}
    >
      <div
        className={`w-screen h-16 flex justify-between items-center pl-6 pr-2 text-2xl shadow ${
          darkMode ? "bg-green text-light-green" : "bg-light-green text-green"
        }`}
      >
        <div className="flex items-center">
          <FaBars
            className="mr-6 cursor-pointer text-lg"
            onClick={handleSidebarToggle}
          />
          <div>
            <div className="text-xl font-bold">
              Invasive Species Identification
            </div>
            <div className="text-sm">Capstone Project</div>
          </div>
        </div>
        <div className="flex items-center">
          <FaSync
            className="mr-4 cursor-pointer text-lg"
            onClick={handleSync}
          />
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

      <div className="flex w-screen h-[calc(100vh-4rem)]">
        {sidebarOpen && (
          <div
            className={`w-72 h-full bg-gray-200 p-2 ${
              darkMode ? "bg-zinc-800" : "bg-zinc-100"
            } shadow-lg`}
          >
            <ul className="space-y-6">
              <li
                className={`flex items-center cursor-pointer ${
                  darkMode
                    ? "bg-green text-light-green"
                    : "bg-light-green text-green"
                } rounded-md -ml-4 pl-10 py-2 -mb-2`}
              >
                <FaHome className="mr-8 text-2xl" /> Home
              </li>
              <li className="flex items-center cursor-pointer pl-6">
                <FaBug className="mr-8 text-2xl" /> Species
              </li>
              <li className="flex items-center cursor-pointer pl-6">
                <FaClock className="mr-8 text-2xl" /> Recent
              </li>
              <li className="flex items-center cursor-pointer pl-6">
                <FaMap className="mr-8 text-2xl" /> Map
              </li>
              <li className="flex items-center cursor-pointer pl-6">
                <FaArchive className="mr-8 text-2xl" /> Archive
              </li>
            </ul>
          </div>
        )}
        <div className="flex-grow flex  px-4 py-4 gap-4">
          <div
            id="leftside"
            className={`w-2/3 flex items-center justify-center flex-col shadow rounded p-4 ${
              darkMode ? "bg-zinc-700" : "bg-white"
            }`}
          >
            <div className={`w-3/4 h-3/4 border rounded-md overflow-hidden flex flex-col items-center justify-center ${darkMode ? "border-zinc-800" : "border-zinc-100"}`}>
              <div className={`w-full h-3/4 flex items-center justify-center ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
                {speciesData.length > 0 && speciesData[0]?.image ? (
                  <img
                    src={`data:image/jpeg;base64,${speciesData[0].image}`}
                    alt={speciesData[0].name || "Insect Image"}
                    className="h-full object-contain"
                  />
                ) : (
                  <p className={`${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>No Data Found</p>
                )}
              </div>
              <div className={`w-full h-1/4 flex flex-col items-center justify-center ${darkMode ? "bg-zinc-900" : "bg-zinc-200"}`}>
                <h2 className="text-xl font-bold text-center">
                  {speciesData.length > 0
                    ? speciesData[0]?.name || "No Data Found"
                    : "No Data Found"}
                </h2>
                <p className="text-sm text-center">
                  {speciesData.length > 0
                    ? `Confidence: ${speciesData[0]?.confidence}%` || "No Data Found"
                    : "No Data Found"}
                </p>
              </div>
            </div>
            <button
              className={`mt-6 px-6 py-4 rounded-md self-center ${
                darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
              }`}
              onClick={handleNextImage}
            >
              View More Images
            </button>
          </div>

          <div
            id="rightside"
            className={`w-1/3 flex flex-col items-center shadow rounded p-6 justify-center ${
              darkMode ? "bg-zinc-700" : "bg-white"
            }`}
          >
            <h1 className="text-3xl font-medium mb-4">
              {showFacts ? "Common Facts" : "Species Information"}
            </h1>
            <ul className="gap-4 mt-4 w-full flex-grow">
              {showFacts ? (
                factsData ? (
                  <li>
                    <strong>Species Name:</strong> {factsData.speciesName}
                    <br />
                    <strong>Description:</strong> {factsData.description}
                    <br />
                    <strong>Fun Fact:</strong> {factsData.funFact}
                  </li>
                ) : (
                  <p>No facts available for this species</p>
                )
              ) : speciesData.length > 0 ? (
                <li>
                  <strong>Name:</strong>{" "}
                  {speciesData[0].name || "No Data Found"}
                  <br />
                  <strong>Species:</strong>{" "}
                  {speciesData[0].species || "No Data Found"}
                  <br />
                  <strong>Habitat:</strong>{" "}
                  {speciesData[0].habitat || "No Data Found"}
                  <br />
                  <strong>Temperature:</strong>{" "}
                  {speciesData[0].temperature || "No Data Found"}
                  <br />
                  <strong>Light Level:</strong>{" "}
                  {speciesData[0].light || "No Data Found"}
                  <br />
                  <strong>Heat:</strong>{" "}
                  {speciesData[0].heat || "No Data Found"}
                  <br />
                  <strong>Latitude:</strong>{" "}
                  {speciesData[0].latitude || "No Data Found"}
                  <br />
                  <strong>Longitude:</strong>{" "}
                  {speciesData[0].longitude || "No Data Found"}
                  <br />
                </li>
              ) : (
                <p>No data available</p>
              )}
            </ul>
            <button
              className={`mt-6 px-6 py-4 rounded-md self-center ${
                darkMode
                  ? "bg-green text-light-green"
                  : "bg-light-green text-green"
              }`}
              onClick={handleShowFactsToggle}
            >
              Show {showFacts ? "Species Information" : "Common Facts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;
