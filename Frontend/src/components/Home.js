import React, { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";

function Home({}) {
  const [speciesData, setSpeciesData] = useState([]);
  const [factsData, setFactsData] = useState(null);
  const [showFacts, setShowFacts] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { darkMode } = useContext(DarkModeContext);

  const handleShowFactsToggle = () => {
    setShowFacts((prev) => !prev);
  };

  const handleNextImage = () => {
    if (speciesData.length > 0 && speciesData[0].images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % speciesData[0].images.length);
    }
  };

  useEffect(() => {
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

    fetchSpeciesData();
    const interval = setInterval(fetchSpeciesData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col md:flex-row h-full w-full">
        <div
          id="leftside"
          className={`w-full md:w-2/3 flex flex-col shadow md:p-4 transition-colors duration-500 ${
            darkMode ? "bg-zinc-700" : "bg-white"
          }`}
          style={{ display: "flex", flex: "1 1 auto" }}
        >
          <div
            className={`md:w-4/5 w-full h-full border rounded-md overflow-hidden flex flex-col transition-colors duration-500 mx-auto  ${
              darkMode ? "border-zinc-800" : "border-zinc-100"
            }`}
            style={{ flex: "1 1 auto" }}
          >
            <div
              className={`w-full flex items-center justify-center transition-colors duration-500 ${
                darkMode ? "bg-zinc-800" : "bg-zinc-100"
              }`}
              style={{ flex: "2 1 auto" }}
            >
              {speciesData.length > 0 && speciesData[0]?.image ? (
                <img
                  src={`data:image/jpeg;base64,${speciesData[0].image}`}
                  alt={speciesData[0].name || "Insect Image"}
                  className="object-contain w-3/5 "
                />
              ) : (
                <p
                  className={`${
                    darkMode ? "text-zinc-200" : "text-zinc-800"
                  } text-center`}
                >
                  Loading...
                </p>
              )}
            </div>
            <div
              className={`w-full flex flex-col items-center justify-center transition-colors duration-500 h-1/5 min-h-1/5 ${
                darkMode ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black"
              }`}
            >
              <h2 className="text-xl font-bold text-center">
                {speciesData.length > 0
                  ? speciesData[0]?.name || "Loading..."
                  : "Loading..."}
              </h2>
              <p className="text-sm text-center ">
                {speciesData.length > 0
                  ? `Confidence: ${speciesData[0]?.confidence}%` ||
                    "Loading..."
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div
          id="rightside"
          className={`w-full md:w-1/3 flex flex-col items-center shadow md:p-2 justify-center transition-colors duration-500 ${
            darkMode ? "bg-zinc-700 text-white" : "bg-white text-black"
          }`}
          style={{ flex: "1 1 auto" }}
        >
          <div
            className={`h-full md:rounded-2xl p-4 md:w-5/6 transition-colors duration-500 w-full ${
              darkMode ? "bg-zinc-800 text-white" : "bg-zinc-200 text-black"
            }`}
          >
            <h1 className=" text-lg xl:text-3xl font-medium h-1/3 flex justify-center items-center">
              {showFacts ? "Common Facts" : "Species Information"}
            </h1>
            <ul className="gap-4 w-full flex-grow h-1/3 flex justify-center items-center text-xs md:text-sm">
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
                  <p>Loading...</p>
                )
              ) : speciesData.length > 0 ? (
                <li>
                  <strong>Name:</strong>{" "}
                  {speciesData[0].name || "Loading..."}
                  <br />
                  <strong>Species:</strong>{" "}
                  {speciesData[0].scientific_name || "Loading..."}
                  <br />
                  <strong>Temperature:</strong>{" "}
                  {speciesData[0].temperature || "Loading..."}
                  <br />
                  <strong>Light Level:</strong>{" "}
                  {speciesData[0].light || "Loading..."}
                  <br />
                  <strong>Heat:</strong>{" "}
                  {speciesData[0].heat || "Loading..."}
                  <br />
                  <strong>Latitude:</strong>{" "}
                  {speciesData[0].latitude || "Loading..."}
                  <br />
                  <strong>Longitude:</strong>{" "}
                  {speciesData[0].longitude || "Loading..."}
                  <br />
                </li>
              ) : (
                <p>No data available</p>
              )}
            </ul>
          </div>
          <button
            className={`mt-6 px-6 py-4 rounded-md self-center transition-colors duration-500 mb-12 ${
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
  );
}

export default Home;
