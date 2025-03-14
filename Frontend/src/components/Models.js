import React, { useState, useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";
import { FaCube, FaTimes } from "react-icons/fa";

const insectData = [
  { name: "Box Tree Moth", modelId: "2949ae402083404ca44d0443b4304790" },
  { name: "Northern Hornet", modelId: "4115611dc93443099e8ecf17623aa533" },
  { name: "Spotted Lanternfly", modelId: "59121bc98ec04bd6a7b735180b6c6a76" },
  { name: "Japanese Beetle", modelId: "4dbca70bdfde4408ab0ab7adcbf6b74a" },
  { name: "Stink Bugs", modelId: "111a0a13b8cd45e286055b9c8f5fd883" },
  { name: "Ant", modelId: "7e72cde969c34b6b8a25d840bd5c9a6f" },
  { name: "Bumble Bee", modelId: "95f06a2ac6184acc808db8aba10fb65b" },
  { name: "Ladybug", modelId: "7ab6a0f4e41746fb92963d1d135e698d" },
  { name: "Monarch Butterfly", modelId: "d642db74a3fa491a8143bd088b408094" },
  { name: "Wolf Spider", modelId: "6392e4cfb64d407182fdad2cea9e0abe" },
];

const InsectCards = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={`flex flex-col items-center min-h-[calc(100vh-4rem)] w-full p-6 transition-colors duration-500 ${
      darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Insect 3D Models</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {insectData.map((insect, index) => (
            <button
              key={index}
              className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center card card-hover ${
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600" 
                  : "bg-white hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setSelectedModel(insect.modelId)}
            >
              <div className={`rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center ${
                darkMode ? "bg-green text-white" : "bg-light-green text-green"
              }`}>
                <FaCube size={24} />
              </div>
              <h2 className="text-lg font-semibold">{insect.name}</h2>
              <p className={`text-xs mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>View 3D Model</p>
            </button>
          ))}
        </div>
      </div>
      
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[80vh] bg-black rounded-lg overflow-hidden">
            <button
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={() => setSelectedModel(null)}
            >
              <FaTimes />
            </button>
            <iframe
              title="3D Model Viewer"
              src={`https://sketchfab.com/models/${selectedModel}/embed`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InsectCards;