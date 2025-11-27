import client from "./client";

export const fetchAttempt = (id) =>
  client.get(`attempts/${id}/`);

export const submitAnswer = (id, payload) =>
  client.post(`attempts/${id}/answer/`, payload);

export const finishAttempt = (id) =>
  client.post(`attempts/${id}/finish/`);

export const reviewWrongAnswers = (id) =>
  client.get(`attempts/${id}/review/`);
