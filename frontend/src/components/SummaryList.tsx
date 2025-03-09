import React, { useState } from "react";

interface Paragraph {
  id: number;
  title: string;
  summary: string;
}

interface SummaryListProps {
  content: Paragraph[]; // Array of paragraph objects
}

function SummaryList({ content }: SummaryListProps) {
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(
    content.length > 0 ? content[0] : null
  );

  return (
    <div className="flex">
      {/* Sidebar for Paragraphs */}
      <div className="w-1/4 p-4 border-r border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Paragrafi</h3>
        <ul>
          {content.map((paragraph) => (
            <li
              key={paragraph.id}
              className={`p-2 cursor-pointer ${
                selectedParagraph?.id === paragraph.id
                  ? "bg-gray-100 rounded-lg text-[#1d2125]"
                  : ""
              }`}
              onClick={() => setSelectedParagraph(paragraph)}
            >
              {paragraph.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content for Selected Paragraph */}
      <div className="flex-1 p-4">
        <h3 className="text-2xl font-semibold mb-4">Riassunto</h3>
        {selectedParagraph ? (
          <div className="p-4 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-2">
              {selectedParagraph.title}
            </h4>
            <p className="">{selectedParagraph.summary}</p>
          </div>
        ) : (
          <p>Nessun paragrafo selezionato.</p>
        )}
      </div>
    </div>
  );
}

export default SummaryList;
