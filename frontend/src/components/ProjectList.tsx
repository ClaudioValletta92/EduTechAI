import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { truncateText } from "./HelperFunction";
import AddProjectCard from "./AddProjectButton";

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
      <h2 className="text-center text-2xl font-semibold my-6 text-[#adbbc4]">
        I tuoi spazi di lavoro
      </h2>
      {/* ✅ Pass fetchProjects to AddProjectButton so it can refresh the list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {projects.map((project) => (
          <div
            key={project.pk}
            className="relative border border-gray-300 rounded-lg p-4 bg-white shadow-lg cursor-pointer hover:bg-gray-100 transition-all duration-300 overflow-hidden"
            style={{
              minHeight: "300px", // Set the minimum height of the card
            }}
            onClick={() => onSelectProject(project)} // Click to show details
          >
            {/* Background image with hover darkening */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: project.fields.background_image
                  ? `url(http://localhost:8000${project.fields.background_image})`
                  : "none",
              }}
            >
              {/* Hover effect to darken only the background image */}
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            {/* Text overlay at the bottom right of the card */}
            <div
              className="absolute bottom-4 right-4 p-4 bg-black bg-opacity-70 text-white rounded-md"
              style={{
                maxWidth: "80%", // Ensure text doesn't overflow
              }}
            >
              <h3 className="text-lg font-semibold text-[#adbbc4]">
                {project.fields.title}
              </h3>
              <p className="text-sm text-[#adbbc4]">
                {truncateText(project.fields.description, 20)}
              </p>
            </div>
          </div>
        ))}
        <AddProjectCard onProjectCreated={fetchProjects} />
      </div>
    </div>
  );
}

export default ProjectsList;
