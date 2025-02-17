import { 
    FileText as LucideFileText, 
    FileAudio as LucideFileAudio, 
    FileImage as LucideFileImage, 
    FileVideo as LucideFileVideo, 
    File as LucideFile, 
    File as LucideFilePdf 
  } from "lucide-react";
const ResourceItem = ({ resource }) => {
  // Mapping resource types to icons
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
    <a
      href={resource.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 transition"
    >
      {getResourceIcon(resource.resource_type)}
      <span className="text-lg font-medium">{resource.title}</span>
    </a>
  );
};

export default ResourceItem;
