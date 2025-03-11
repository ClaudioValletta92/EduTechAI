import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UploadSection from "./components/UploadSection";
import ProjectsList from "./components/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import axios from "axios";

// Configure Axios to include CSRF token
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true; // Include cookies for session-based auth

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-[#1d2125]">
      <div className="flex flex-1">
        <Sidebar />

        {/* Conditionally render ProjectList or ProjectDetail */}
        <main className="flex-1">
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
