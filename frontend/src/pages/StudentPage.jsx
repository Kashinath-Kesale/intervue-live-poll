import { useSocket } from "../hooks/useSocket";
import { useActivePoll } from "../hooks/useActivePoll";
import { usePollTimer } from "../hooks/usePollTimer";
import { submitVote } from "../api/voteApi";
import { getSessionId } from "../utils/session";
import { useEffect, useState } from "react";


function StudentPage() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [studentName, setStudentName] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const sessionId = getSessionId();

    const socketRef = useSocket();
    const {poll, remainingSeconds, results, pollEnded, loading} = useActivePoll(socketRef);
    const timeLeft = usePollTimer(remainingSeconds);
    const uiPollEnded = pollEnded || timeLeft === 0;


    useEffect(() => {
        setSelectedOption(null);
        setHasVoted(false);
    }, [poll?._id]);    

    if(loading) return (
        <div className="page" style={{ textAlign: "center" }}>
            <div className="badge">
                <span>Intervue Poll</span>
            </div>
            <div className="loading-spinner"></div>
            <p className="waiting-text">Wait for the teacher to ask questions..</p>
        </div>
    )
    if(uiPollEnded || timeLeft === 0) {
    return (
      <div className="page">
        <h2>Question</h2>
        {poll && <div className="question-bar">{poll.question}</div>}

        {results && results.totalVotes > 0 && poll?.options && (
          <div style={{marginTop: "20px"}}>
            <h4>Final Results</h4>
            {poll.options.map((opt, idx) => {
              const result = results.results.find(r => r.optionId === opt.optionId);
              const percentage = result?.percentage || 0;
              return (
                <div key={opt.optionId} className="poll-option-result">
                  <div style={{ width: `${percentage}%` }} className="progress-bar-container"></div>
                  <div className="progress-bar-content">
                    <div className="option-number">{idx + 1}</div>
                    <div className="option-text">{opt.text}</div>
                    <div className="option-percentage">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {results && results.totalVotes > 0 && !poll?.options && (
          <div style={{marginTop: "20px"}}>
            <h4>Final Results</h4>
            <ul className="results">
              {results.results.map((r) => (
                <li key={r.optionId}>
                  {r.optionId}: {r.percentage}% ({r.count})
                </li>
              ))}
            </ul>
          </div>
        )}

        <p style={{marginTop: "20px", textAlign: "center", color: "#6E6E6E"}}>
          Wait for the teacher to ask a new question..
        </p>
      </div>
    )
  }

  if(!poll) {
    if(!hasStarted) {
      return (
        <div className="page" style={{ textAlign: "center", maxWidth: "600px" }}>
          <div className="badge">
            <span>Intervue Poll</span>
          </div>
          
          <h1 className="welcome-title">Let's Get Started</h1>
          <p className="welcome-description">
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
          </p>

          <div style={{ marginTop: "32px", textAlign: "left", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "16px", marginBottom: "8px", color: "#373737" }}>
              Enter your Name
            </label>
            <input 
              type="text"
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                backgroundColor: "#f5f5f5"
              }}
            />
          </div>

          <button 
            className="continue-btn"
            onClick={() => {
              setHasStarted(true);
            }}
            style={{ marginTop: "32px" }}
          >
            Continue
          </button>
        </div>
      );
    }
    
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <div className="badge">
          <span>Intervue Poll</span>
        </div>
        <div className="loading-spinner"></div>
        <p className="waiting-text">Wait for the teacher to ask questions..</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if(timeLeft <= 0) {
    return (
      <div className="page">
        <h2>Question</h2>
        <div className="question-bar">{poll.question}</div>

        {results && results.totalVotes > 0 && poll?.options && (
          <div style={{marginTop: "20px"}}>
            <h4>Final Results</h4>
            {poll.options.map((opt, idx) => {
              const result = results.results.find(r => r.optionId === opt.optionId);
              const percentage = result?.percentage || 0;
              return (
                <div key={opt.optionId} className="poll-option-result">
                  <div style={{ width: `${percentage}%` }} className="progress-bar-container"></div>
                  <div className="progress-bar-content">
                    <div className="option-number">{idx + 1}</div>
                    <div className="option-text">{opt.text}</div>
                    <div className="option-percentage">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{marginTop: "20px", textAlign: "center", color: "#6E6E6E"}}>
          Wait for the teacher to ask a new question..
        </p>
      </div>
    );
  }

  return(
    <div className="page">
      <div className="question-header">
        <h2>Question 1</h2>
        <div className="timer">{formatTime(timeLeft)}</div>
      </div>

      <div className="question-bar">{poll.question}</div>

        {!hasVoted && Array.isArray(poll.options) && (
          <div>
            {poll.options.map((opt, idx) => (
              <div
                key={opt.optionId}
                className={`student-option ${selectedOption === opt.optionId ? "selected" : ""}`}
                onClick={() => setSelectedOption(opt.optionId)}
              >
                <div className="option-number">{idx + 1}</div>
                <div className="option-text">{opt.text}</div>
              </div>
            ))}
          </div>
        )}

      {errorMessage && (
        <div className="error-message">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {timeLeft > 0 && !hasVoted && (
        <div className="submit-btn-container">
          <button className="submit-btn" disabled={!selectedOption} onClick={async() => {
            try{
              await submitVote({
                pollId: poll._id,
                optionId: selectedOption,
                sessionId,
              });
              setHasVoted(true);
              setErrorMessage(null);
            } 
            catch(err) {
              const errorMsg = err.response?.data?.message || "Vote failed";
              if (errorMsg.includes("duplicate") || errorMsg.includes("already")) {
                setErrorMessage("You have already voted for this poll.");
              } else {
                setErrorMessage(errorMsg);
              }
              setTimeout(() => setErrorMessage(null), 5000);
            }
          }}
          >Submit</button>
        </div>
      )}

      {results && results.totalVotes > 0 && results.results.length > 0 && (
        <div style={{marginTop: "20px"}}>
          <h4>Live Results</h4>
          {poll.options && results.results.map((r) => {
            const opt = poll.options.find(o => o.optionId === r.optionId);
            const idx = poll.options.findIndex(o => o.optionId === r.optionId);
            return (
              <div key={r.optionId} className="poll-option-result">
                <div style={{ width: `${r.percentage}%` }} className="progress-bar-container"></div>
                <div className="progress-bar-content">
                  <div className="option-number">{idx + 1}</div>
                  <div className="option-text">{opt?.text || r.optionId}</div>
                  <div className="option-percentage">{r.percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default StudentPage;