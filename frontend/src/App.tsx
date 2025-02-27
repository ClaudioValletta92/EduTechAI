import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UploadSection from "./components/UploadSection";
import ProjectsList from "./components/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import LessonDetail from "./pages/LessonDetail";

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);  // Track selected lesson

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        <Sidebar />
        {/* Conditionally render ProjectList, ProjectDetail, or LessonDetail */}
        <main className="flex-1">
          {selectedProject && !selectedLesson ? (
            <ProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onSelectLesson={setSelectedLesson}
            />
          ) : selectedLesson ? (
            <LessonDetail
              lesson={selectedLesson}
              project={selectedProject}  // Pass project to LessonDetail
              onBack={() => setSelectedLesson(null)}
            />
          ) : (
            <ProjectsList onSelectProject={setSelectedProject} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
