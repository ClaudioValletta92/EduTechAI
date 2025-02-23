import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "./Modal"; // Import your Modal component

const Card = ({ title, description, synonyms, misconceptions, importance }) => {
  const [flipped, setFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);

  const toggleFlip = () => setFlipped((prev) => !prev);

  const openModal = (e) => {
    e.preventDefault(); // Prevent the default right-click menu
    e.stopPropagation(); // Prevent the event from propagating to parent elements
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = (title, description) => {
    setNewTitle(title);
    setNewDescription(description);
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center p-6 text-center shadow-lg rounded-xl border border-gray-300 cursor-pointer"
      onClick={toggleFlip}
      onContextMenu={openModal} // Right-click opens the modal
      whileHover={{ scale: 1.05 }}
    >
      {flipped ? (
        <div>
          <p className="text-sm font-bold">Synonyms:</p>
          <p>{synonyms.join(", ")}</p>
          <p className="text-sm font-bold mt-2">Misconceptions:</p>
          <p>{misconceptions.join(", ")}</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold">{newTitle}</h3>
          <p className="text-sm mt-4">{newDescription}</p>
          <p className="text-xs text-gray-500 mt-4">Importance: {importance}</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3 className="text-xl font-bold mb-4">Edit Card</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSave(newTitle, newDescription);
              closeModal();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Card;
