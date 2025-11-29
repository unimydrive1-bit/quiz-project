import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import {
  fetchAllQuizzesForTeacher,
  createQuiz,
  deleteQuiz,             // ⭐ NEW API IMPORT
} from "../api/quizzes";
import { Link } from "react-router-dom";
import LayoutShell from "../components/LayoutShell";

export default function TeacherDashboard() {
  const { authTokens } = useAuth();
  const token = authTokens?.access || null;

  const [quizzes, setQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Create Quiz Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [unlimitedAttempts, setUnlimitedAttempts] = useState(false);

  // Load quizzes from API
  const loadQuizzes = async () => {
    try {
      const response = await fetchAllQuizzesForTeacher();
      setQuizzes(response.data);
    } catch (err) {
      console.error("Failed to load quizzes", err);
    }
  };

  useEffect(() => {
    if (token) loadQuizzes();
  }, [token]);

  // ⭐ CREATE QUIZ — backend includes created_at now
  const handleCreateQuiz = async () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (timeLimitMinutes < 1) {
      alert("Time limit must be at least 1 minute.");
      return;
    }

    if (!unlimitedAttempts && maxAttempts < 1) {
      alert("Max attempts must be at least 1.");
      return;
    }

    try {
      const payload = {
        title,
        description,
        time_limit_seconds: timeLimitMinutes * 60,
        max_attempts: unlimitedAttempts ? null : maxAttempts,
        shuffle_questions: false,
      };

      const res = await createQuiz(payload);
      await loadQuizzes();

      alert(
        `Quiz created at: ${new Date(res.data.created_at).toLocaleString()}`
      );

      // Reset form
      setShowModal(false);
      setTitle("");
      setDescription("");
      setTimeLimitMinutes(1);
      setMaxAttempts(1);
      setUnlimitedAttempts(false);

    } catch (err) {
      console.error("Failed to create quiz", err);
      alert("Failed to create quiz");
    }
  };

  // ⭐ DELETE QUIZ
  const handleDeleteQuiz = async (quizId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmDelete) return;

    try {
      await deleteQuiz(quizId);
      await loadQuizzes();
    } catch (err) {
      console.error("Failed to delete quiz", err);
      alert("Failed to delete quiz");
    }
  };

  return (
    <LayoutShell title="Teacher Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Quizzes</h1>

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={() => setShowModal(true)}
        >
          + Create Quiz
        </button>
      </div>

      {/* QUIZ LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white shadow rounded-lg p-4 hover:shadow-md transition relative"
          >
            {/* ⭐ DELETE BUTTON */}
            <button
              onClick={() => handleDeleteQuiz(quiz.id)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
            >
              ✖
            </button>

            <Link to={`/teacher/quizzes/${quiz.id}/questions`}>
              <h3 className="text-xl font-semibold">{quiz.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>

              <p className="text-xs text-slate-400 mt-2">
                ⏱ Time Limit: {quiz.time_limit_seconds / 60} min
              </p>

              <p className="text-xs text-slate-400">
                🔁 Attempts: {quiz.max_attempts === null ? "Unlimited" : quiz.max_attempts}
              </p>

              <p className="text-xs text-slate-400">
                📅 Created: {new Date(quiz.created_at).toLocaleString()}
              </p>
            </Link>
          </div>
        ))}
      </div>

      {/* CREATE QUIZ MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>

            {/* Title */}
            <label className="label">Title</label>
            <input
              className="input mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Description */}
            <label className="label">Description</label>
            <textarea
              className="input mb-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {/* Time Limit */}
            <label className="label">Time Limit (Minutes)</label>
            <input
              type="number"
              min="1"
              className="input mb-4"
              value={timeLimitMinutes}
              onChange={(e) =>
                setTimeLimitMinutes(Number(e.target.value))
              }
            />

            {/* Max Attempts */}
            <label className="label">Max Attempts</label>
            <input
              type="number"
              min="1"
              disabled={unlimitedAttempts}
              className={`input mb-1 ${
                unlimitedAttempts ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />

            {/* Unlimited Attempts */}
            <label className="flex items-center gap-2 mt-1 mb-4">
              <input
                type="checkbox"
                checked={unlimitedAttempts}
                onChange={(e) => setUnlimitedAttempts(e.target.checked)}
              />
              Unlimited Attempts
            </label>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateQuiz}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
