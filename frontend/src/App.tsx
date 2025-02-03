// src/App.tsx
import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UploadSection from "./components/UploadSection";
// Optional: If you want nested routes, import { Outlet } from "react-router-dom";

function App() {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flex: 1,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "1rem",
    background: "#fff",
  };

  return (
    <div style={containerStyle}>
      <Header />

      <div style={contentStyle}>
        <Sidebar />

        {/* The main area where we can show content */}
        <main style={mainStyle}>
          <h1>Welcome to EdutechAI!</h1>
          <p>This is your main content areas.</p>
          <UploadSection />
        </main>
      </div>
    </div>
  );
}

export default App;
