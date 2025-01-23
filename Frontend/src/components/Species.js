import React, { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { DarkModeContext } from "../context/DarkModeContext";

function Species() {
  const { darkMode } = useContext(DarkModeContext);
  const [existingSpeciesData, setExistingSpeciesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  useEffect(() => {
    const fetchSpeciesData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/speciesinfo");
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

  const openModal = (species) => {
    setSelectedSpecies(species);
  };

  const closeModal = () => {
    setSelectedSpecies(null);
  };

  return (
    <div
      className={`flex flex-col items-center min-h-[calc(100vh-4rem)] w-full transition-colors duration-500 custom-scrollbar ${
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
                className={`flex flex-col items-center p-4 border rounded-lg shadow-md transition-colors duration-500 cursor-pointer ${
                  darkMode
                    ? "bg-zinc-700 text-white border-zinc-600 hover:bg-slate-800"
                    : "bg-white text-black border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => openModal(species)}
              >
                <div
                  className={`w-full h-64 bg-gray-300 rounded-md mb-4 flex items-center justify-center overflow-hidden"`}
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

      {selectedSpecies && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Species Details"
          className={`lg:rounded-lg shadow-lg p-6 xl:w-2/5 w-screen md:w-4/5 sm:h-5/6 h-full mx-auto flex flex-col justify-between transition-colors duration-500 border-2 ${
            darkMode
              ? "bg-gray-700 text-white botder-white"
              : "bg-white text-gray-900 border-black"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="space-y-4">
            <div className="h-64 rounded-md overflow-hidden flex items-center justify-center">
              {selectedSpecies.image ? (
                <img
                  src={selectedSpecies.image}
                  alt={selectedSpecies.name}
                  className={`h-64 self-center rounded-xl border-2 ${
                    darkMode ? "border-white" : "border-black"
                  }`}
                />
              ) : (
                <p
                  className={`text-sm flex items-center justify-center h-full ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No Image Available
                </p>
              )}
            </div>
            <h2 className="text-2xl font-bold">{selectedSpecies.name}</h2>
            <p>
              <strong>Species:</strong> {selectedSpecies.species || "N/A"}
            </p>
            <p>
              <strong>Habitat:</strong> {selectedSpecies.habitat || "N/A"}
            </p>
            <p>
              <strong>Lifecycle:</strong> {selectedSpecies.lifecycle || "N/A"}
            </p>
            <p>
              <strong>Average Size:</strong>{" "}
              {selectedSpecies.averageSize || "N/A"}
            </p>
            <p>
              <strong>Nativity:</strong> {selectedSpecies.nativity || "N/A"}
            </p>
            <p>
              <strong>Risk:</strong> {selectedSpecies.risk || "N/A"}
            </p>
            <p>
              <strong>Control Methods:</strong>{" "}
              {selectedSpecies.controlMethods || "N/A"}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className={`px-4 py-2 rounded-md transition-colors duration-500 ${
                darkMode
                  ? "bg-green hover:bg-green-700 text-white"
                  : "bg-light-green hover:bg-green-300 black-white"
              }`}
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Species;
