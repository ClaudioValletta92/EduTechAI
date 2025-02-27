import React, { useState, useEffect } from "react";
import Modal from "./Modal";

function AddProjectButton({ onProjectCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [project, setProject] = useState({
    title: "",
    description: "",
  });

  const [presetImages, setPresetImages] = useState([]);
  const [blendedImages, setBlendedImages] = useState([]);

  useEffect(() => {
    if (showForm) {
      fetchBackgroundImages();
    }
  }, [showForm]);

  const fetchBackgroundImages = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/available-backgrounds/");
      if (response.ok) {
        const data = await response.json();
        const presets = data.filter((image) => image.type === "preset");
        const blended = data.filter((image) => image.type === "blended");

        setPresetImages(presets);
        setBlendedImages(blended);
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
      // Check if the selected background is preset or blended
      const background = project.backgroundPreset || project.backgroundBlended;
  
      const response = await fetch("http://localhost:8000/api/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          background: background,  // Add the selected background image (preset or blended)
        }),
      });
      
      if (response.ok) {
        alert("Project created successfully!");
        setProject({
          title: "",
          description: "",
          backgroundPreset: "",  // Reset selected preset background
          backgroundBlended: "",  // Reset selected blended background
        });
        setShowForm(false);
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

  const handleSelectBackground = (image) => {
    setProject((prev) => ({ ...prev, backgroundPreset: image.name }));
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
        <div className="modal-content max-h-[90vh] overflow-y-auto p-4">
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
              <label htmlFor="description" className="block font-medium text-gray-700">
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

            {/* Preset Images Section */}
            <div>
              <label htmlFor="backgroundPreset" className="block font-medium text-gray-700">
                Preset Background Images:
              </label>
              <div className="max-h-48 overflow-y-auto mt-2 grid grid-cols-3 gap-4">
                {presetImages.map((image) => (
                  <div
                    key={image.name}
                    className="cursor-pointer relative"
                    onClick={() => handleSelectBackground(image)}
                  >
                    <img
                      src={`http://localhost:8000${image.image_url}`}
                      alt={image.name}
                      className={`w-32 h-32 object-cover rounded-md transition-all duration-200 ${
                        project.backgroundPreset === image.name ? "border-4 border-blue-500" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Blended Images Section */}
            <div>
              <label htmlFor="backgroundPreset" className="block font-medium text-gray-700">
                Blended Background Images:
              </label>
              <div className="max-h-48 overflow-y-auto mt-2 grid grid-cols-3 gap-4">
                {blendedImages.map((image) => (
                  <div
                    key={image.name}
                    className="cursor-pointer relative"
                    onClick={() => handleSelectBackground(image)}
                  >
                    <img
                      src={`http://localhost:8000${image.image_url}`}
                      alt={image.name}
                      className={`w-32 h-32 object-cover rounded-md transition-all duration-200 ${
                        project.backgroundPreset === image.name ? "border-4 border-blue-500" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

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
        </div>
      </Modal>
    </div>
  );
}

export default AddProjectButton;
