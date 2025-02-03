import React, { useRef, useState } from "react";

function UploadSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store the selected PDF file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State to track upload status
  // Could be "idle", "ready-to-confirm", "uploading", "success", "error"
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "ready" | "uploading" | "success" | "error"
  >("idle");

  // 1) Let the hidden file input open when user clicks "Upload PDF"
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 2) Store the selected file in state
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadStatus("idle");
      return;
    }
    setSelectedFile(file);
    // Move to a "ready" state indicating we have a file but haven't confirmed
    setUploadStatus("ready");
  };

  // 3) Confirm the upload → Actually send file to the API
  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    setUploadStatus("uploading");

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    fetch("http://localhost:8000/api/upload-pdf/", {
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
    <div style={{ marginTop: "1rem" }}>
      {/* Hidden file input that only accepts PDF */}
      <input
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Button that triggers file input click */}
      <button onClick={handleUploadClick}>Select PDF</button>

      {/* If a file is selected, show its name + "Confirm Upload" button */}
      {uploadStatus === "ready" && selectedFile && (
        <div style={{ marginTop: "1rem" }}>
          <p>Selected file: {selectedFile.name}</p>
          <button onClick={handleConfirmUpload}>Confirm Upload</button>
        </div>
      )}

      {/* Show status messages / success check */}
      {uploadStatus === "uploading" && <p>Uploading…</p>}
      {uploadStatus === "success" && (
        <p style={{ color: "green" }}>
          Upload successful <span style={{ fontSize: "1.5rem" }}>✓</span>
        </p>
      )}
      {uploadStatus === "error" && (
        <p style={{ color: "red" }}>Error uploading PDF. Please try again.</p>
      )}
    </div>
  );
}

export default UploadSection;
