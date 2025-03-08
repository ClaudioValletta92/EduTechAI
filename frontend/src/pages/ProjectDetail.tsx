import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { Plus } from "lucide-react"; // Import the Plus icon

function ProjectDetail({ project, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: "" });

  useEffect(() => {
    console.log(`Fetching lessons for project ID: ${project.pk}`);

    fetch(`http://localhost:8000/api/projects/${project.pk}/lessons/`)
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched lessons data:", data);
        setLessons(data);
      })
      .catch((error) => {
        console.error("Error fetching lessons:", error);
      });
  }, [project.pk]);

  const handleAddLessonClick = () => {
    setShowModal(true);
  };

  const handleChange = (e) => {
    setNewLesson({ ...newLesson, title: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/api/projects/${project.pk}/lessons/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newLesson, project: project.pk }),
        }
      );

      if (response.ok) {
        const createdLesson = await response.json();
        setLessons([...lessons, createdLesson]);
        setNewLesson({ title: "" });
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert("Error adding lesson: " + errorData.message);
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      alert("There was an error adding the lesson.");
    }
  };

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: project.fields.background_image
          ? `url(http://localhost:8000${project.fields.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderLeft: "1px solid #adbbc4", // Add this line for the left border
      }}
    >
      {/* Dark overlay for background image */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-10 p-6">
        <button
          onClick={onBack}
          className="mb-4 text-white hover:text-blue-600 transition-all"
        >
          ← Back to Projects
        </button>

        {/* Project Title Section */}
        <div
          className="bg-black bg-opacity-50 text-white p-6 mb-6 rounded-lg"
          style={{
            maxWidth: "100%",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h2 className="text-3xl font-semibold">
            {project.fields.title} - Lessons
          </h2>
        </div>

        {/* Lessons List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Render Lessons */}
          {lessons.map((lesson) => (
            <div
              key={lesson.pk}
              className="bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Link
                to={`/lessons/${lesson.pk}`}
                state={{ project }} // ✅ Pass the project as state
                className="block text-blue-600 hover:text-blue-800 transition-all"
              >
                <h3 className="text-lg font-semibold">{lesson.fields.title}</h3>
              </Link>
            </div>
          ))}

          {/* Add New Lesson Button (placed after the lessons) */}
          <button
            onClick={handleAddLessonClick}
            className="flex items-center justify-center bg-white p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-blue-600"
          >
            <Plus className="w-6 h-6 mr-2" />
            <span>Crea Nuova Lezione</span>
          </button>
        </div>

        {/* Modal for Adding a New Lesson */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-semibold mb-4">Add New Lesson</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block font-medium text-gray-700"
              >
                Lesson Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newLesson.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Create Lesson
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default ProjectDetail;
