import React, { useEffect, useState } from "react";
import { useParams,useLocation} from "react-router-dom";
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
  const [keyConcepts, setKeyConcepts] = useState<{ title: string } | null>(
    null
  );
  const location = useLocation();
  const project = location.state?.project; // ✅ Retrieve project from location state
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

      console.log("Fetching key concepts for lesson:", lessonId); // ✅ Debugging log
      fetch(`http://localhost:8000/api/lessons/${lessonId}/key-concept/`)
        .then((res) => {
          console.log("Key concepts Response Status:", res.status); // ✅ Debugging log
          return res.json();
        })
        .then((data) => {
          console.log("Concept Map Data:", data); // ✅ Debugging log
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

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        backgroundImage: project?.fields.background_image
          ? `url(http://localhost:8000${project.fields.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-40"></div>
  
      <div className="relative z-10 flex flex-1">
        <Sidebar />
  
        <main className="flex-1 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg mx-4 my-6">
          <h2 className="text-3xl font-bold text-gray-900">Lesson {lessonId}</h2>
  
          {/* Upload Section - Disabled if analyzed */}
          {!analyzed ? (
            <UploadSection lessonId={parseInt(lessonId)} />
          ) : (
            <p className="text-red-600 font-semibold mt-2">
              This lesson has been analyzed. No new resources can be added.
            </p>
          )}
  
          {/* Analyze Button */}
          {!analyzed && resources.length > 0 && (
            <button
              onClick={handleAnalyze}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Analyze Lesson
            </button>
          )}
  
          {/* Resources Section */}
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-800">Resources</h3>
            {resources.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mt-2">No resources available.</p>
            )}
          </div>
  
          {/* Analysis Section */}
          {analyzed && (
            <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800">Analysis</h3>
  
              <div className="mt-4">
                <h4 className="text-lg font-semibold">📄 Summary</h4>
                <p>Summary will be generated here.</p>
              </div>
  
              <div className="mt-4">
                <h4 className="text-lg font-semibold">🔑 Key Concepts</h4>
                {keyConcepts ? (
                  <Link
                    to={`/key-concepts/${keyConcepts.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {keyConcepts.title} 🔗
                  </Link>
                ) : (
                  <p>No key concepts available.</p>
                )}
              </div>
  
              <div className="mt-4">
                <h4 className="text-lg font-semibold">🎧 Audio</h4>
                <p>Audio playback will be available here.</p>
              </div>
  
              <div className="mt-4">
                <h4 className="text-lg font-semibold">🗺️ Conceptual Map</h4>
                {conceptMap ? (
                  <Link
                    to={`/concept-maps/${conceptMap.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {conceptMap.title} 🔗
                  </Link>
                ) : (
                  <p>No conceptual map available.</p>
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
