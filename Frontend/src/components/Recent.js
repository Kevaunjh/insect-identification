import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import { DarkModeContext } from "../context/DarkModeContext";
import { FaBox, FaTrash } from "react-icons/fa";

function Species() {
  const { darkMode } = useContext(DarkModeContext);
  const [recentSpeciesData, setRecentSpeciesData] = useState([]);
  const [filteredSpeciesData, setFilteredSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [confirmationModel, setConfirmationModel] = useState(false);

  const fetchRecentSpecies = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/alldata");
      const result = await response.json();
      if (result) {
        setRecentSpeciesData(result);
        setFilteredSpeciesData(result);
      }
    } catch (error) {
      console.error("Error fetching recent species data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSpecies();
    const interval = setInterval(fetchRecentSpecies, 20000);

    return () => clearInterval(interval);
  }, []);

  const openModal = (species) => {
    setSelectedSpecies(species);
  };

  const closeModal = () => {
    setConfirmationModel(false);
    setSelectedSpecies(null);
  };

  const handleFilterChange = (e) => {
    const text = e.target.value.toLowerCase();
    setFilterText(text);
    setFilteredSpeciesData(
      recentSpeciesData.filter((species) =>
        species.name.toLowerCase().includes(text)
      )
    );
  };

  const saveToArchives = (species) => {
    setSelectedSpecies(null);
    setConfirmationModel(false);
    const data = {
      name: species.name,
      scientific_name: species.scientific_name,
      habitat: species.habitat,
      image: species.image,
      temperature: species.temperature,
      light: species.light,
      heat: species.heat,
      date: species.date,
      time: species.time,
    };
    fetch("http://127.0.0.1:5000/api/archivespecies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => console.log("Data successfully archived:", data))
      .catch((error) => console.error("Error:", error));
  };

  const handleSaveToArchives = (species) => {
    saveToArchives(species);
  };

  const openConfirmationModel = () => {
    setConfirmationModel(true);
  };

  const handleClose = () => {
    setConfirmationModel(false);
    setSelectedSpecies(null);
  };

  return (
    <div
      className={`flex flex-col items-center h-[calc(100vh-4rem)] w-full transition-colors duration-500 overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="w-full p-4">
        <input
          type="text"
          value={filterText}
          onChange={handleFilterChange}
          placeholder="Filter by species name"
          className={`w-full p-3 rounded-md shadow-sm border focus:outline-none ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-100 border-gray-300 text-black"
          }`}
        />
      </div>
      <div className="flex h-full w-full p-4">
        {loading ? (
          <p className="text-lg mx-auto">Loading recent species data...</p>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            {filteredSpeciesData.map((species, index) => (
              <div
                key={index}
                className={`flex w-full p-4 rounded-lg shadow-md transition-colors duration-500 cursor-pointer border-2 ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    : "bg-white hover:bg-gray-100 border-gray-300"
                }`}
                onClick={() => openModal(species)}
              >
                <div className="flex w-full">
                  <div className="flex justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-32 h-32 bg-gray-300 rounded-md overflow-hidden">
                        {species.image ? (
                          <img
                            src={`data:image/jpeg;base64,${species.image}`}
                            alt={species.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <p
                            className={`text-sm flex items-center justify-center h-full ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            No Image
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col justify-center justify-self-start pl-4 ">
                        <h2 className="text-lg font-bold">{species.name}</h2>
                        <p className="text-sm">
                          <strong>Discovered Time:</strong>{" "}
                          {species.time || "N/A"}
                        </p>
                        <p className="text-sm">
                          <strong>Discovered Date:</strong>{" "}
                          {species.date || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <FaBox
                        onClick={openConfirmationModel}
                        className="mr-2 ml-2 z-10"
                      />
                      <FaTrash className="mr-2 ml-2 z-10" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedSpecies && !confirmationModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Species Details"
          className={`lg:rounded-lg shadow-lg p-6 xl:w-2/5 h-full sm:h-5/6 mx-auto flex flex-col justify-between transition-colors duration-500 custom-scrollbar border-2  ${
            darkMode
              ? "bg-gray-700 text-white border-white"
              : "bg-white text-gray-900 border-black"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="space-y-4">
            <div className="h-64 rounded-md overflow-hidden flex items-center justify-center">
              {selectedSpecies.image ? (
                <img
                  src={`data:image/jpeg;base64,${selectedSpecies.image}`}
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
                  No Image
                </p>
              )}
            </div>
            <h2 className="text-2xl font-bold">{selectedSpecies.name}</h2>
            <p>
              <strong>Species:</strong>{" "}
              {selectedSpecies.scientific_name || "N/A"}
            </p>
            <p>
              <strong>Habitat:</strong> {selectedSpecies.habitat || "N/A"}
            </p>
            <p>
              <strong>Temperature:</strong>{" "}
              {selectedSpecies.temperature || "N/A"}
            </p>
            <p>
              <strong>Light:</strong> {selectedSpecies.light || "N/A"}
            </p>
            <p>
              <strong>Heat:</strong> {selectedSpecies.heat || "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {selectedSpecies.date || "N/A"}
            </p>
            <p>
              <strong>Time:</strong> {selectedSpecies.time || "N/A"}
            </p>
          </div>
          <div className="flex justify-end">
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

      {confirmationModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Species Details"
          className={`lg:rounded-lg shadow-lg p-6 xl:w-2/5 w-full sm:h-auto mx-auto flex flex-col justify-between transition-colors duration-500 custom-scrollbar border-2 ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
        >
          <div className="flex flex-col items-center space-y-6">
            <h1
              className={`text-xl font-bold text-center ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Archive Confirmation
            </h1>
            <div
              className={`w-full rounded-md p-4 flex items-center justify-center text-center ${
                darkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <p>Are you sure you would like to archive this species?</p>
            </div>
            <div className="flex justify-center gap-4 w-full">
              <button
                className={`px-6 py-2 rounded-md font-medium text-sm transition ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-500 text-gray-100"
                    : "bg-green-500 hover:bg-green-400 text-white"
                }`}
                onClick={() => handleSaveToArchives(selectedSpecies)}
              >
                Yes, Archive
              </button>
              <button
                className={`px-6 py-2 rounded-md font-medium text-sm transition ${
                  darkMode
                    ? "bg-red-600 hover:bg-red-500 text-gray-100"
                    : "bg-red-500 hover:bg-red-400 text-white"
                }`}
                onClick={closeModal}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Species;
