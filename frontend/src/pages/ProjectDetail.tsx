// src/components/ProjectDetail.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

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
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 transition-all"
      >
        ← Back to Projects
      </button>
      <h2 className="text-3xl font-semibold mb-4">
        {project.fields.title} - Lessons
      </h2>
      <button
        onClick={handleAddLessonClick}
        className="mb-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-all"
      >
        ➕ Add Lesson
      </button>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.pk} className="flex justify-between items-center">
            <Link
              to={`/lessons/${lesson.pk}`}
              className="text-blue-600 hover:text-blue-800 transition-all"
            >
              {lesson.fields.title}
            </Link>
          </li>
        ))}
      </ul>

      {/* Modal for Adding a New Lesson */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl font-semibold mb-4">Add New Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block font-medium text-gray-700">
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
  );
}

export default ProjectDetail;
