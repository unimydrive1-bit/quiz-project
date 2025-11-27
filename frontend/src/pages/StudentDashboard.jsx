import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LayoutShell from "../components/LayoutShell";
import { fetchAssignedQuizzes } from "../api/quizzes";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAssignedQuizzes();
        setQuizzes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <LayoutShell title="Student Dashboard">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Welcome, {user?.username}
      </h1>

      <h2 className="text-lg font-semibold text-slate-700 mb-3">
        Your assigned quizzes
      </h2>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {!loading && quizzes.length === 0 && (
        <div className="text-sm text-slate-500">
          No quizzes assigned yet. Check back later.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="card">
            <h3 className="text-lg font-semibold text-slate-800">{q.title}</h3>
            {q.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                {q.description}
              </p>
            )}
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Time limit:{" "}
                {q.time_limit_seconds
                  ? `${Math.round(q.time_limit_seconds / 60)} min`
                  : "No limit"}
              </span>
              <Link
                to={`/quiz/${q.id}/start`}
                className="btn-primary text-xs"
              >
                Start quiz
              </Link>
            </div>
          </div>
        ))}
      </div>
    </LayoutShell>
  );
}
