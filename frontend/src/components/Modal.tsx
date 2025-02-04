// src/components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Optionally, you can pass additional style or className props
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
  zIndex: 1000,
};

const defaultContentStyle: React.CSSProperties = {
  background: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
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
    <div style={{ ...defaultOverlayStyle, ...overlayStyle }} onClick={onClose}>
      <div
        style={{ ...defaultContentStyle, ...contentStyle }}
        onClick={(e) => e.stopPropagation()} // Prevent click events from closing the modal when clicking inside the content
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
