import React, { useState } from "react";
import { motion } from "framer-motion";

const Card = ({ title, description, synonyms, misconceptions, importance }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center shadow-lg rounded-xl border border-gray-300 !important">
      {flipped ? (
        <div>
          <p className="text-sm font-bold">Synonyms:</p>
          <p>{synonyms.join(", ")}</p>
          <p className="text-sm font-bold mt-2">Misconceptions:</p>
          <p>{misconceptions.join(", ")}</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm mt-4">{description}</p>
          <p className="text-xs text-gray-500 mt-4">Importance: {importance}</p>
        </div>
      )}
    </div>
  );
};

export default Card;
