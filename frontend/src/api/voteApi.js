import api from "./axios";

export const submitVote = async ({ pollId, optionId, sessionId }) => {
  const res = await api.post("/api/polls/vote", {
    pollId,
    optionId,
    sessionId,
  });
  return res.data;
};
