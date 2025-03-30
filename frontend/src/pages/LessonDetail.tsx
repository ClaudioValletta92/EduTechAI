import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import ResourceItem from "../components/ResourceItem";
import { Link } from "react-router-dom";
import Modal from "../components/Modal"; // Import the Modal component
import KeyConceptsList from "../components/KeyConceptsList";
import SummaryList from "../components/SummaryList";
import { Plus } from "lucide-react"; // Import the Plus icon
import TablesList from "../components/TablesList";
import ConceptMapView from "../components/ConceptMapView";
import Timeline from "../components/Timeline"; // Import the Timeline component
interface KeyConcept {
  id: number;
  title: string;
  description: string;
  importance: number;
  synonyms: string[];
  misconceptions: string[];
}
interface FetchedSummary {
  id: number;
  title: string;
  content: Array<{ id: number; title: string; summary: string }>;
  created_at: string;
  updated_at: string;
  lesson: string;
}
interface Lesson {
  id: number;
  title: string;
  description: string;
  created_at: string;
  analyzed: boolean;
}

function LessonDetail() {
  const nodes = [
    {
      id: "1",
      type: "customNode",
      data: { title: "Main Topic", text: "Some details about Main Topic." },
      position: { x: 250, y: 50 },
    },
    {
      id: "2",
      type: "customNode",
      data: { title: "Subtopic A", text: "Explanatory text for Subtopic A." },
      position: { x: 100, y: 200 },
    },
    {
      id: "3",
      type: "customNode",
      data: { title: "Subtopic B", text: "Explanatory text for Subtopic B." },
      position: { x: 400, y: 200 },
    },
    {
      id: "4",
      type: "annotationNode",
      data: {
        level: "1",
        label: "An example annotation",
        arrowStyle: { color: "red" },
      },
      position: { x: 150, y: 400 },
    },
  ];

  const edges = [
    {
      id: "1",
      source: "1",
      target: "2",
      label: "Edge to Subtopic A",
      type: "smoothstep",
    },
    {
      id: "2",
      source: "1",
      target: "3",
      label: "Edge to Subtopic B",
      type: "smoothstep",
    },
  ];
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [conceptMap, setConceptMap] = useState<{ title: string } | null>(null);
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>([]);
  const [summary, setSummary] = useState<FetchedSummary | null>(null); // Initialize as null
  const [tables, setTables] = useState<
    Array<{ id: number; title: string; data: Array<{ [key: string]: any }> }>
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const project = location.state?.project;

  useEffect(() => {
    // Fetch lesson details
    fetch(`http://localhost:8000/api/lessons/${lessonId}/`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data);
        setAnalyzed(data.analyzed);
      })
      .catch((error) => console.error("Error fetching lesson details:", error));

    // Fetch lesson resources
    fetch(`http://localhost:8000/api/lessons/${lessonId}/resources`)
      .then((res) => res.json())
      .then((data) => {
        setResources(data.resources);
      })
      .catch((error) => console.error("Error fetching resources:", error));

    // Fetch conceptual map if the lesson is analyzed
    if (analyzed) {
      fetch(`http://localhost:8000/api/lessons/${lessonId}/concept-map/`)
        .then((res) => res.json())
        .then((data) => {
          setConceptMap(data);
        })
        .catch((error) => console.error("Error fetching concept map:", error));

      fetch(`http://localhost:8000/api/lessons/${lessonId}/summaries/`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Summaries:");
          console.log(data);
          setSummary(data); // Set the fetched data to state
        })
        .catch((error) => console.error("Error fetching summaries:", error));

      fetch(`http://localhost:8000/api/lessons/${lessonId}/key-concept/`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Key concepts:");
          console.log(data);
          setKeyConcepts(data); // Assuming API returns an array
        })
        .catch((error) => console.error("Error fetching key concepts:", error));

      fetch(`http://localhost:8000/api/lessons/${lessonId}/tables/`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Tables:");
          console.log(data);
          setTables(data);
        })
        .catch((error) => console.error("Error fetching tables:", error));
    }
  }, [lessonId, analyzed]);

  const handleAnalyze = () => {
    setIsModalOpen(true);
  };

  const ModalContent = ({ onClose }) => {
    const [resumeLength, setResumeLength] = useState("");
    const [conceptualMapSize, setConceptualMapSize] = useState("");
    const [keyConceptsCount, setKeyConceptsCount] = useState("");

    const handleSubmit = () => {
      fetch(`http://localhost:8000/api/lessons/${lessonId}/analyze/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_length: resumeLength,
          conceptual_map_size: conceptualMapSize,
          key_concepts_count: keyConceptsCount,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          setAnalyzed(true);
          onClose();
        })
        .catch((error) => console.error("Error analyzing lesson:", error));
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Analyze Lesson
        </h2>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Length of the resume (words approx.):
          </label>
          <input
            type="number"
            value={resumeLength}
            onChange={(e) => setResumeLength(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter number of words"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Conceptual Map Size:
          </label>
          <select
            value={conceptualMapSize}
            onChange={(e) => setConceptualMapSize(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Select size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">
            Concetti chiave:
          </label>
          <input
            type="number"
            value={keyConceptsCount}
            onChange={(e) => setKeyConceptsCount(e.target.value)}
            min="1" // Minimum value
            max="20" // Maximum value (adjust as needed)
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter a number"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>
    );
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
      <div className="relative z-10 flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-[#1d2125] bg-opacity-90 rounded-lg shadow-lg mx-4 my-6 text-[#adbbc4] overflow-hidden">          <h2 className="text-3xl font-bold text-[#adbbc4]">{lesson?.title}</h2>
          {!analyzed && resources.length > 0 && (
            <button
              onClick={handleAnalyze}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Analizza tutto il materiale
            </button>
          )}

          {/* Resources Section */}
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-[#adbbc4]">Materiale</h3>
            {resources.length > -1 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-8">
                {resources.map((resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))}
                {!analyzed && <UploadSection lessonId={parseInt(lessonId)} />}
              </div>
            ) : (
              <p className="text-gray-600 mt-2">
                Non hai aggiunto ancora materiale
              </p>
            )}
          </div>
          <hr className="my-6 border-t border-[#adbbc4]" />
          {analyzed && (
            <div className="mt-8 rounded-lg shadow-md">
              {/* Render SummaryList only if summary.content exists */}
              {summary?.content && (
                <div className="mt-4">
                  <SummaryList content={summary.content} />
                </div>
              )}

            <div className="mt-4">
              <h4 className="text-lg font-semibold">Concetti chiave:</h4>
              {keyConcepts.length > 0 ? (
                <KeyConceptsList keyConcepts={keyConcepts} />
              ) : (
                <p>No key concepts available.</p>
              )}
            </div>

            <div className="mt-4">
              {Array.isArray(tables) && tables.length > 0 ? (
                <TablesList tables={tables} />
              ) : (
                <p>Nessuna tabella disponibile.</p>
              )}
            </div>

                <Timeline />

              <div className="mt-4">
                <h4 className="text-lg font-semibold">Audio</h4>
                <p>Audio playback will be available here.</p>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold">Mappa concettuale</h4>
                <ConceptMapView nodes={nodes} edges={edges} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default LessonDetail;
