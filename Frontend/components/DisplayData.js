import React, { useEffect, useState } from "react";
import { fetchData } from "../services/api";

const DisplayData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchData();
      setData(fetchedData || []); // Ensure data is an array
    };
    getData();
  }, []);

  return (
    <div>
      <h1>Insect Identification Data</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <strong>Species:</strong> {item.name} <br />
            <strong>Location:</strong> {item.location} <br />
            <strong>Date Detected:</strong> {item.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisplayData;
