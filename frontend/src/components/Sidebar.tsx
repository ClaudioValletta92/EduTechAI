import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, User, Settings, HelpCircle } from "lucide-react"; // Import icons
import { truncateText } from "./HelperFunction";
import axios from "axios"; // Import axios

function Sidebar() {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // State to store the current user

  // Fetch projects
  const fetchProjects = () => {
    fetch("http://localhost:8000/api/projects/")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error fetching projects:", error));
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/auth/current-user/",
        {
          withCredentials: true, // Include cookies for authentication
        }
      );
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCurrentUser(); // Fetch the current user when the component mounts
  }, []);

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

  const projectCardStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "60px", // Smaller height for compact cards
    borderRadius: "5px",
    borderWidth: "1px",
    borderColor: "adbbc4",
    overflow: "hidden",
    marginBottom: "8px",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const projectTextOverlayStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    padding: "4px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#adbbc4",
    borderRadius: "4px",
    fontSize: "12px",
  };

  return (
    <aside style={sidebarStyle}>
      {/* Display the current user's username */}
      {currentUser && (
        <div style={{ marginBottom: "1rem", color: "#adbbc4" }}>
          Welcome, <strong>{currentUser.username}</strong>
        </div>
      )}

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
      <p>Spazi di lavoro</p>

      {/* Spazi di lavoro section */}
      <div>
        {projects.map((project) => (
          <div
            key={project.pk}
            style={{
              ...projectCardStyle,
              backgroundImage: project.fields.background_image
                ? `url(http://localhost:8000${project.fields.background_image})`
                : "none",
            }}
          >
            <div style={projectTextOverlayStyle}>
              <h3>{truncateText(project.fields.title, 15)}</h3>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
