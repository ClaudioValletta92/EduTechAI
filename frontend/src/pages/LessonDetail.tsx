import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection"; // Import UploadSection

function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "1rem", background: "#fff" }}>
          <h2>Lesson {lessonId}</h2>

          {/* UploadSection as a button that opens the modal */}
          <UploadSection lessonId={parseInt(lessonId)} />
        </main>
      </div>
    </div>
  );
}

export default LessonDetail;
