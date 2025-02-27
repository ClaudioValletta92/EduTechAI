import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import ResourceItem from "../components/ResourceItem";

function LessonDetail({ lesson, project, onBack }) {
  const { lessonId } = useParams();
  const [resources, setResources] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [conceptMap, setConceptMap] = useState(null);
  const [keyConcepts, setKeyConcepts] = useState(null);

  useEffect(() => {
    // Fetch lesson details if lesson is not passed directly
    if (!lesson) {
      fetch(`http://localhost:8000/api/lessons/${lessonId}/`)
        .then((res) => res.json())
        .then((data) => {
          setAnalyzed(data.analyzed);
        })
        .catch((error) => console.error("Error fetching lesson details:", error));
    }

    // Fetch lesson resources
    fetch(`http://localhost:8000/api/lessons/${lessonId}/resources`)
      .then((res) => res.json())
      .then((data) => {
        setResources(data.resources);
      })
      .catch((error) => console.error("Error fetching resources:", error));

    // Fetch conceptual map if analyzed
    if (analyzed) {
      fetch(`http://localhost:8000/api/lessons/${lessonId}/concept-map/`)
        .then((res) => res.json())
        .then((data) => {
          setConceptMap(data);
        })
        .catch((error) => console.error("Error fetching concept map:", error));

      fetch(`http://localhost:8000/api/lessons/${lessonId}/key-concept/`)
        .then((res) => res.json())
        .then((data) => {
          setKeyConcepts(data);
        })
        .catch((error) => console.error("Error fetching key concepts:", error));
    }
  }, [lessonId, analyzed]);

  const handleAnalyze = () => {
    fetch(`http://localhost:8000/api/lessons/${lessonId}/analyze/`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => setAnalyzed(true))
      .catch((error) => console.error("Error analyzing lesson:", error));
  };

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundImage: project?.background_image
          ? `url(http://localhost:8000${project.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for background image */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-10 flex flex-col flex-1 p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-white hover:text-blue-600 transition-all"
        >
          ← Back to Project
        </button>

        <Header />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "1rem", background: "#fff" }}>
            <h2>Lesson {lessonId}</h2>

            {/* Upload Section - Disabled if analyzed */}
            {!analyzed ? (
              <UploadSection lessonId={parseInt(lessonId)} />
            ) : (
              <p style={{ color: "red", fontWeight: "bold" }}>
                This lesson has been analyzed. No new resources can be added.
              </p>
            )}

            {/* Analyze Button - Visible only if there are resources and not analyzed */}
            {!analyzed && resources.length > 0 && (
              <button
                onClick={handleAnalyze}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "blue",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Analyze Lesson
              </button>
            )}

            {/* Display Resources */}
            <div style={{ marginTop: "1rem" }}>
              <h3>Resources</h3>
              {resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <ResourceItem key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <p>No resources available.</p>
              )}
            </div>

            {/* If analyzed, show additional sections */}
            {analyzed && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  background: "#f9f9f9",
                  borderRadius: "5px",
                }}
              >
                <h3>Analysis</h3>
                <div style={{ marginTop: "1rem" }}>
                  <h4>📄 Summary</h4>
                  <p>Summary will be generated here.</p>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h4>🔑 Key Concepts</h4>
                  {keyConcepts ? (
                    <Link
                      to={`/key-concepts/${keyConcepts.id}`}
                      style={{ textDecoration: "none", color: "blue" }}
                    >
                      <p style={{ cursor: "pointer" }}>{keyConcepts.title} 🔗</p>
                    </Link>
                  ) : (
                    <p>Conceptual map is not available.</p>
                  )}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h4>🎧 Audio</h4>
                  <p>Audio playback will be available here.</p>
                </div>

                {/* Conceptual Map Section */}
                <div style={{ marginTop: "1rem" }}>
                  <h4>🗺️ Conceptual Map</h4>
                  {conceptMap ? (
                    <Link
                      to={`/concept-maps/${conceptMap.id}`}
                      style={{ textDecoration: "none", color: "blue" }}
                    >
                      <p style={{ cursor: "pointer" }}>{conceptMap.title} 🔗</p>
                    </Link>
                  ) : (
                    <p>Conceptual map is not available.</p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default LessonDetail;
