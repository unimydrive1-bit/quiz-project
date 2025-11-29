import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getQuestionsForQuiz,
  createQuestion,
  deleteQuestion,
  createChoice,
} from "../api/questions";
import StepType from "../components/questions/StepType";
import StepText from "../components/questions/StepText";
import StepTrueFalse from "../components/questions/StepTrueFalse";
import StepChoices from "../components/questions/StepChoices";
import StepConfirm from "../components/questions/StepConfirm";

export default function ManageQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { authTokens } = useAuth();

  const token = authTokens?.access || null;

  const [questions, setQuestions] = useState([]);

  // Wizard state
  const [step, setStep] = useState(1);          // 1: type, 2: text, 3: options, 4: confirm
  const [qtype, setQtype] = useState("mcq");    // "mcq" | "tf" | "short"
  const [text, setText] = useState("");
  const [choices, setChoices] = useState([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);
  const [tfValue, setTfValue] = useState("true"); // "true" or "false"

  // Load existing questions for this quiz
  const loadQuestions = async () => {
    try {
      const data = await getQuestionsForQuiz(quizId, token);
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadQuestions();
    }
  }, [quizId, token]);

  const resetWizard = () => {
    setStep(1);
    setQtype("mcq");
    setText("");
    setChoices([
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ]);
    setTfValue("true");
  };

  const handleSaveQuestion = async () => {
    if (!token) return;

    // 1) create the Question
    const payload = {
      quiz: quizId,
      text,
      qtype,
      points: 1,
      order: questions.length + 1,
    };

    try {
      const question = await createQuestion(payload, token);

      // 2) create Choices depending on type
      if (qtype === "mcq") {
        for (let i = 0; i < choices.length; i++) {
          const c = choices[i];
          if (!c.text.trim()) continue; // skip empty
          await createChoice(
            {
              question: question.id,
              text: c.text,
              is_correct: !!c.is_correct,
              order: i,
            },
            token
          );
        }
      } else if (qtype === "tf") {
        // True / False exactly one correct
        await createChoice(
          {
            question: question.id,
            text: "True",
            is_correct: tfValue === "true",
            order: 0,
          },
          token
        );
        await createChoice(
          {
            question: question.id,
            text: "False",
            is_correct: tfValue === "false",
            order: 1,
          },
          token
        );
      }
      // short answer → no choices

      await loadQuestions();
      resetWizard();
    } catch (err) {
      console.error("Failed to save question", err);
      alert("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!token) return;
    if (!window.confirm("Delete this question?")) return;

    try {
      await deleteQuestion(id, token);
      loadQuestions();
    } catch (err) {
      console.error("Failed to delete question", err);
      alert("Failed to delete question");
    }
  };

  const handleSaveQuiz = () => {
    // Nothing special to do server-side here,
    // questions are already saved individually.
    // Just navigate back to teacher dashboard.
    navigate("/teacher/dashboard");
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Questions</h1>

        <button
          onClick={handleSaveQuiz}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Save Quiz & Return to Dashboard
        </button>
      </div>

      {/* Existing questions list */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Existing Questions</h2>

        {questions.length === 0 && (
          <p className="text-sm text-gray-500">
            No questions yet. Use the wizard below to add questions.
          </p>
        )}

        <ul className="space-y-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex justify-between items-center border-b last:border-b-0 pb-2"
            >
              <div>
                <p className="font-medium">{q.text}</p>
                <p className="text-xs text-gray-500">Type: {q.qtype}</p>
              </div>

              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Wizard */}
      <div className="max-w-3xl mx-auto">
        {step === 1 && (
          <StepType
            qtype={qtype}
            setQtype={setQtype}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepText
            text={text}
            setText={setText}
            onBack={() => setStep(1)}
            onNext={() => {
              if (qtype === "short") {
                setStep(4);
              } else {
                setStep(3);
              }
            }}
          />
        )}

        {step === 3 && qtype === "tf" && (
          <StepTrueFalse
            tfValue={tfValue}
            setTfValue={setTfValue}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 3 && qtype === "mcq" && (
          <StepChoices
            choices={choices}
            setChoices={setChoices}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <StepConfirm
            text={text}
            qtype={qtype}
            choices={choices}
            tfValue={tfValue}
            onBack={() => {
              if (qtype === "short") {
                setStep(2);
              } else {
                setStep(3);
              }
            }}
            onSave={handleSaveQuestion}
          />
        )}
      </div>
    </div>
  );
}
