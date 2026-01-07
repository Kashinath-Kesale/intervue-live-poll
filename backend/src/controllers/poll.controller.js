import {createPoll, getActivePoll, submitVote, getPollResults, getPollHistory} from '../services/poll.service.js';

export const createPollController = async(req, res)=>{
    try{
        const poll = await createPoll(req.body);
        res.status(201).json(poll);
    }
    catch(err) {
        res.status(400).json({message: err.message});
    }
};

export const getActivePollController = async(req, res) =>{
    try{
        const poll = await getActivePoll();
        if(!poll) {
            return res.json({active: false});
        }

        const now = new Date();

        const elapsedSeconds = Math.floor((now - poll.startTime) / 1000);
        const remainingSeconds = Math.max(poll.durationSeconds - elapsedSeconds, 0); 
    
        res.json({
            active: true,
            poll, 
            remainingSeconds
        });
    }
    catch(err) {
        res.status(500).json({message: 'Failed to fetch active poll'});
    }
};

export const submitVoteController = async(req, res) =>{
    try{
        const vote = await submitVote(req.body);
        res.status(201).json(vote);
    }
    catch(err) {
        res.status(400).json({message: err.message});
    }
}

export const getPollResultsController = async(req, res)=> {
    try{
        const {pollId} = req.params;
        const data = await getPollResults(pollId);
        res.json(data);
    }
    catch(err) {
        res.status(500).json({message: 'Failed to fetch poll results'});
    }
}


export const getPollHistoryController = async(req, res) => {
    try{
        const history = await getPollHistory();
        res.json(history);
    }
    catch(err) {
        res.status(500).json({message: 'Failed to poll history'});
    }
};

