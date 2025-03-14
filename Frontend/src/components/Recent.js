import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import { DarkModeContext } from "../context/DarkModeContext";
import { FaBox, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PrimaryButton, SecondaryButton, DangerButton } from "./Button";
import { SpeciesCard, SkeletonCard } from "./Card";

function Species() {
  const { darkMode } = useContext(DarkModeContext);
  const [recentSpeciesData, setRecentSpeciesData] = useState([]);
  const [filteredSpeciesData, setFilteredSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [confirmationModel, setConfirmationModel] = useState(false);
  const [deleteModel, setDeleteModel] = useState(false);

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
      toast.error("Failed to fetch species data");
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

  const openConfirmationModel = (species) => {
    setSelectedSpecies(species);
    setConfirmationModel(true);
  };

  const openDeleteModel = (species) => {
    setSelectedSpecies(species);
    setDeleteModel(true);
  };

  const handleDelete = (species) => {
    deleteSpecies(species);
  };

  const handleSaveToArchives = (species) => {
    saveToArchives(species);
  };

  const saveToArchives = (species) => {
    deleteSpecies(species);

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
      longitude: species.longitude,
      latitude: species.latitude,
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
      .then((data) => {
        console.log("Data successfully archived:", data);
        toast.success("Species successfully archived!");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to archive species");
      });
  };

  const deleteSpecies = (species) => {
    setSelectedSpecies(null);
    setDeleteModel(false);

    fetch("http://127.0.0.1:5000/api/delspecies", {
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
  
  return (
    <div
      className={`flex flex-col items-center h-[calc(100vh-4rem)] w-full transition-colors duration-500 overflow-y-auto fade-in ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="w-full p-4 sticky top-0 z-10 backdrop-blur-sm">
        <input
          type="text"
          value={filterText}
          onChange={handleFilterChange}
          placeholder="Filter by species name..."
          className={`w-full p-3 rounded-lg shadow-sm border focus:outline-none focus:ring-2 transition-all ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white focus:ring-green"
              : "bg-white border-gray-300 text-black focus:ring-light-green"
          }`}
        />
      </div>
      
      <div className="flex h-full w-full p-4 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col w-full space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            {filteredSpeciesData.length > 0 ? (
              filteredSpeciesData.map((species, index) => (
                <div key={index} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <SpeciesCard 
                    species={species} 
                    onClick={openModal}
                    onArchive={openConfirmationModel}
                    onDelete={openDeleteModel}
                  />
                </div>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-xl font-medium mb-4">No species found</p>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search filter or check back later
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Species Details Modal */}
      {selectedSpecies && !confirmationModel && !deleteModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Species Details"
          className={`rounded-lg shadow-xl p-6 md:w-4/5 lg:w-3/5 xl:w-2/5 max-h-[90vh] mx-auto flex flex-col justify-between transition-all duration-500 custom-scrollbar border ${
            darkMode
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm z-50"
        >
          <div className="space-y-4 overflow-y-auto">
            <div className="h-64 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {selectedSpecies.image ? (
                <img
                  src={`data:image/jpeg;base64,${selectedSpecies.image}`}
                  alt={selectedSpecies.name}
                  className="h-64 object-contain"
                />
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No Image
                </p>
              )}
            </div>
            
            <h2 className="text-2xl font-bold">{selectedSpecies.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <p><strong>Species:</strong> {selectedSpecies.scientific_name || "N/A"}</p>
                <p><strong>Habitat:</strong> {selectedSpecies.habitat || "N/A"}</p>
                <p><strong>Date:</strong> {selectedSpecies.date || "N/A"}</p>
                <p><strong>Time:</strong> {selectedSpecies.time || "N/A"}</p>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <p><strong>Temperature:</strong> {selectedSpecies.temperature || "N/A"}</p>
                <p><strong>Light:</strong> {selectedSpecies.light || "N/A"}</p>
                <p><strong>Heat:</strong> {selectedSpecies.heat || "N/A"}</p>
                {selectedSpecies.latitude && (
                  <p><strong>Location:</strong> {selectedSpecies.latitude.toFixed(6)}, {selectedSpecies.longitude.toFixed(6)}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <PrimaryButton onClick={closeModal}>
              Close
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Archive Confirmation Modal */}
      {confirmationModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Archive Confirmation"
          className={`rounded-lg shadow-xl p-6 md:w-4/5 lg:w-3/5 xl:w-2/5 mx-auto flex flex-col justify-between transition-all duration-500 border ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm z-50"
        >
          <div className="flex flex-col items-center space-y-6">
            <h1 className={`text-xl font-bold text-center ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              Archive Confirmation
            </h1>
            
            <div className={`w-full rounded-lg p-6 flex items-center justify-center text-center ${
              darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"
            }`}>
              <p>Are you sure you would like to archive <strong>{selectedSpecies.name}</strong>?</p>
            </div>
            
            <div className="flex justify-center gap-4 w-full">
              <PrimaryButton 
                onClick={() => handleSaveToArchives(selectedSpecies)}
                className="px-6"
              >
                Yes, Archive
              </PrimaryButton>
              
              <SecondaryButton 
                onClick={closeModal}
                className="px-6"
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModel && (
        <Modal
          isOpen={!!selectedSpecies}
          onRequestClose={closeModal}
          contentLabel="Delete Confirmation"
          className={`rounded-lg shadow-xl p-6 md:w-4/5 lg:w-3/5 xl:w-2/5 mx-auto flex flex-col justify-between transition-all duration-500 border ${
            darkMode
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-200"
          }`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm z-50"
        >
          <div className="flex flex-col items-center space-y-6">
            <h1 className={`text-xl font-bold text-center ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              Delete Species
            </h1>
            
            <div className={`w-full rounded-lg p-6 flex items-center justify-center text-center ${
              darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"
            }`}>
              <p>
                Are you sure you would like to delete <strong>{selectedSpecies.name}</strong> from the
                database? This action is permanent and cannot be reversed.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 w-full">
              <DangerButton 
                onClick={() => handleDelete(selectedSpecies)}
                className="px-6"
              >
                Yes, Delete
              </DangerButton>
              
              <SecondaryButton 
                onClick={closeModal}
                className="px-6"
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        </Modal>
      )}
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default Species;