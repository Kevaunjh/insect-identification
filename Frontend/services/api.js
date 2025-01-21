const BASE_URL = "http://127.0.0.1:5000"; // Backend URL

// Fetch all data from the backend
export const fetchData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/data`);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Add new data to the backend
export const addData = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to add data");
    return await response.json();
  } catch (error) {
    console.error("Error adding data:", error);
  }
};
