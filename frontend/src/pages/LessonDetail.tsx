import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import ResourceItem from "../components/ResourceItem";

function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [resources, setResources] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/lessons/${lessonId}/`)
      .then((res) => res.json())
      .then((data) => {
        setAnalyzed(data.analyzed);
      });

    fetch(`http://localhost:8000/api/lessons/${lessonId}/resources`)
      .then((res) => res.json())
      .then((data) => setResources(data.resources))
      .catch((error) => console.error("Error fetching resources:", error));
  }, [lessonId]);

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
        </main>
      </div>
    </div>
  );
}

export default LessonDetail;
