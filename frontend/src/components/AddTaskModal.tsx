import React, { useState } from "react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: any) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = () => {
    if (title) {
      const newTask = {
        id: Math.random(), // Or use a more robust ID generation strategy
        title,
        description,
        dueDate,
        status,
        priority,
      };
      onAddTask(newTask); // Pass the new task back to the parent component
      onClose(); // Close the modal
    }
  };

  const STATUS_CHOICES = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const PRIORITY_CHOICES = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <div>
      {isOpen && (
        <div>
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={onClose}
          >
            <div
              className="modal-content"
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: "8px",
                width: "90%",
                maxWidth: "500px",
                zIndex: 1001,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing on inner clicks
            >
              <h3>Add New Task</h3>

              <div className="mt-4">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 mt-2 mb-4 border rounded"
                  placeholder="Task title"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 mt-2 mb-4 border rounded"
                  placeholder="Task description"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 mt-2 mb-4 border rounded"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 mt-2 mb-4 border rounded"
                >
                  {STATUS_CHOICES.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 mt-2 mb-4 border rounded"
                >
                  {PRIORITY_CHOICES.map((priorityOption) => (
                    <option key={priorityOption.value} value={priorityOption.value}>
                      {priorityOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-between">
                <button onClick={onClose} className="bg-gray-400 text-white py-2 px-4 rounded">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTaskModal;
