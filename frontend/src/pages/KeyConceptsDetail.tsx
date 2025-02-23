import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Card from "../components/Card";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const placeholderConcepts = [
  {
    id: 1,
    title: "Newton's First Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.v",
    importance: 5,
    synonyms: ["Law of Inertia"],
    misconceptions: ["Objects naturally come to rest without force"],
  },
  {
    id: 2,
    title: "Thermodynamics Second Law",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    importance: 4,
    synonyms: ["Law of Entropy"],
    misconceptions: ["Entropy means disorder in all cases"],
  },
];

const KeyConceptsDetail = () => {
  const { keyConceptsId } = useParams();
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main className="">
          {/* Outer div handles horizontal scrolling */}
          <div className="overflow-x-auto flex flex-row space-x-4 p-4">
            {placeholderConcepts
              .sort((a, b) => b.importance - a.importance)
              .map((concept) => (
                <Card
                  key={concept.id}
                  title={concept.title}
                  description={concept.description}
                  importance={concept.importance}
                  synonyms={concept.synonyms}
                  misconceptions={concept.misconceptions}
                />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default KeyConceptsDetail;
