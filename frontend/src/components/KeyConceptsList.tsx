import React from "react";
import Card from "../components/Card";

interface KeyConcept {
  id: number;
  data: {
    title: string;
    description: string;
    importance: number;
    synonyms: string[];
    misconceptions: string[];
  };
}

interface KeyConceptsListProps {
  keyConcepts: KeyConcept[];
}

const KeyConceptsList: React.FC<KeyConceptsListProps> = ({ keyConcepts }) => {
  if (keyConcepts.length === 0) {
    return <p className="text-gray-500">No key concepts available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {keyConcepts
        .sort((a, b) => b.data.importance - a.data.importance)
        .map((concept) => (
          <div key={concept.id} className="w-full">
            <Card
              title={concept.data.title}
              description={concept.data.description}
              importance={concept.data.importance}
              synonyms={concept.data.synonyms}
              misconceptions={concept.data.misconceptions}
            />
          </div>
        ))}
    </div>
  );
};

export default KeyConceptsList;