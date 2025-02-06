import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UploadSection from "./components/UploadSection";
import ProjectsList from "./components/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flex: 1,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "1rem",
    background: "#fff",
  };

  return (
    <div style={containerStyle}>
      <Header />

      <div style={contentStyle}>
        <Sidebar />

        {/* Conditionally render ProjectList or ProjectDetail */}
        <main style={mainStyle}>
          <h1>Welcome to EdutechAI!</h1>
          <p>This is your main content area.</p>

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
