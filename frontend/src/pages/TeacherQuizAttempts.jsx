import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LayoutShell from "../components/LayoutShell";
import { fetchTeacherQuizAttempts } from "../api/quizzes";

export default function TeacherQuizAttempts() {
  const { quizId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTeacherQuizAttempts(quizId);
        setAttempts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  return (
    <LayoutShell title="Quiz Attempts">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Attempts for quiz #{quizId}
      </h1>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {!loading && attempts.length === 0 && (
        <p className="text-sm text-slate-500">
          No attempts yet for this quiz.
        </p>
      )}

      <div className="space-y-3">
        {attempts.map((a) => (
          <div
            key={a.id}
            className="card flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {a.student_name}
              </p>
              <p className="text-xs text-slate-500">
                Started: {new Date(a.start_time).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {a.score !== null ? `${a.score}%` : "Not graded"}
              </p>
              <p className="text-xs text-slate-400">
                Correct: {a.total_correct} · Wrong: {a.total_wrong}
              </p>
            </div>
          </div>
        ))}
      </div>
    </LayoutShell>
  );
}
