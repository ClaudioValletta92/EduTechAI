// src/components/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom"; // using React Router for navigation
import AddProjectButton from "./AddProjectButton"; // adjust the path if needed

function Sidebar() {
  // Inline styles (you can replace these with your CSS)
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
      {/* Reusable AddProjectButton component */}
      <button style={{ display: "block", marginTop: "1rem" }}>Settings</button>
      <button style={{ display: "block", marginTop: "0.5rem" }}>Help</button>
      <hr />
      Your last opened things
      {/* AddProjectButton component */}
      {/* Existing sidebar buttons */}
    </aside>
  );
}

export default Sidebar;
