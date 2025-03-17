import React, { useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";

export const SpeciesCard = ({ species, onClick, onDelete, onArchive }) => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <div 
      className={`card card-hover flex w-full p-4 border-l-4 ${
        darkMode 
          ? "bg-gray-700 border-green text-white" 
          : "bg-white border-green text-gray-900"
      }`}
      onClick={() => onClick(species)}
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
          <div className="flex items-center">
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(species);
                }}
                className={`p-2 rounded-full mr-2 transition-colors duration-300 ${
                  darkMode 
                    ? "hover:bg-gray-600 text-gray-300" 
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title="Archive Species"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(species);
                }}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  darkMode 
                    ? "hover:bg-gray-600 text-gray-300" 
                    : "hover:bg-gray-200 text-gray-600"
                }`}
                title="Delete Species"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const InfoCard = ({ title, children, className = "" }) => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <div className={`card overflow-hidden h-full transition-colors duration-500 ${
      darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
    } ${className}`}>
      <div className={`p-3 border-b ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const ContentPanel = ({ title, children, className = "" }) => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <div className={`p-4 rounded-lg mb-4 ${
      darkMode ? "bg-gray-800" : "bg-gray-100"
    } ${className}`}>
      {title && (
        <h4 className="font-medium mb-2">{title}</h4>
      )}
      {children}
    </div>
  );
};

export const ModelCard = ({ title, icon, onClick, className = "" }) => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <button
      className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center card card-hover ${
        darkMode 
          ? "bg-gray-700 hover:bg-gray-600 border border-gray-600" 
          : "bg-white hover:bg-gray-100 border border-gray-200"
      } ${className}`}
      onClick={onClick}
    >
      <div className={`rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center ${
        darkMode ? "bg-green text-white" : "bg-green text-white"
      }`}>
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className={`text-xs mt-1 ${
        darkMode ? "text-gray-400" : "text-gray-500"
      }`}>View 3D Model</p>
    </button>
  );
};

export const SkeletonCard = () => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <div className={`card flex w-full p-4 animate-pulse ${
      darkMode ? "bg-gray-700" : "bg-white"
    }`}>
      <div className={`w-32 h-32 rounded-md mr-4 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
      <div className="flex-1">
        <div className={`h-6 w-48 rounded mb-3 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        <div className={`h-4 w-32 rounded mb-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        <div className={`h-4 w-40 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
      </div>
    </div>
  );
};

export default { 
  SpeciesCard, 
  InfoCard, 
  ContentPanel, 
  ModelCard, 
  SkeletonCard 
};