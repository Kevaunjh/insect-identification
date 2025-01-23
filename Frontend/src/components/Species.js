import React, { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "../context/DarkModeContext";

function Species({}) {
  const { darkMode } = useContext(DarkModeContext);
  const [existingSpeciesData, setExistingSpeciesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeciesData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/existingspecies"
        );
        const result = await response.json();
        if (result) {
          setExistingSpeciesData(result);
        }
      } catch (error) {
        console.error("Error fetching species data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeciesData();
  }, []);

  return (
    <div
      className={`flex flex-col items-center min-h-[calc(100vh-4rem)] w-full transition-colors duration-500 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h1
        className={`text-3xl font-bold my-4 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Detectable Species
      </h1>
      {loading ? (
        <p className="text-lg">Loading species data...</p>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 w-full`}
        >
          {existingSpeciesData.length > 0 ? (
            existingSpeciesData.map((species, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-4 border rounded-lg shadow-md transition-colors duration-500 ${
                  darkMode
                    ? "bg-zinc-700 text-white border-zinc-600 hover:bg-slate-800"
                    : "bg-white text-black border-gray-300 hover:bg-gray-200"
                }`}
              >
                <div
                  className={`w-full h-64 bg-gray-300 rounded-md mb-4 flex items-center justify-center overflow-hidden" ${
                    darkMode
                      ? "#3a3a3a hover:bg-slate-800"
                      : "#e2e2e2 hover:bg-gray-200"
                  }`}
                >
                  {species.image ? (
                    <img
                      src={species.image}
                      alt={species.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No Image Available</p>
                  )}
                </div>
                <h2 className="text-lg font-medium">{species.name}</h2>
              </div>
            ))
          ) : (
            <p>No species data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Species;
