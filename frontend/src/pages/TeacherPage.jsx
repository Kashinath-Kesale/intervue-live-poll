import {useEffect, useState} from "react";
import {createPoll} from "../api/teacherApi";
import {useSocket} from "../hooks/useSocket";
import {fetchActivePoll} from "../api/pollApi";
import { fetchPollResults } from "../api/pollApi";
import api from "../api/axios"; // at top



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
        const load = async () =>{
            try{
                const data = await fetchActivePoll();
                if (data.active) {
                    setPoll(data.poll);
                    const pollResults = await fetchPollResults(data.poll._id);
                    setResults(pollResults);
                }

            } finally{
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


        socket.on("poll:updated", ({ results }) =>{
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
        // eslint-disable-next-line no-unused-vars
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

    if(loading) return <div className="page"><h3>Loading...</h3></div>;


    if(poll && !pollEnded) {
        return (
        <div className="page">
            <h2>Question</h2>
            <div className="question-bar">{poll.question}</div>

            {poll.options && (
            <div>
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
                + Ask a new question
            </button>
        </div>
        );
    }

    if (pollEnded) {
    return (
        <div className="page">
            <h2>Question</h2>
            <div className="question-bar">{poll?.question}</div>

            {results && results.totalVotes > 0 && poll?.options && (
            <div>
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

            <button className="ask-new-btn" onClick={() => {
                setPoll(null);
                setPollEnded(false);
                setResults(null);
            }}>
                + Ask a new question
            </button>
        </div>
    );
    }



    return (
        <div className="page">
        <h2>Create Poll</h2>

        <input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)}/>

        <br/><br/>

        {options.map((opt, i) =>(
            <input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => {
                const copy = [...options];
                copy[i] = e.target.value;
                setOptions(copy);
            }}
            />
        ))}

        <br/><br/>

        <button onClick={() => setOptions([...options, ""])}>Add option</button>

        <br/><br/>

        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
            <option value={90}>90 sec</option>
        </select>


        <br/><br/>

        {errorMessage && (
            <div className="error-message">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)}>×</button>
            </div>
        )}

        <button onClick={async () => {
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
            }}
        >
            Ask Question
        </button>

        <hr />
        <button
        className="secondary"
        onClick={async () => {
            const res = await api.get("/api/polls/history");
            setHistory(res.data);
        }}
        >
        View Poll History
        </button>

        {history.length > 0 && (
        <div style={{ marginTop: "40px" }}>
            <h2 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: 700 }}>View Poll History</h2>

            {history.map((p, idx) => {
                const sortedResults = p.results?.results ? [...p.results.results].sort((a, b) => b.percentage - a.percentage) : [];
                const maxPercentage = sortedResults[0]?.percentage || 0;
                
                return (
                <div key={p.pollId || idx} style={{ marginBottom: "32px" }}>
                    <h3 style={{ marginBottom: "12px", fontSize: "18px", fontWeight: 600 }}>Question {idx + 1}</h3>
                    <div className="question-bar">{p.question}</div>
                    
                    {p.results?.results && (
                        <div>
                            {(p.options || p.results.results).map((item, optIdx) => {
                                const opt = p.options ? item : null;
                                const result = p.results.results.find(r => r.optionId === (opt?.optionId || item.optionId));
                                const percentage = result?.percentage || 0;
                                const isHighlighted = percentage === maxPercentage && percentage > 0;
                                const optionText = opt?.text || result?.optionId || `Option ${optIdx + 1}`;
                                
                                return (
                                <div key={result?.optionId || optIdx} className={`poll-option-result ${isHighlighted ? 'highlighted' : ''}`}>
                                    <div style={{ width: `${percentage}%` }} className="progress-bar-container"></div>
                                    <div className="progress-bar-content">
                                        <div className="option-number">{optIdx + 1}</div>
                                        <div className="option-text">{optionText}</div>
                                        <div className="option-percentage">{percentage}%</div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                );
            })}
        </div>
        )}


        </div>
    );

    
}

export default TeacherPage;