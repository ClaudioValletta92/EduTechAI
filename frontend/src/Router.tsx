// src/Router.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // The main layout (Header, Sidebar, etc.)
import UploadPage from "./pages/UploadPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectDetail from "./pages/ProjectDetail";
import LessonDetail from "./pages/LessonDetail";
import ConceptMapDetail from "./pages/ConceptMapDetail";
import KeyConceptsDetail from "./pages/KeyConceptsDetail";
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main layout might also have nested routes if needed */}
        <Route path="/" element={<App />}>
          {/* If App includes its own <Outlet />, you can nest routes here */}
        </Route>

        {/* For a dedicated page */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/project/:projectId" element={<ProjectDetail />} />
        <Route path="/lessons/:lessonId" element={<LessonDetail />} />
        <Route
          path="/concept-maps/:conceptMapId"
          element={<ConceptMapDetail />}
        />
        <Route
          path="/key-concepts/:keyConceptsId"
          element={<KeyConceptsDetail />}
        />
        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
