import api from "./axios";

export const fetchActivePoll = async () => {
  const res = await api.get("/api/polls/active");
  return res.data;
};

export const fetchPollResults = async (pollId) => {
  const res = await api.get(`/api/polls/${pollId}/results`);
  return res.data;
};
