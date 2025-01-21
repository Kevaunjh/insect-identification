import React, { useEffect, useState } from "react";

function MainScreen() {
  const [speciesData, setSpeciesData] = useState([]);
  const [factsData, setFactsData] = useState(null);
  const [showFacts, setShowFacts] = useState(false);

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
  }, []);

  const handleShowFactsToggle = () => {
    setShowFacts((prev) => !prev);
  };

  return (
    <div className="h-screen w-screen bg-[#effde4]">
      <div className="w-screen h-16 flex justify-center items-center bg-[#023d1c] text-white text-2xl">
        Insect Identification Capstone Project
      </div>

      <div className="flex w-screen h-[calc(100vh-4rem)]">
        <div
          id="leftside"
          className="w-2/3 flex items-center justify-center flex-col p-4 bg-white shadow-md"
        >
          <div className="w-3/4 h-3/4 border border-gray-300 rounded-md overflow-hidden flex flex-col items-center justify-center">
            <div className="w-full h-3/4 bg-gray-100 flex items-center justify-center">
              {speciesData.length > 0 && speciesData[0]?.image ? (
                <img
                  src={speciesData[0].image}
                  alt={speciesData[0].name}
                  className="h-full object-contain"
                />
              ) : (
                <p className="text-gray-400">No Data Found</p>
              )}
            </div>
            <div className="w-full h-1/4 bg-gray-200 flex items-center justify-center">
              <h2 className="text-xl font-bold text-center">
                {speciesData.length > 0
                  ? speciesData[0]?.name || "No Data Found"
                  : "No Data Found"}
              </h2>
            </div>
          </div>
        </div>

        <div
          id="rightside"
          className="w-1/3 flex flex-col items-center p-4 bg-white shadow-md"
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
                <strong>Name:</strong> {speciesData[0].name || "No Data Found"}
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
                {speciesData[0].longitude || "No Data Found"}
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
            className="mt-6 px-6 py-4 bg-[#023d1c] text-white rounded-md self-center"
            onClick={handleShowFactsToggle}
          >
            Show {showFacts ? "Species Information" : "Common Facts"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;
