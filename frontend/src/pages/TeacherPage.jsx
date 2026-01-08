import { useEffect, useState } from "react";
import { createPoll } from "../api/teacherApi";
import { useSocket } from "../hooks/useSocket";
import { fetchActivePoll } from "../api/pollApi";
import { fetchPollResults } from "../api/pollApi";
import api from "../api/axios";
import "./TeacherPage.css"; // Added styling

function TeacherPage() {
  const socketRef = useSocket();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60);
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollEnded, setPollEnded] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchActivePoll();
        if (data.active) {
          setPoll(data.poll);
          const pollResults = await fetchPollResults(data.poll._id);
          setResults(pollResults);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("poll:created", (newPoll) => {
      setPoll(newPoll);
      setResults(null);
      setPollEnded(false);
    });

    socket.on("poll:updated", ({ results }) => {
      setResults(results);
    });

    socket.on("poll:ended", async () => {
      setPollEnded(true);
      try {
        const data = await fetchActivePoll();
        if (!data.active && poll?._id) {
          const finalResults = await fetchPollResults(poll._id);
          setResults(finalResults);
        }
      } catch (err) {
        console.error("Failed to finalize poll on teacher");
      }
    });

    return () => {
      socket.off("poll:created");
      socket.off("poll:updated");
      socket.off("poll:ended");
    };
  }, [socketRef, poll?._id]);

  useEffect(() => {
    if (!poll || pollEnded) return;
    const checkPollExpiry = () => {
      if (!poll.startTime || !poll.durationSeconds) return;
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(poll.startTime).getTime()) / 1000
      );
      if (elapsedSeconds >= poll.durationSeconds) {
        setPollEnded(true);
      }
    };
    checkPollExpiry();
    const interval = setInterval(checkPollExpiry, 1000);
    return () => clearInterval(interval);
  }, [poll, pollEnded]);

  if (loading) return <div className="page center-content"><div className="loading-spinner"></div></div>;

  // VIEW: Active or Ended Poll Results
  if (poll) {
    return (
      <div className="page teacher-dashboard">
        <header className="dashboard-header">
          <div className="badge">Teacher Console</div>
          <span className={`status-tag ${pollEnded ? 'ended' : 'live'}`}>
            {pollEnded ? 'Poll Ended' : 'Live Now'}
          </span>
        </header>

        <section className="active-poll-card">
          <h2 className="section-title">Current Question</h2>
          <div className="question-bar active-q">{poll.question}</div>

          {poll.options && (
            <div className="results-display">
              {poll.options.map((opt, idx) => {
                const result = results?.results?.find(r => r.optionId === opt.optionId);
                const percentage = result?.percentage || 0;
                const hasVotes = results && results.totalVotes > 0;
                return (
                  <div key={opt.optionId} className="poll-option-result">
                    {hasVotes && <div style={{ width: `${percentage}%` }} className="progress-bar-container"></div>}
                    <div className="progress-bar-content">
                      <div className="option-number">{idx + 1}</div>
                      <div className="option-text">{opt.text}</div>
                      <div className="option-percentage">{hasVotes ? `${percentage}%` : '0%'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button className="ask-new-btn" onClick={() => {
            setPoll(null);
            setPollEnded(false);
            setResults(null);
          }}>
            Create New Poll
          </button>
        </section>
      </div>
    );
  }

  // VIEW: Create Poll & History
  return (
    <div className="page teacher-dashboard">
      <header className="dashboard-header">
        <div className="badge">Teacher Console</div>
        <h1>Poll Management</h1>
      </header>

      <section className="create-poll-card">
        <h2 className="section-title">Create a New Poll</h2>
        
        <div className="form-group">
          <label>Question</label>
          <input 
            className="modern-input" 
            placeholder="What would you like to ask?" 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Options</label>
          {options.map((opt, i) => (
            <input 
              key={i} 
              className="modern-input option-input" 
              placeholder={`Option ${i + 1}`} 
              value={opt} 
              onChange={(e) => {
                const copy = [...options];
                copy[i] = e.target.value;
                setOptions(copy);
              }}
            />
          ))}
          <button className="add-opt-btn" onClick={() => setOptions([...options, ""])}>
            + Add Option
          </button>
        </div>

        <div className="form-group">
          <label>Timer Duration</label>
          <select className="modern-select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={30}>30 Seconds</option>
            <option value={60}>1 Minute</option>
            <option value={90}>1.5 Minutes</option>
          </select>
        </div>

        {errorMessage && (
          <div className="error-message">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>×</button>
          </div>
        )}

        <button className="submit-btn" onClick={async () => {
          try {
            await createPoll({
              question,
              options: options
                .filter(Boolean)
                .map((opt, index) => ({
                  optionId: String.fromCharCode(65 + index), 
                  text: opt,
                })),
              durationSeconds: duration,
            });
            setErrorMessage(null);
            setQuestion("");
            setOptions(["", ""]);
          } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to create poll";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(null), 5000);
          }
        }}>
          Launch Poll
        </button>
      </section>

      <div className="history-divider">
        <hr />
        <button className="secondary-btn" onClick={async () => {
          const res = await api.get("/api/polls/history");
          setHistory(res.data);
        }}>
          View Poll History
        </button>
      </div>

      {history.length > 0 && (
        <section className="history-section">
          <h2 className="section-title">Past Polls</h2>

          {history.map((p, idx) => {
            const sortedResults = p.results?.results ? [...p.results.results].sort((a, b) => b.percentage - a.percentage) : [];
            const maxPercentage = sortedResults[0]?.percentage || 0;
            
            return (
              <div key={p.pollId || idx} className="history-item-card">
                <div className="history-header">
                  <span className="history-index">Poll #{history.length - idx}</span>
                  <h3 className="history-question">{p.question}</h3>
                </div>
                
                {p.results?.results && (
                  <div className="history-results-grid">
                    {(p.options || p.results.results).map((item, optIdx) => {
                      const opt = p.options ? item : null;
                      const result = p.results.results.find(r => r.optionId === (opt?.optionId || item.optionId));
                      const percentage = result?.percentage || 0;
                      const isWinner = percentage === maxPercentage && percentage > 0;
                      const optionText = opt?.text || result?.optionId || `Option ${optIdx + 1}`;
                      
                      return (
                        <div key={result?.optionId || optIdx} className={`poll-option-result mini ${isWinner ? 'winner' : ''}`}>
                          <div style={{ width: `${percentage}%` }} className="progress-bar-container"></div>
                          <div className="progress-bar-content">
                            <span className="option-text">{optionText}</span>
                            <span className="option-percentage">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default TeacherPage;