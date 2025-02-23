import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

const defaultOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000, // Make sure the modal is above everything
};

const defaultContentStyle: React.CSSProperties = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
  zIndex: 1001, // Ensure modal content is above overlay
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  overlayStyle,
  contentStyle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ ...defaultOverlayStyle, ...overlayStyle }}
      onClick={onClose} // Close the modal if the overlay is clicked
    >
      <div
        className="modal-overlay"
        style={{ ...defaultContentStyle, ...contentStyle }}
        onClick={(e) => e.stopPropagation()} // Prevent click events from closing the modal when clicking inside the content
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
