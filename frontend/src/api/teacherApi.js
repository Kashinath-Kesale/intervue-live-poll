import api from "./axios";

export const createPoll = async ({question, options, durationSeconds}) => {
    const res = await api.post('/api/polls', {
        question,
        options,
        durationSeconds,
    });

    return res.data;
}