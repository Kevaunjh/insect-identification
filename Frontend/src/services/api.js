const BASE_URL = "http://127.0.0.1:5000";
export const fetchData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/data`);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
