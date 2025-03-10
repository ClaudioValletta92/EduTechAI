import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    school: "",
    theme: "dark", // Default theme
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register/",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <input
        type="number"
        placeholder="Age"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
      />
      <select
        value={formData.school}
        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
      >
        <option value="">Select School</option>
        <option value="MEDIE">Scuola Media</option>
        <option value="SUPERIORI_1">Scuola Superiore - 1° Anno</option>
        <option value="SUPERIORI_2">Scuola Superiore - 2° Anno</option>
        <option value="SUPERIORI_3">Scuola Superiore - 3° Anno</option>
        <option value="SUPERIORI_4">Scuola Superiore - 4° Anno</option>
        <option value="SUPERIORI_5">Scuola Superiore - 5° Anno</option>
        <option value="UNIVERSITA">Università</option>
      </select>
      <select
        value={formData.theme}
        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
