import client from "./client";

// STUDENT ENDPOINTS
export const fetchAssignedQuizzes = () =>
  client.get("student/quizzes/assigned/");

export const fetchQuiz = (quizId) =>
  client.get(`quizzes/${quizId}/`);

export const startQuizAttempt = (quizId) =>
  client.post(`quizzes/${quizId}/start/`);

// TEACHER ENDPOINTS
export const fetchTeacherQuizSummary = () =>
  client.get("teacher/quizzes/summary/");

export const fetchTeacherQuizAttempts = (quizId) =>
  client.get(`teacher/quizzes/${quizId}/attempts/`);

export const fetchAllQuizzesForTeacher = () =>
  client.get("quizzes/");

//  Create a quiz
export const createQuiz = (payload) =>
  client.post("quizzes/", payload);

//  DELETE a quiz (ADD THIS!)
export const deleteQuiz = (quizId) =>
  client.delete(`quizzes/${quizId}/`);
