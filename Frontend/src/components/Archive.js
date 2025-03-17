import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import { DarkModeContext } from "../context/DarkModeContext";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Archive() {
  const { darkMode } = useContext(DarkModeContext);
  const [recentSpeciesData, setRecentSpeciesData] = useState([]);
  const [filteredSpeciesData, setFilteredSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [deleteModel, setDeleteModel] = useState(false);

  const fetchRecentSpecies = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/archivespecies");
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

  const openModal = (species) => {
    setSelectedSpecies(species);
  };

  const closeModal = () => {
    setSelectedSpecies(null);
    setDeleteModel(false);
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

  const deleteSpecies = (species) => {
    setSelectedSpecies(null);
    setDeleteModel(false);

    fetch("http://127.0.0.1:5000/api/delarchive", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: species._id }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `Failed to delete species: ${response.statusText}`
          );
        }
        return data;
      })
      .then((data) => {
        console.log("Species successfully deleted:", data);
        toast.success("Species deleted successfully!");
        setRecentSpeciesData((prev) =>
          prev.filter((item) => item._id !== species._id)
        );
        setFilteredSpeciesData((prev) =>
          prev.filter((item) => item._id !== species._id)
        );
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(`Deletion failed: ${error.message}`);
        fetchRecentSpecies();
      });
  };

  const openDeleteModel = (species) => {
    setSelectedSpecies(species);
    setDeleteModel(true);
  };

  const handleDelete = (species) => {
    deleteSpecies(species);
  };

  useEffect(() => {
    fetchRecentSpecies();
    const interval = setInterval(fetchRecentSpecies, 20000);

    return () => clearInterval(interval);
  }, []);

  // Use a simple custom delete modal instead of react-modal
  const DeleteModal = ({ isOpen, species, onClose, onDelete }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-center">Delete this species?</h2>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-center">
              Are you sure you would like to delete this species from the database? This action is permanent and cannot be reversed.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onDelete(species)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
            >
              Yes, Delete
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
            >
              No, Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col items-center h-[calc(100vh-4rem)] w-full transition-colors duration-500 overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
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
          <p className="text-lg mx-auto">Loading Archived Species Data...</p>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            {filteredSpeciesData.map((species, index) => (
              <div
                key={index}
                className={`flex w-full p-4 rounded-lg shadow-md transition-colors duration-500 cursor-pointer ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => openModal(species)}
              >
                <div className="flex w-full">
                  <div className="flex justify-between w-full">
                    <div className="flex items-col">
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
                      <div className="flex flex-col justify-center pl-4">
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
                      <FaTrash
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModel(species);
                        }}
                        className="mr-2 ml-2 z-10 cursor-pointer hover:text-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedSpecies && !deleteModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Species Details"
          className={`lg:rounded-lg shadow-lg p-6 xl:w-2/5 h-full sm:h-5/6 mx-auto flex flex-col justify-between transition-colors duration-500 custom-scrollbar border-2 ${
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
      
      {/* Custom delete modal that doesn't use react-modal */}
      <DeleteModal 
        isOpen={deleteModel}
        species={selectedSpecies}
        onClose={closeModal}
        onDelete={handleDelete}
      />
      
      <ToastContainer />
    </div>
  );
}

export default Archive;