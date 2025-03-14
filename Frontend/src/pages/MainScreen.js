import React, { useState, useContext, useEffect } from "react";
import Home from "../components/Home";
import Recent from "../components/Recent";
import Archive from "../components/Archive";
import Species from "../components/Species";
import Maps from "../components/Maps";
import Models from "../components/Models";
import Graph from "../components/Graph";
import {
  FaSync,
  FaBars,
  FaSun,
  FaMoon,
  FaHome,
  FaBug,
  FaClock,
  FaMap,
  FaArchive,
  FaCube,
  FaChartLine,
  FaTimes
} from "react-icons/fa";
import { DarkModeContext } from "../context/DarkModeContext";

function MainScreen() {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update isMobile state when window is resized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Home":
        return <Home />;
      case "Species":
        return <Species />;
      case "Recent":
        return <Recent />;
      case "Map":
        return <Maps />;
      case "Archive":
        return <Archive />;
      case "Models":
        return <Models />;
      case "Graph":
        return <Graph />;
      default:
        return <Home />;
    }
  };

  const NavItem = ({ icon, label, tabName }) => (
    <li
      className={`flex items-center cursor-pointer rounded-md px-6 py-3 mb-1 transition-all duration-300 ${
        selectedTab === tabName
          ? darkMode
            ? "bg-green text-white font-medium shadow-md" 
            : "bg-green text-white font-medium shadow-sm"
          : darkMode 
            ? "text-gray-100 hover:bg-gray-700" 
            : "text-gray-800 hover:bg-[#0a6e36] hover:text-white"
      }`}
      onClick={() => handleTabChange(tabName)}
    >
      {icon && <span className="mr-3 text-xl">{icon}</span>}
      <span>{label}</span>
    </li>
  );
  
  // Width of the sidebar - used to calculate the margin of main content
  const sidebarWidth = 250;
  
  return (
    <div className={`relative h-screen w-screen transition-colors duration-500 overflow-hidden ${
      darkMode ? "bg-gray-900 text-white" : "bg-[#f0f8f1] text-gray-900"
    }`}>
      {/* Header */}
      <header
        className={`h-16 flex justify-between items-center px-4 md:px-6 shadow-md z-10 transition-colors duration-500 ${
          darkMode ? "bg-green text-light-green" : "bg-green text-white"
        }`}
      >
        <div className="flex items-center">
          <button 
            className="mr-4 p-2 rounded-full hover:bg-opacity-20 hover:bg-black transition-colors duration-300"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold truncate">Invasive Species Identification</h1>
            <div className="text-xs md:text-sm opacity-80">Capstone Project</div>
          </div>
        </div>
        
        <button
          className="p-2 rounded-full hover:bg-opacity-20 hover:bg-black transition-colors duration-300"
          onClick={handleDarkModeToggle}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
        </button>
      </header>

      {/* Sidebar */}
      <div 
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-opacity-95 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out z-30 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4">
          <div className="flex flex-col space-y-1">
            <NavItem icon={<FaHome />} label="Home" tabName="Home" />
            <NavItem icon={<FaBug />} label="Species" tabName="Species" />
            <NavItem icon={<FaClock />} label="Recent" tabName="Recent" />
            <NavItem icon={<FaMap />} label="Map" tabName="Map" />
            <NavItem icon={<FaArchive />} label="Archive" tabName="Archive" />
            <NavItem icon={<FaCube />} label="Models" tabName="Models" />
            <NavItem icon={<FaChartLine />} label="Graphs" tabName="Graph" />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={handleSidebarToggle}
        ></div>
      )}

      {/* Main content - adjust margin when sidebar is open on desktop */}
      <main 
        className={`relative h-[calc(100vh-4rem)] overflow-auto z-0 transition-all duration-300 ${
          // Only add margin on desktop when sidebar is open
          (sidebarOpen && !isMobile) ? `ml-[${sidebarWidth}px]` : 'ml-0'
        }`}
        style={{
          // Use inline style to ensure exact pixel value is applied
          marginLeft: (sidebarOpen && !isMobile) ? `${sidebarWidth}px` : '0'
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
}

export default MainScreen;