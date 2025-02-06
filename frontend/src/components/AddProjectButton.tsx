// src/components/AddProjectButton.jsx
import React, { useState } from "react";
import Modal from "./Modal";

function AddProjectButton({ onProjectCreated }) {
  // State to control the display of the modal
  const [showForm, setShowForm] = useState(false);
  // State for the new project data
  const [project, setProject] = useState({
    title: "",
    description: "",
  });

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
        setProject({ title: "", description: "" });
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
      <button onClick={handleAddProjectClick}>Add Project</button>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="title">Title:</label>
            <br />
            <input
              type="text"
              id="title"
              name="title"
              value={project.title}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="description">Description:</label>
            <br />
            <textarea
              id="description"
              name="description"
              value={project.description}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Create Project</button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default AddProjectButton;
