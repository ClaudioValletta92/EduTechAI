import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
function ProjectDetail({ project, onBack }) {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/projects/${project.pk}/lessons/`)
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((error) => console.error("Error fetching lessons:", error));
  }, [project.pk]);

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: "10px" }}>
        ← Back to Projects
      </button>
      <h2>{project.fields.title} - Lessons</h2>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectDetail;
