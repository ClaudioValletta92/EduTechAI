// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./Router";
import "./index.css"; // <-- Add this line to import your Tailwind CSS file

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>
  );
}
