import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import ResourceItem from "../components/ResourceItem";
import { Link } from "react-router-dom";

function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [resources, setResources] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [conceptMap, setConceptMap] = useState<{ title: string } | null>(null);
  useEffect(() => {
    // Fetch lesson details
    fetch(`http://localhost:8000/api/lessons/${lessonId}/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Lesson details:", data); // ✅ Debugging log
        setAnalyzed(data.analyzed);
      })
      .catch((error) => console.error("Error fetching lesson details:", error));
  
    // Fetch lesson resources
    fetch(`http://localhost:8000/api/lessons/${lessonId}/resources`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Lesson resources:", data); // ✅ Debugging log
        setResources(data.resources);
      })
      .catch((error) => console.error("Error fetching resources:", error));
  
    // Fetch conceptual map if the lesson is analyzed
    if (analyzed) {
      console.log("Fetching conceptual map for lesson:", lessonId); // ✅ Debugging log
      fetch(`http://localhost:8000/api/lessons/${lessonId}/concept-map/`)
        .then((res) => {
          console.log("Concept Map Response Status:", res.status); // ✅ Debugging log
          return res.json();
        })
        .then((data) => {
          console.log("Concept Map Data:", data); // ✅ Debugging log
          setConceptMap(data);
        })
        .catch((error) => console.error("Error fetching concept map:", error));
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
            <div style={{ marginTop: "2rem", padding: "1rem", background: "#f9f9f9", borderRadius: "5px" }}>
              <h3>Analysis</h3>
              <div style={{ marginTop: "1rem" }}>
                <h4>📄 Summary</h4>
                <p>Summary will be generated here.</p>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <h4>🔑 Key Concepts</h4>
                <p>Key concepts will be displayed here.</p>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <h4>🎧 Audio</h4>
                <p>Audio playback will be available here.</p>
              </div>

              {/* Conceptual Map Section */}
              <div style={{ marginTop: "1rem" }}>
                <h4>🗺️ Conceptual Map</h4>
                {conceptMap ? (
                  <Link to={`/concept-maps/${conceptMap.id}`} style={{ textDecoration: "none", color: "blue" }}>
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
  );
}

export default LessonDetail;
