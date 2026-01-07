import {useEffect, useState} from 'react';
import { fetchActivePoll, fetchPollResults } from "../api/pollApi";


export const useActivePoll = (socketRef) =>{
    const [pollEnded, setPollEnded] = useState(false);
    const [results, setResults] = useState(null);
    const [poll, setPoll] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{// rest - recovery on load
        const loadPoll = async ()=>{
            try{
                const data = await fetchActivePoll();

                if(data.active) {
                    setPoll(data.poll);
                    setRemainingSeconds(data.remainingSeconds);

                    try{
                        const pollResults = await fetchPollResults(data.poll._id);
                        setResults(pollResults);
                    }
                    catch {
                        setResults(null);
                    }
                }
                else {
                    setPoll(null);
                    setResults(null);
                }
            }
            // eslint-disable-next-line no-unused-vars
            catch(err) {
                console.error('Failed to fetch active poll');
            }
            finally {
                setLoading(false);
            }
        };
        loadPoll();
    }, []);



    useEffect(() => { // socket for real time poll creation
        if(!socketRef?.current) return;

        const socket = socketRef.current;

        socket.on('poll:created', (newPoll) => {
            setPollEnded(false);
            setPoll(newPoll);
            setResults(null); // Clear previous poll results

            const elapsedSeconds = Math.floor(
                (Date.now() - new Date(newPoll.startTime).getTime()) / 1000);

            const remaining = Math.max(newPoll.durationSeconds - elapsedSeconds, 0);

            setRemainingSeconds(remaining);
        });

        return () => {
            socket.off('poll:created');
        };
    }, [socketRef]);


    useEffect(() => { // to show real results
        if(!socketRef?.current) return;

        const socket = socketRef.current;

        socket.on('poll:updated', ({ results }) => {
            setResults(results);
        });

        return() => {
            socket.off('poll:updated');
        };
    }, [socketRef]);

    useEffect(() => {
        if(!socketRef?.current) return;

        const socket = socketRef.current;

        socket.on('poll:ended', () => {
            setPollEnded(true);
            setPoll(null);
            setRemainingSeconds(0);
        });

        return () => {
            socket.off('poll:ended');
        };
    }, [socketRef]);

    useEffect(() => {
        if(remainingSeconds === 0 && poll) {
            setPollEnded(true);
            setPoll(null);
        }
    }, [remainingSeconds, poll]);

    return {poll, remainingSeconds, results, pollEnded, loading};
}