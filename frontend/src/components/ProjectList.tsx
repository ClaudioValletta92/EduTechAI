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
    <div className="p-6">
      <h2 className="text-center text-2xl font-semibold my-6">Your Projects</h2>
      {/* ✅ Pass fetchProjects to AddProjectButton so it can refresh the list */}
      <AddProjectButton onProjectCreated={fetchProjects} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {projects.map((project) => (
          <div
            key={project.pk}
            className="border border-gray-300 rounded-lg p-4 bg-white shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSelectProject(project)} // Click to show details
          >
            <h3 className="text-lg font-semibold">{project.fields.title}</h3>
            <p className="text-gray-600">
              {truncateText(project.fields.description, 20)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsList;
