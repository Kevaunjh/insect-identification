import React from "react";
import MainScreen from "./pages/MainScreen";
import "./index.css";
import { DarkModeProvider } from "./context/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <MainScreen />
    </DarkModeProvider>
  );
}

export default App;
