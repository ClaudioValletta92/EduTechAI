import React, { useState, useEffect } from "react";
import Modal from "./Modal";

function AddProjectButton({ onProjectCreated }) {
  // State to control the display of the modal
  const [showForm, setShowForm] = useState(false);
  
  // State for the new project data
  const [project, setProject] = useState({
    title: "",
    description: "",
    backgroundType: "preset", // Default background type
    backgroundPreset: "",     // For preset images
    gradientStart: "",        // For gradient start color
    gradientEnd: "",          // For gradient end color
  });

  // State to store available preset background images
  const [backgroundImages, setBackgroundImages] = useState([]);

  // Fetch background images from the API when the modal is opened
  useEffect(() => {
    if (showForm) {
      fetchBackgroundImages();
    }
  }, [showForm]);

  const fetchBackgroundImages = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/backgrounds/");
      if (response.ok) {
        const data = await response.json();
        setBackgroundImages(data);  // Assuming the response is an array of background images
      } else {
        console.error("Failed to fetch background images");
      }
    } catch (error) {
      console.error("Error fetching background images:", error);
    }
  };

  const handleAddProjectClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });
      if (response.ok) {
        alert("Project created successfully!");
        setProject({
          title: "",
          description: "",
          backgroundType: "preset",
          backgroundPreset: "",
          gradientStart: "",
          gradientEnd: "",
        });
        setShowForm(false);
        // Call the callback to refresh the projects list
        if (onProjectCreated) {
          onProjectCreated();
        }
      } else {
        const errorData = await response.json();
        alert("Error creating project: " + errorData.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("There was an error creating the project.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <button
        onClick={handleAddProjectClick}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all"
      >
        Add Project
      </button>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block font-medium text-gray-700">
              Title:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={project.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block font-medium text-gray-700"
            >
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={project.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="backgroundType" className="block font-medium text-gray-700">
              Background Type:
            </label>
            <select
              id="backgroundType"
              name="backgroundType"
              value={project.backgroundType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preset">Preset Image</option>
              <option value="color">Color Gradient</option>
            </select>
          </div>

          {project.backgroundType === "preset" && (
            <div>
              <label htmlFor="backgroundPreset" className="block font-medium text-gray-700">
                Background Preset Image:
              </label>
              <select
                id="backgroundPreset"
                name="backgroundPreset"
                value={project.backgroundPreset}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a background image</option>
                {backgroundImages.map((image) => (
                  <option key={image.id} value={image.name}>
                    {image.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {project.backgroundType === "color" && (
            <div>
              <label htmlFor="gradientStart" className="block font-medium text-gray-700">
                Gradient Start Color:
              </label>
              <input
                type="color"
                id="gradientStart"
                name="gradientStart"
                value={project.gradientStart}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {project.backgroundType === "color" && (
            <div>
              <label htmlFor="gradientEnd" className="block font-medium text-gray-700">
                Gradient End Color:
              </label>
              <input
                type="color"
                id="gradientEnd"
                name="gradientEnd"
                value={project.gradientEnd}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Create Project
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AddProjectButton;
