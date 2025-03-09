import React, { useRef, useState } from "react";
import Modal from "./Modal";
import { Plus } from "lucide-react"; // Import the Plus icon

interface UploadSectionProps {
  lessonId: number;
}

function UploadSection({ lessonId }: UploadSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "ready" | "uploading" | "success" | "error"
  >("idle");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadStatus("idle");
      return;
    }
    setSelectedFile(file);
    setUploadStatus("ready");
  };

  const handleConfirmUpload = () => {
    if (!selectedFile || !title) {
      alert("Please enter a title and select a PDF file.");
      return;
    }

    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", selectedFile);

    fetch(`http://localhost:8000/api/lessons/${lessonId}/upload-pdf/`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Upload response:", data);
        setUploadStatus("success");
      })
      .catch((err) => {
        console.error("Error uploading PDF:", err);
        setUploadStatus("error");
      });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-100 transition w-32 h-40 text-center"
      >
        <Plus className="w-8 h-8 text-gray-500" />
        <span className="text-sm font-medium break-words">
          Aggiungi materiale
        </span>
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">Upload a PDF Resource</h3>

        <input
          type="text"
          placeholder="Enter resource title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          onClick={handleUploadClick}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
        >
          Select PDF
        </button>

        {uploadStatus === "ready" && selectedFile && (
          <div className="mt-4">
            <p className="text-gray-700">Selected file: {selectedFile.name}</p>
            <button
              onClick={handleConfirmUpload}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all mt-2"
            >
              Confirm Upload
            </button>
          </div>
        )}

        {uploadStatus === "uploading" && (
          <p className="text-blue-500 mt-4">Uploading…</p>
        )}
        {uploadStatus === "success" && (
          <p className="text-green-500 mt-4">Upload successful ✅</p>
        )}
        {uploadStatus === "error" && (
          <p className="text-red-500 mt-4">
            Error uploading PDF. Please try again.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default UploadSection;
