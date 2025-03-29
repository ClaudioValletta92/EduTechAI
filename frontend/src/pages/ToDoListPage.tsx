import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import AddTaskModal from "../components/AddTaskModal"; // Import the AddTaskModal component

// Mock task data
const initialTasks = [
  { id: 1, title: "Complete React App", status: "todo", priority: "high" },
  { id: 2, title: "Fix bug in API", status: "in_progress", priority: "medium" },
  { id: 3, title: "Write unit tests", status: "completed", priority: "low" },
  { id: 4, title: "Design the database schema", status: "todo", priority: "medium" },
  { id: 5, title: "Refactor code", status: "completed", priority: "high" },
  { id: 6, title: "Deploy to production", status: "in_progress", priority: "high" },
];

const ToDoListPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  // Filter tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  // Add task function
  const handleAddTask = (task: any) => {
    setTasks((prevTasks) => [...prevTasks, task]); // Add new task to state
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#1d2125] text-[#adbbc4]"></div>
      <div className="relative z-10 flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-[#1d2125] bg-opacity-90 rounded-lg shadow-lg text-[#adbbc4]">
          <h2 className="text-3xl font-bold text-[#adbbc4]">To-Do List</h2>

          <div className="mt-6 flex gap-6">
            {/* To Do Column */}
            <div className="w-1/3">
              <h3 className="text-2xl font-semibold text-[#adbbc4]">To Do</h3>
              <div className="mt-4 space-y-4">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-[#2e343b] rounded-lg shadow-md"
                    style={{
                      borderLeft: `5px solid ${
                        task.priority === "high"
                          ? "red"
                          : task.priority === "medium"
                          ? "yellow"
                          : "green"
                      }`,
                    }}
                  >
                    <h4 className="text-xl font-semibold text-[#adbbc4]">{task.title}</h4>
                    <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="w-1/3">
              <h3 className="text-2xl font-semibold text-[#adbbc4]">In Progress</h3>
              <div className="mt-4 space-y-4">
                {inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-[#2e343b] rounded-lg shadow-md"
                    style={{
                      borderLeft: `5px solid ${
                        task.priority === "high"
                          ? "red"
                          : task.priority === "medium"
                          ? "yellow"
                          : "green"
                      }`,
                    }}
                  >
                    <h4 className="text-xl font-semibold text-[#adbbc4]">{task.title}</h4>
                    <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="w-1/3">
              <h3 className="text-2xl font-semibold text-[#adbbc4]">Completed</h3>
              <div className="mt-4 space-y-4">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-[#2e343b] rounded-lg shadow-md"
                    style={{
                      borderLeft: `5px solid ${
                        task.priority === "high"
                          ? "red"
                          : task.priority === "medium"
                          ? "yellow"
                          : "green"
                      }`,
                    }}
                  >
                    <h4 className="text-xl font-semibold text-[#adbbc4]">{task.title}</h4>
                    <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Button to open the Add Task Modal */}
          <div className="mt-6 flex justify-center">
            <div
              className="flex justify-center items-center w-1/3 h-16 bg-gray-700 rounded-lg cursor-pointer"
              onClick={() => setIsModalOpen(true)} // Open the modal
            >
              <span className="text-xl text-white">+ Add Task</span>
            </div>
          </div>
        </main>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close modal when clicked
        onAddTask={handleAddTask} // Pass the handleAddTask function to modal
      />
    </div>
  );
};

export default ToDoListPage;
