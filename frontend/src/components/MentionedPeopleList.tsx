import React from "react";

interface Person {
  name: string;
  bio: string;
  image_url: string;
}

interface Props {
  people: Person[];
}

const MentionedPeopleList: React.FC<Props> = ({ people }) => {
  if (!people || people.length === 0) return null;

  return (
    <div className="mt-8">
      <h4 className="text-2xl font-semibold mb-4 text-[#adbbc4]">Persone Importanti</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person, idx) => (
          <div
            key={idx}
            className="bg-[#2c2f33] rounded-2xl shadow-md p-4 flex flex-col items-center text-center"
          >
            <img
              src={person.image_url}
              alt={person.name}
              className="w-32 h-32 object-cover rounded-full shadow-lg mb-4"
            />
            <h5 className="text-xl font-bold text-white mb-2">{person.name}</h5>
            <p className="text-sm text-[#adbbc4]">{person.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentionedPeopleList;
