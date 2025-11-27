import client from "./client";

export const fetchAssignedQuizzes = () =>
  client.get("student/quizzes/assigned/");

export const fetchQuiz = (quizId) =>
  client.get(`quizzes/${quizId}/`);

export const startQuizAttempt = (quizId) =>
  client.post(`quizzes/${quizId}/start/`);

export const fetchTeacherQuizSummary = () =>
  client.get("teacher/quizzes/summary/");

export const fetchTeacherQuizAttempts = (quizId) =>
  client.get(`teacher/quizzes/${quizId}/attempts/`);

export const fetchAllQuizzesForTeacher = () =>
  client.get("quizzes/");
