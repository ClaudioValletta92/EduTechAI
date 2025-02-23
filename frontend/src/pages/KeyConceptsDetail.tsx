import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal"; // Import your modal component

const placeholderConcepts = [
  {
    id: 1,
    title: "Newton's First Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 5,
    synonyms: ["Law of Inertia"],
    misconceptions: ["Objects naturally come to rest without force"],
  },
  {
    id: 2,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
  {
    id: 3,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
  {
    id: 4,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
  {
    id: 5,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
  {
    id: 6,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
  {
    id: 7,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
];

const KeyConceptsDetail = () => {
  const { keyConceptsId } = useParams();
  const [flipped, setFlipped] = useState({});
  const [concepts, setConcepts] = useState(placeholderConcepts); // State to manage the list of concepts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    title: "",
    description: "",
    importance: 3,
    synonyms: [],
    misconceptions: [],
  });

  const toggleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCard = () => {
    setConcepts((prevConcepts) => [
      ...prevConcepts,
      { id: prevConcepts.length + 1, ...newCard },
    ]);
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "hidden" }}>
          <Button onClick={() => setIsModalOpen(true)}>Add Card</Button>{" "}
          {/* Add the button to open the modal */}
          {/* Modal to add new card */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h2>Add New Card</h2>
            <div>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={newCard.title}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <label>
                Description:
                <input
                  type="text"
                  name="description"
                  value={newCard.description}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div>
              <label>
                Importance:
                <input
                  type="number"
                  name="importance"
                  value={newCard.importance}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                />
              </label>
            </div>
            <div>
              <label>
                Synonyms (comma separated):
                <input
                  type="text"
                  name="synonyms"
                  value={newCard.synonyms.join(", ")}
                  onChange={(e) =>
                    setNewCard((prev) => ({
                      ...prev,
                      synonyms: e.target.value.split(", "),
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label>
                Misconceptions (comma separated):
                <input
                  type="text"
                  name="misconceptions"
                  value={newCard.misconceptions.join(", ")}
                  onChange={(e) =>
                    setNewCard((prev) => ({
                      ...prev,
                      misconceptions: e.target.value.split(", "),
                    }))
                  }
                />
              </label>
            </div>
            <Button onClick={handleAddCard}>Add Card</Button>
          </Modal>
          {/* Scrollable container for cards */}
          <div
            className="overflow-x-auto flex flex-row space-x-4 p-4"
            style={{
              maxWidth: "calc(100% - 20px)", // Ensure cards don't overlap with sidebar
              marginLeft: "10px", // Adjust based on your Sidebar width
            }}
          >
            {concepts
              .sort((a, b) => b.importance - a.importance)
              .map((concept) => (
                <div key={concept.id} className="min-w-[250px]">
                  <Card
                    title={concept.title}
                    description={concept.description}
                    importance={concept.importance}
                    synonyms={concept.synonyms}
                    misconceptions={concept.misconceptions}
                  />
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KeyConceptsDetail;
