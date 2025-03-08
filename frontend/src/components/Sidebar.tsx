import React from "react";
import { Link } from "react-router-dom";
import { Home, User, Settings, HelpCircle } from "lucide-react"; // Import icons

function Sidebar() {
  const sidebarStyle: React.CSSProperties = {
    width: "200px",
    background: "#1d2125",
    padding: "1rem",
    color: "#adbbc4", // Text color
  };

  const navListStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
  };

  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#adbbc4",
    textDecoration: "none",
    padding: "8px 0",
  };

  return (
    <aside style={sidebarStyle}>
      <ul style={navListStyle}>
        <li>
          <Link to="/" style={linkStyle}>
            <Home size={18} color="#adbbc4" /> Home
          </Link>
        </li>
        <li>
          <Link to="/profile" style={linkStyle}>
            <User size={18} color="#adbbc4" /> Profile
          </Link>
        </li>
      </ul>

      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "1rem",
          background: "none",
          border: "none",
          color: "#adbbc4",
          cursor: "pointer",
        }}
      >
        <Settings size={18} color="#adbbc4" /> Settings
      </button>

      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "0.5rem",
          background: "none",
          border: "none",
          color: "#adbbc4",
          cursor: "pointer",
        }}
      >
        <HelpCircle size={18} color="#adbbc4" /> Help
      </button>

      <hr
        style={{
          marginTop: "1.5rem",
        }}
      />
      <p>Recent</p>
    </aside>
  );
}

export default Sidebar;
