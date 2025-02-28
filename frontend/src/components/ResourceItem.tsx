import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import {
  FileText as LucideFileText,
  FileAudio as LucideFileAudio,
  FileImage as LucideFileImage,
  FileVideo as LucideFileVideo,
  File as LucideFile,
  File as LucideFilePdf,
} from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

const ResourceItem = ({ resource }) => {
  const fileUrl = `${BACKEND_URL}${
    resource.file_url && resource.file_url.startsWith("/")
      ? resource.file_url
      : `/${resource.file_url}`
  }`;
  console.log("File URL:", fileUrl); // Check if the URL is correct in the console
  const [isOpen, setIsOpen] = useState(false);

  const getResourceIcon = (type) => {
    switch (type) {
      case "pdf":
        return <LucideFilePdf className="w-6 h-6 text-red-500" />;
      case "audio":
        return <LucideFileAudio className="w-6 h-6 text-blue-500" />;
      case "text":
        return <LucideFileText className="w-6 h-6 text-gray-600" />;
      case "image":
        return <LucideFileImage className="w-6 h-6 text-green-500" />;
      case "video":
        return <LucideFileVideo className="w-6 h-6 text-purple-500" />;
      default:
        return <LucideFile className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <>
      <button
        onClick={() => {
          console.log("Dialog opening..."); // Check if this is triggered
          setIsOpen(true);
        }}
        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 transition w-full text-left"
      >
        {getResourceIcon(resource.resource_type)}
        <span className="text-lg font-medium">{resource.title}</span>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)} // This ensures the modal closes when clicked outside
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()} // Prevent click inside dialog from closing
          className="bg-white p-4 rounded-lg shadow-lg w-11/12 max-w-3xl relative"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>

          <iframe
            src={fileUrl}
            className="w-full h-[80vh] border-none"
            title="PDF Viewer"
          />
        </div>
      </Dialog>
    </>
  );
};

export default ResourceItem;
