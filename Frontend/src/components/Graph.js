import React, { useEffect, useState, useContext } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { DarkModeContext } from "../context/DarkModeContext";

const Graph = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [speciesList, setSpeciesList] = useState([]);
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchSpeciesList = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/speciesinfo");
        if (!response.ok) throw new Error("Failed to fetch species list");
        const result = await response.json();
        if (result && Array.isArray(result) && result.length > 0) {
          const extractedSpecies = result.map((entry) => ({
            name: entry.name,
            image: entry.image,
          }));
          setSpeciesList(extractedSpecies);
          setSelectedSpecies(extractedSpecies[0].name);
        } else {
          console.error("Invalid species list response:", result);
        }
      } catch (error) {
        console.error("Error fetching species list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeciesList();
  }, []);

  useEffect(() => {
    if (!selectedSpecies) return;
    setDataLoading(true);
    const fetchSpeciesData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/alldata");
        if (!response.ok) throw new Error("Failed to fetch species data");
        const result = await response.json();
        if (result && Array.isArray(result)) {
          const filteredData = result.filter(
            (entry) => entry.name === selectedSpecies
          );

          const countByDate = filteredData.reduce((acc, entry) => {
            const date = new Date(entry.date).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          const sortedDates = Object.keys(countByDate).sort();
          const processedData = sortedDates.map((date) => ({
            date,
            count: countByDate[date],
          }));
          setSpeciesData(processedData);
        } else {
          console.error("Invalid species data response:", result);
        }
      } catch (error) {
        console.error("Error fetching species data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchSpeciesData();
    const interval = setInterval(fetchSpeciesData, 20000);
    return () => clearInterval(interval);
  }, [selectedSpecies]);

  const chartData = {
    labels: speciesData.map((entry) => entry.date),
    datasets: [
      {
        label: selectedSpecies,
        data: speciesData.map((entry) => entry.count),
        fill: true,
        backgroundColor: darkMode 
          ? 'rgba(74, 144, 226, 0.2)' 
          : 'rgba(74, 144, 226, 0.1)',
        borderColor: "#4A90E2",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#4A90E2",
        pointBorderColor: darkMode ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: darkMode ? '#ffffff' : '#4A90E2',
        pointHoverBorderColor: "#4A90E2",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Species Detection Over Time",
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20
        },
        color: darkMode ? '#e5e7eb' : '#111827',
      },
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          padding: 20,
          color: darkMode ? '#e5e7eb' : '#111827',
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(26, 32, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#e2e8f0' : '#4a5568',
        borderColor: darkMode ? '#2d3748' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: darkMode ? '#e5e7eb' : '#111827',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#111827',
        }
      },
      y: {
        title: {
          display: true,
          text: "Number Found",
          color: darkMode ? '#e5e7eb' : '#111827',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#111827',
        }
      },
    },
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] w-full transition-colors duration-500 ${
      darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold">Species Detection Trends</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualization of species detection frequency over time
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-3/4 flex items-center justify-center p-4">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-center">Loading chart data...</p>
            </div>
          ) : speciesData.length > 0 ? (
            <div className="w-full h-[500px] p-4">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-medium mb-2">No data available</p>
              <p className="text-gray-500 dark:text-gray-400">
                No data available for the current species. Please select another species or check back later.
              </p>
            </div>
          )}
        </div>
        
        <div className={`w-full md:w-1/4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}>
          <h2 className="text-lg font-medium mb-4 px-2">Select Species</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-center">Loading species...</p>
            </div>
          ) : speciesList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
              {speciesList.map((species) => (
                <button
                  key={species.name}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                    selectedSpecies === species.name
                      ? darkMode
                        ? "bg-green text-white"
                        : "bg-light-green text-green"
                      : darkMode
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedSpecies(species.name)}
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mb-2 border shadow-sm">
                    {species.image ? (
                      <img
                        src={species.image}
                        alt={species.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-center">{species.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No species found</p>
            </div>
          )}
          
          {speciesData.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className="font-medium mb-2">Statistics</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Total Detections:</span>
                  <span className="font-medium">{speciesData.reduce((sum, item) => sum + item.count, 0)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Average per Day:</span>
                  <span className="font-medium">
                    {(speciesData.reduce((sum, item) => sum + item.count, 0) / speciesData.length).toFixed(1)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>First Detection:</span>
                  <span className="font-medium">{speciesData[0]?.date}</span>
                </li>
                <li className="flex justify-between">
                  <span>Latest Detection:</span>
                  <span className="font-medium">{speciesData[speciesData.length - 1]?.date}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Graph;