import React, { useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";

export const PrimaryButton = ({ onClick, children, className = "", icon }) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-primary flex items-center justify-center ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const SecondaryButton = ({ onClick, children, className = "", icon }) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-secondary flex items-center justify-center ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const DangerButton = ({ onClick, children, className = "", icon }) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-danger flex items-center justify-center ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const SuccessButton = ({ onClick, children, className = "", icon }) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-success flex items-center justify-center ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const IconButton = ({ onClick, icon, title, className = "" }) => {
  const { darkMode } = useContext(DarkModeContext);
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-full transition-all duration-300 
      hover:shadow-md active:scale-95 flex items-center justify-center ${
        darkMode
          ? "bg-gray-700 text-white hover:bg-gray-600" 
          : "bg-white text-gray-800 hover:bg-gray-100"
      } ${className}`}
    >
      {icon}
    </button>
  );
};

export default { PrimaryButton, SecondaryButton, DangerButton, SuccessButton, IconButton };