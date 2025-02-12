import { useState } from "react";

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

  return (
    <div className="flex flex-col items-center h-screen w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Insect 3D Models</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {insectData.map((insect, index) => (
          <button
            key={index}
            className="p-4 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition"
            onClick={() => setSelectedModel(insect.modelId)}
          >
            <h2 className="text-lg font-semibold">{insect.name}</h2>
          </button>
        ))}
      </div>
      {selectedModel && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-4/5 h-4/5">
            <button
              className="absolute top-2 right-2 bg-white p-2 rounded-full"
              onClick={() => setSelectedModel(null)}
            >
              ❌
            </button>
            <iframe
              title="3D Model Viewer"
              src={`https://sketchfab.com/models/${selectedModel}/embed`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InsectCards;
