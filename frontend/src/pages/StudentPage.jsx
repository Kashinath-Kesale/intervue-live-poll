import { useSocket } from "../hooks/useSocket";
import { useActivePoll } from "../hooks/useActivePoll";
import { usePollTimer } from "../hooks/usePollTimer";
import { submitVote } from "../api/voteApi";
import { getSessionId } from "../utils/session";
import { useEffect, useState } from "react";
import "./StudentPage.css"; // Added styling import

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
        <div className="page loading-state">
            <div className="badge">
                <span>Intervue Poll</span>
            </div>
            <div className="loading-spinner"></div>
            <p className="waiting-text">Wait for the teacher to ask questions..</p>
        </div>
    )

    if (uiPollEnded || timeLeft === 0) {
  return (
    <div className="page result-view">
      <div className="badge success-badge">
        <span>Poll Finished</span>
      </div>
      
      <h2 className="section-title">Final Standings</h2>
      
      {poll && (
        <div className="question-bar ended-q">
          <span className="q-label">Question:</span>
          {poll.question}
        </div>
      )}

      {results && results.totalVotes > 0 ? (
        <div className="results-container animate-in">
          <div className="results-header">
            <h4>Results Summary</h4>
            <span className="total-votes">{results.totalVotes} votes cast</span>
          </div>

          {/* Unified Result Logic: Works with or without poll.options */}
          {(poll?.options || results.results).map((item, idx) => {
            const optId = item.optionId;
            const optText = item.text || `Option ${optId}`;
            const result = results.results.find(r => r.optionId === optId);
            const percentage = result?.percentage || 0;
            const count = result?.count || 0;

            return (
              <div key={optId} className="poll-option-result final-result">
                <div 
                  className="progress-bar-container" 
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="progress-bar-content">
                  <div className="option-number">{idx + 1}</div>
                  <div className="option-text">{optText}</div>
                  <div className="option-percentage">
                    <strong>{percentage}%</strong>
                    <span className="vote-count">({count})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results-card">
          <p>No votes were submitted for this poll.</p>
        </div>
      )}

      <div className="footer-status">
        <div className="loading-spinner-small"></div>
        <p className="footer-wait-text">
          Waiting for the teacher to start a new question...
        </p>
      </div>
    </div>
  );
}

  if(!poll) {
    if(!hasStarted) {
      return (
        <div className="page entry-page">
          
          <h1 className="welcome-title">Let's Get Started</h1>
          <p className="welcome-description">
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
          </p>

          <div className="input-group">
            <label className="input-label">
              Enter your Name
            </label>
            <input 
              type="text"
              placeholder="e.g. John Doe"
              className="modern-input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          <button 
            className="continue-btn"
            onClick={() => {
              setHasStarted(true);
            }}
          >
            Continue
          </button>
        </div>
      );
    }
    
    return (
      <div className="page waiting-state">
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

  return(
    <div className="page active-poll">
      <div className="question-header">
        <h2 className="live-badge">Live Poll</h2>
        <div className={`timer ${timeLeft < 10 ? 'timer-low' : ''}`}>
            {formatTime(timeLeft)}
        </div>
      </div>

      <div className="question-bar active-q">{poll.question}</div>

        {!hasVoted && Array.isArray(poll.options) && (
          <div className="options-grid">
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
          <button className="error-close" onClick={() => setErrorMessage(null)}>×</button>
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
          >Submit Vote</button>
        </div>
      )}

      {results && results.totalVotes > 0 && results.results.length > 0 && (
        <div className="live-results-section">
          <h4 className="results-heading">Current Live Results</h4>
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