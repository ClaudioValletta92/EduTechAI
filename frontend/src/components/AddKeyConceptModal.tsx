import React, { useState } from "react";
import Modal from "../components/Modal";
import Button from "../components/ui/Button";

interface AddKeyConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConcept: (concept: KeyConcept) => void;
}

interface KeyConcept {
  id: number;
  title: string;
  description: string;
  importance: number;
  synonyms: string[];
  misconceptions: string[];
}

const AddKeyConceptModal: React.FC<AddKeyConceptModalProps> = ({
  isOpen,
  onClose,
  onAddConcept,
}) => {
  const [newConcept, setNewConcept] = useState<KeyConcept>({
    id: 0, // Will be set dynamically
    title: "",
    description: "",
    importance: 3,
    synonyms: [],
    misconceptions: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConcept((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onAddConcept({ ...newConcept, id: Date.now() }); // Generate a unique ID
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Add New Key Concept</h2>
      <div>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={newConcept.title}
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
            value={newConcept.description}
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
            value={newConcept.importance}
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
            value={newConcept.synonyms.join(", ")}
            onChange={(e) =>
              setNewConcept((prev) => ({
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
            value={newConcept.misconceptions.join(", ")}
            onChange={(e) =>
              setNewConcept((prev) => ({
                ...prev,
                misconceptions: e.target.value.split(", "),
              }))
            }
          />
        </label>
      </div>
      <Button onClick={handleSubmit}>Add Concept</Button>
    </Modal>
  );
};

export default AddKeyConceptModal;
