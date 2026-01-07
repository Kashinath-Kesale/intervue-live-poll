import {Poll} from '../models/poll.model.js';
import {Vote} from '../models/vote.model.js';
import {io} from '../server.js';

export const createPoll = async ({ question, options, durationSeconds }) => {
    const activePoll = await Poll.findOne({ status: "ACTIVE" });

    if (activePoll) {
        const expired = await checkAndCompletePollIfExpired(activePoll);
        if (!expired) throw new Error("An active poll already exists");
    }

    const poll = await Poll.create({
        question,
        options,
        durationSeconds,
        startTime: new Date(),
        status: "ACTIVE",
    });

    io.emit("poll:created", poll);

    setTimeout(async () => {
        const freshPoll = await Poll.findById(poll._id);

        if (freshPoll && freshPoll.status === "ACTIVE") {
            freshPoll.status = "COMPLETED";
            await freshPoll.save();

            io.emit("poll:ended", { pollId: freshPoll._id });
        }
    }, durationSeconds * 1000);

    return poll;
};


export const getActivePoll = async()=>{
    const poll = await Poll.findOne({status: 'ACTIVE'});

    if(!poll) return null;

    const expired = await checkAndCompletePollIfExpired(poll);
    if(expired) return null;

    return poll;
};

export const submitVote = async({pollId, optionId, sessionId}) =>{
    const poll = await Poll.findById(pollId);

    if(!poll || poll.status !== 'ACTIVE') {
        throw new Error('Poll is not active');
    }

    const expired = await checkAndCompletePollIfExpired(poll);
    if(expired) {
        throw new Error('Poll has ended');
    }

    const vote = await Vote.create({
        pollId, optionId, sessionId
    });

    const results = await getPollResults(pollId);

    io.emit('poll:updated', {
        pollId, results
    });

    return vote;
}



export const getPollResults = async(pollId) => {
    const votes = await Vote.find({pollId});

    const counts = {};

    votes.forEach(v =>{
        counts[v.optionId] = (counts[v.optionId] || 0) + 1;
    });

    const totalVotes = votes.length;

    const results = Object.keys(counts).map(optionId => ({
        optionId,
        count: counts[optionId],
        percentage: totalVotes === 0 ? 0 : Math.round((counts[optionId] / totalVotes) * 100)
    }));


    return {totalVotes, results};
}


export const checkAndCompletePollIfExpired = async(poll)=> {
    const elapsedSeconds = Math.floor((Date.now() - poll.startTime.getTime()) / 1000);

    if(elapsedSeconds >= poll.durationSeconds) {
        poll.status = 'COMPLETED';
        await poll.save();

        io.emit('poll:ended', {pollId: poll._id});

        return true;
    }

    return false;
}


export const getPollHistory = async() => {
    const polls = await Poll.find({status: 'COMPLETED'}).sort({createdAt: -1});

    const history = [];

    for(const poll of polls) {
        const results = await getPollResults(poll._id);

        history.push({
            pollId: poll._id,
            question: poll.question,
            options: poll.options,
            durationSeconds: poll.durationSeconds,
            createdAt: poll.createdAt,
            results
        });
    }

    return history;
}

