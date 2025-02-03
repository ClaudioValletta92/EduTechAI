// src/components/Header.tsx
import React from "react";

function Header() {
  // Example inline style — replace or move to CSS as you prefer
  const headerStyle: React.CSSProperties = {
    height: "60px",
    background: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
  };

  const profileStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#999", // placeholder color
  };

  return (
    <header style={headerStyle}>
      <h2>EdutechAI</h2>

      {/* Placeholder profile image */}
      <div style={profileStyle} title="Profile Image" />
    </header>
  );
}

export default Header;
