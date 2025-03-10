import React, { useState, useEffect } from "react";
import axios from "axios";

function ProfilePage() {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<number | "">(""); // Initialize as an empty string or 0
  const [school, setSchool] = useState("");
  const [workDuration, setWorkDuration] = useState(25);
  const [restDuration, setRestDuration] = useState(5);
  const [theme, setTheme] = useState("dark");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/current-user/",
          {
            withCredentials: true,
          }
        );
        const data = response.data;
        console.log("User data:", data);
        setUsername(data.username || ""); // Handle null/undefined
        setAge(data.age || 0); // Replace null/undefined with 0
        setSchool(data.school || ""); // Handle null/undefined
        setWorkDuration(data.work_duration || 25); // Default to 25
        setRestDuration(data.rest_duration || 5); // Default to 5
        setTheme(data.theme || "dark"); // Default to "dark"
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        "http://localhost:8000/api/auth/update-profile/",
        {
          username,
          age: age === "" ? null : age,
          school,
          work_duration: workDuration,
          rest_duration: restDuration,
          theme,
        },
        {
          withCredentials: true, // Include cookies
          headers: {
            "Content-Type": "application/json", // Ensure the correct Content-Type
          },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            value={age === "" ? "" : age} // Handle empty string
            onChange={(e) =>
              setAge(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          />
        </div>

        {/* School */}
        <div>
          <label className="block text-sm font-medium mb-1">School</label>
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          >
            <option value="MEDIE">Scuola Media</option>
            <option value="SUPERIORI_1">Scuola Superiore - 1° Anno</option>
            <option value="SUPERIORI_2">Scuola Superiore - 2° Anno</option>
            <option value="SUPERIORI_3">Scuola Superiore - 3° Anno</option>
            <option value="SUPERIORI_4">Scuola Superiore - 4° Anno</option>
            <option value="SUPERIORI_5">Scuola Superiore - 5° Anno</option>
            <option value="UNIVERSITA">Università</option>
          </select>
        </div>

        {/* Work Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Work Duration (minutes)
          </label>
          <input
            type="number"
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          />
        </div>

        {/* Rest Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Rest Duration (minutes)
          </label>
          <input
            type="number"
            value={restDuration}
            onChange={(e) => setRestDuration(Number(e.target.value))}
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 bg-[#2d333b] border border-[#444c56] rounded"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
