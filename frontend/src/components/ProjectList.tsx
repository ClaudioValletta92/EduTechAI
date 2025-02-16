import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { truncateText } from "./HelperFunction";
import AddProjectButton from "./AddProjectButton";

function ProjectsList({ onSelectProject }) {
  const [projects, setProjects] = useState([]);

  // ✅ Define fetchProjects so it can be called inside the component
  const fetchProjects = () => {
    fetch("http://localhost:8000/api/projects/")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error fetching projects:", error));
  };

  // Load projects initially
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Your Projects</h2>
      {/* ✅ Pass fetchProjects to AddProjectButton so it can refresh the list */}
      <AddProjectButton onProjectCreated={fetchProjects} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {projects.map((project) => (
          <div
            key={project.pk}
            style={{
              border: "1px solid #ddd",
              padding: "16px",
              borderRadius: "8px",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={() => onSelectProject(project)} // Click to show details
          >
            <h3>{project.fields.title}</h3>
            <p>{truncateText(project.fields.description, 20)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsList;
