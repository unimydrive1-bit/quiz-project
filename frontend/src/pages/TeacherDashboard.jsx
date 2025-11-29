import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LayoutShell from "../components/LayoutShell";
import { fetchTeacherQuizSummary, fetchAllQuizzesForTeacher } from "../api/quizzes";
import client from "../api/client";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    time_limit_seconds: 300,
    shuffle_questions: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [s, q] = await Promise.all([
          fetchTeacherQuizSummary(),
          fetchAllQuizzesForTeacher(),
        ]);
        setSummary(s.data);
        setQuizzes(q.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await client.post("quizzes/", form);
      setQuizzes((prev) => [...prev, res.data]);
      setForm({
        title: "",
        description: "",
        time_limit_seconds: 300,
        shuffle_questions: false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  return (
    <LayoutShell title="Teacher Dashboard">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Hello, {user?.username}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Manage your quizzes, view attempts, and assign quizzes to students.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Create quiz */}
        <div className="md:col-span-1 card">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Create new quiz
          </h2>
          <form onSubmit={handleCreateQuiz}>
            <label className="label">Title</label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <label className="label">Description</label>
            <textarea
              className="input"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />

            <label className="label">Time limit (seconds)</label>
            <input
              className="input"
              type="number"
              name="time_limit_seconds"
              value={form.time_limit_seconds}
              onChange={handleChange}
              min={0}
            />

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="shuffle"
                name="shuffle_questions"
                checked={form.shuffle_questions}
                onChange={handleChange}
              />
              <label htmlFor="shuffle" className="text-sm text-slate-600">
                Shuffle questions
              </label>
            </div>

            <button className="btn-primary w-full" disabled={creating}>
              {creating ? "Creating..." : "Create quiz"}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="md:col-span-2 card">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Quiz overview
          </h2>
          {summary.length === 0 && (
            <p className="text-sm text-slate-500">
              No quizzes yet. Create one on the left.
            </p>
          )}

          <div className="space-y-3">
            {summary.map((q) => (
  <div
    key={q.quiz_id}
    className="flex justify-between items-center border-b border-slate-100 pb-2"
  >
    <div>
      <p className="font-semibold text-slate-800">{q.title}</p>
      <p className="text-xs text-slate-400">
        Attempts: {q.attempts}
      </p>
    </div>

    <div className="flex gap-2">
      <Link
        to={`/teacher/quizzes/${q.quiz_id}/questions`}
        className="btn-primary text-xs"
      >
        Manage Questions
      </Link>

      <Link
        to={`/teacher/quizzes/${q.quiz_id}/attempts`}
        className="btn-secondary text-xs"
      >
        View attempts
      </Link>
    </div>
  </div>
))}

          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
