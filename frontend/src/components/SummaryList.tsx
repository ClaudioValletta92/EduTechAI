import React from "react";

interface Summary {
  id: number;
  title: string;
  content: string;
  created_at: string; // ISO string format (date and time)
  updated_at: string; // ISO string format (date and time)
  word_count: number;
}
interface SummaryProps {
  summaries: Summary[];
}

function SummaryList({ summaries }: SummaryProps) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800">Summaries</h3>
      {summaries.length > 0 ? (
        <div className="mt-4">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-white p-4 rounded-lg shadow-md mb-4"
            >
              <h4 className="text-xl font-semibold text-gray-900">
                Word count: {summary.word_count}
              </h4>
              <p className="text-gray-700 mt-2">{summary.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No summaries available for this lesson.</p>
      )}
    </div>
  );
}

export default SummaryList;
