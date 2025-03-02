import React from "react";
import Card from "../components/Card";

interface KeyConcept {
  id: number;
  title: string;
  description: string;
  importance: number;
  synonyms: string[];
  misconceptions: string[];
}

interface KeyConceptsListProps {
  keyConcepts: KeyConcept[];
}

const KeyConceptsList: React.FC<KeyConceptsListProps> = ({ keyConcepts }) => {
  if (keyConcepts.length === 0) {
    return <p className="text-gray-500">No key concepts available.</p>;
  }

  return (
    <div className="overflow-x-auto flex flex-row space-x-4 p-4">
      {keyConcepts
        .sort((a, b) => b.importance - a.importance) // Sort by importance
        .map((concept) => (
          <div key={concept.id} className="min-w-[250px]">
            <Card
              title={concept.title}
              description={concept.description}
              importance={concept.importance}
              synonyms={concept.synonyms}
              misconceptions={concept.misconceptions}
            />
          </div>
        ))}
    </div>
  );
};

export default KeyConceptsList;
