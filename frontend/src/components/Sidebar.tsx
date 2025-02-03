// src/components/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom"; // if using React Router

function Sidebar() {
  // Example inline style — you can replace with CSS
  const sidebarStyle: React.CSSProperties = {
    width: "200px",
    background: "#eee",
    padding: "1rem",
  };

  const navListStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
  };

  return (
    <aside style={sidebarStyle}>
      <h3>Menu</h3>
      <ul style={navListStyle}>
        <li>
          {/* If using React Router, Link to different routes */}
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>

      <hr />

      {/* Example placeholders for future buttons */}
      <button style={{ display: "block", marginTop: "1rem" }}>Settings</button>
      <button style={{ display: "block", marginTop: "0.5rem" }}>Help</button>
    </aside>
  );
}

export default Sidebar;
