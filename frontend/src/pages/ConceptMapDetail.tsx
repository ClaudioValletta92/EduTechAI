import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function ConceptMapDetail() {
  const { conceptMapId } = useParams<{ conceptMapId: string }>();
  const [conceptMap, setConceptMap] = useState<{ title: string; data: any } | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/concept-maps/${conceptMapId}/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Concept Map Data:", data);
        setConceptMap(data);
      })
      .catch((error) => console.error("Error fetching concept map:", error));
  }, [conceptMapId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1rem", background: "#fff" }}>
          {conceptMap ? (
            <>
              <h2>{conceptMap.title}</h2>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(conceptMap.data, null, 2)}</pre>
            </>
          ) : (
            <p>Loading Conceptual Map...</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default ConceptMapDetail;
