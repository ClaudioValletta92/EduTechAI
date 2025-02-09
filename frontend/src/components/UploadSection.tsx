import React, { useRef, useState } from "react";
import Modal from "./Modal";

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

  // Open file picker
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Store selected file
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

  // Confirm and upload
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
    <div>
      {/* Button to open modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          background: "#007bff",
          color: "#fff",
          border: "none",
          padding: "10px 15px",
          cursor: "pointer",
          borderRadius: "5px",
          fontSize: "1rem",
        }}
      >
        ➕ Add Resource
      </button>

      {/* Modal for Upload Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Upload a PDF Resource</h3>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Enter resource title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            display: "block",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Buttons */}
        <button
          onClick={handleUploadClick}
          style={{
            marginRight: "10px",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          Select PDF
        </button>

        {uploadStatus === "ready" && selectedFile && (
          <div style={{ marginTop: "1rem" }}>
            <p>Selected file: {selectedFile.name}</p>
            <button
              onClick={handleConfirmUpload}
              style={{
                padding: "8px",
                cursor: "pointer",
              }}
            >
              Confirm Upload
            </button>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === "uploading" && <p>Uploading…</p>}
        {uploadStatus === "success" && (
          <p style={{ color: "green" }}>Upload successful ✅</p>
        )}
        {uploadStatus === "error" && (
          <p style={{ color: "red" }}>Error uploading PDF. Please try again.</p>
        )}
      </Modal>
    </div>
  );
}

export default UploadSection;
