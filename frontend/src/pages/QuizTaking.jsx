import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchQuiz,
  startQuizAttempt
} from "../api/quizzes";
import {
  fetchAttempt,
  submitAnswer,
  finishAttempt,
  reviewWrongAnswers
} from "../api/attempts";
import LayoutShell from "../components/LayoutShell";

export default function QuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [review, setReview] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchQuiz(quizId);
      setQuiz(res.data);
    };
    load();
  }, [quizId]);

  const handleStart = async () => {
    try {
      const res = await startQuizAttempt(quizId);
      setAttempt(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to start attempt");
    }
  };

  useEffect(() => {
    if (!attempt?.id) return;
    const load = async () => {
      try {
        const res = await fetchAttempt(attempt.id);
        setAttempt(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [attempt?.id]);

  const questions = useMemo(
    () => attempt?.quiz?.questions || [],
    [attempt]
  );

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (choiceId) => {
    if (!attempt || !currentQuestion) return;
    setSubmitting(true);
    try {
      await submitAnswer(attempt.id, {
        question: currentQuestion.id,
        selected_choice: choiceId,
      });
      const res = await fetchAttempt(attempt.id);
      setAttempt(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!attempt) return;
    setFinishing(true);
    try {
      const res = await finishAttempt(attempt.id);
      const data = res.data;
      const rev = await reviewWrongAnswers(attempt.id);
      setReview({
        score: data.score,
        total_correct: data.total_correct,
        total_wrong: data.total_wrong,
        wrong_answers: rev.data,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to finish attempt");
    } finally {
      setFinishing(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  if (!quiz) {
    return (
      <LayoutShell title="Quiz">
        <p className="text-sm text-slate-500">Loading quiz...</p>
      </LayoutShell>
    );
  }

  if (review) {
    return (
      <LayoutShell title={quiz.title}>
        <div className="card max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Quiz finished!
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Score:{" "}
            <span className="font-semibold">
              {review.score}%
            </span>{" "}
            · Correct: {review.total_correct} · Wrong: {review.total_wrong}
          </p>

          <h3 className="text-md font-semibold text-slate-700 mb-2">
            Review wrong answers
          </h3>
          {review.wrong_answers.length === 0 ? (
            <p className="text-sm text-green-600">
              Amazing! You answered everything correctly.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {review.wrong_answers.map((ans) => (
                <li
                  key={ans.id}
                  className="border border-red-100 bg-red-50 rounded-lg p-3"
                >
                  <p className="font-semibold text-slate-800">
                    {ans.question_text || "Question"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Your answer: {ans.selected_choice_text || ans.short_answer_text || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleBackToDashboard}
            className="btn-primary w-full mt-4"
          >
            Back to dashboard
          </button>
        </div>
      </LayoutShell>
    );
  }

  if (!attempt) {
    return (
      <LayoutShell title={quiz.title}>
        <div className="card max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="text-sm text-slate-600 mb-4">
              {quiz.description}
            </p>
          )}
          <p className="text-xs text-slate-500 mb-4">
            Time limit:{" "}
            {quiz.time_limit_seconds
              ? `${Math.round(quiz.time_limit_seconds / 60)} minutes`
              : "No time limit"}
          </p>
          <button onClick={handleStart} className="btn-primary w-full">
            Start quiz
          </button>
        </div>
      </LayoutShell>
    );
  }

  if (!currentQuestion) {
    return (
      <LayoutShell title={quiz.title}>
        <p className="text-sm text-slate-500">No questions in this quiz.</p>
      </LayoutShell>
    );
  }

  const progress = `${currentIndex + 1} / ${questions.length}`;

  return (
    <LayoutShell title={quiz.title}>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">Question {progress}</span>
            {attempt.time_limit_seconds && (
              <span className="text-xs text-red-500">
                Time limit: {Math.round(attempt.time_limit_seconds / 60)} min
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            {currentQuestion.text}
          </h2>

          <div className="space-y-2">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswer(choice.id)}
                className="w-full text-left border border-slate-200 rounded-lg px-3 py-2 text-sm hover:bg-indigo-50 transition disabled:opacity-60"
                disabled={submitting}
              >
                {choice.text}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              className="btn-secondary text-xs"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </button>
            <button
              className="btn-secondary text-xs"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-slate-800 mb-2">
              Quiz progress
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Answer each question, then press{" "}
              <strong>Finish quiz</strong> when you’re done.
            </p>
          </div>
          <button
            className="btn-primary w-full mt-4"
            onClick={handleFinish}
            disabled={finishing}
          >
            {finishing ? "Finishing..." : "Finish quiz"}
          </button>
        </div>
      </div>
    </LayoutShell>
  );
}
