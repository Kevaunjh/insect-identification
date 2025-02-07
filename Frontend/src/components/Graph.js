import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Graph = () => {
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
        fill: false,
        borderColor: "#4A90E2",
        tension: 0.1,
        pointRadius: 5,
        pointBackgroundColor: "#4A90E2",
      },
    ],
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full p-4">
      <div className="w-3/4 flex items-center justify-center p-4 border-r border-gray-300">
        {dataLoading ? (
          <p className="text-center">Loading...</p>
        ) : speciesData.length > 0 ? (
          <div className="w-full">
            <Line data={chartData} />
          </div>
        ) : (
          <p className="text-center">
            There is no available data for this species. Send the rover out to
            find some!
          </p>
        )}
      </div>
      <div className="w-1/4 flex flex-col gap-4 p-4 overflow-y-auto">
        {loading ? (
          <p className="text-center">Loading species...</p>
        ) : speciesList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
            {speciesList.map((species) => (
              <button
                key={species.name}
                className="flex flex-col items-center"
                onClick={() => setSelectedSpecies(species.name)}
              >
                <img
                  src={species.image || "placeholder.jpg"}
                  alt={species.name}
                  className="w-20 h-20 object-cover rounded-md border-2 border-gray-300 hover:border-blue-500"
                />
                <p className="mt-2 text-sm font-semibold">{species.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center">No species found</p>
        )}
      </div>
    </div>
  );
};

export default Graph;
