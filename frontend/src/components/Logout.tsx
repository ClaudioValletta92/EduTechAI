import React from "react";
import axios from "axios";

const Logout = () => {
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/logout/"
      );
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
