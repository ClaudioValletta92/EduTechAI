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
    <div>
      <button onClick={onBack} style={{ marginBottom: "10px" }}>
        ← Back to Projects
      </button>
      <h2>{project.fields.title} - Lessons</h2>
      <button onClick={handleAddLessonClick} style={{ marginBottom: "10px" }}>
        ➕ Add Lesson
      </button>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.pk}>
            <Link to={`/lessons/${lesson.pk}`}>{lesson.fields.title}</Link>
          </li>
        ))}
      </ul>

      {/* Modal for Adding a New Lesson */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2>Add New Lesson</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="title">Lesson Title:</label>
            <br />
            <input
              type="text"
              id="title"
              name="title"
              value={newLesson.title}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Create Lesson</button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectDetail;
