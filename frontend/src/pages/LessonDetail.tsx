import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function LessonDetail() {
  const { lessonId } = useParams();

  // Styles
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };

  const contentStyle = {
    display: "flex",
    flex: 1,
  };

  const mainStyle = {
    flex: 1,
    padding: "1rem",
    background: "#fff",
  };

  return (
    <div style={containerStyle}>
      <Header />

      <div style={contentStyle}>
        <Sidebar />

        {/* Main content */}
        <main style={mainStyle}>
          <h2>Lesson {lessonId}</h2>
          <button
            style={{
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "5px",
              fontSize: "1rem",
            }}
          >
            ➕ Add Resource
          </button>
        </main>
      </div>
    </div>
  );
}

export default LessonDetail;
