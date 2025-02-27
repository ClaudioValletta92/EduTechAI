import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

function LessonDetail() {
  const { lessonId } = useParams();
  const location = useLocation();  // Access the state passed from the link
  const { project } = location.state || {};  // Extract the project data

  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Fetch the lesson details
    fetch(`http://localhost:8000/api/lessons/${lessonId}/`)
      .then((res) => res.json())
      .then((data) => setLesson(data))
      .catch((error) => console.error("Error fetching lesson:", error));

    // Fetch the resources for the lesson
    fetch(`http://localhost:8000/api/lessons/${lessonId}/resources`)
      .then((res) => res.json())
      .then((data) => setResources(data.resources))
      .catch((error) => console.error("Error fetching resources:", error));
  }, [lessonId]);

  return (
    <div
      style={{
        backgroundImage: project?.background_image
          ? `url(http://localhost:8000${project.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 p-6">
        {/* Lesson details content goes here */}
      </div>
    </div>
  );
}

export default LessonDetail;
