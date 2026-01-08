import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./RoleSelect.css"; // Added the styling link

function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === "student") {
      navigate("/student");
    } else if (selectedRole === "teacher") {
      navigate("/teacher");
    }
  };

  return (
    <div className="role-select-page">
      <h1 className="welcome-title">Welcome to the Live Polling System</h1>
      <p className="welcome-description">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="role-cards">
        <div 
          className={`role-card ${selectedRole === "student" ? "selected" : ""}`}
          onClick={() => setSelectedRole("student")}
        >
          <h3>I'm a Student</h3>
          <p>Participate in live polls, submit your responses within the time limit, and view real-time results as the poll progresses.</p>
        </div>

        <div 
          className={`role-card ${selectedRole === "teacher" ? "selected" : ""}`}
          onClick={() => setSelectedRole("teacher")}
        >
          <h3>I'm a Teacher</h3>
          <p>Create live poll questions, monitor student responses in real time, and view final results once the poll ends.</p>
        </div>
      </div>

      <button 
        className="continue-btn" 
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
}

export default RoleSelect;