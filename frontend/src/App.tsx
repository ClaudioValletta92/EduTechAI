import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UploadSection from "./components/UploadSection";
import ProjectsList from "./components/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        {/* Conditionally render ProjectList or ProjectDetail */}
        <main className="flex-1 p-4 bg-white">
          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
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
