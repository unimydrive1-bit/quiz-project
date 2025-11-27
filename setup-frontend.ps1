Write-Host "=== Setting up FRONTEND ==="

# Ensure frontend folder exists
if (-Not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend folder not found. Run: npm create vite@latest frontend -- --template react"
    exit
}

cd frontend

# Create required folders if missing
$folders = @(
    "src/api",
    "src/context",
    "src/hooks",
    "src/components",
    "src/pages",
    "src/components/ui",
    "src/components/quiz",
    "src/components/attempts"
)

foreach ($f in $folders) {
    if (-Not (Test-Path $f)) {
        New-Item -ItemType Directory -Force -Path $f | Out-Null
        Write-Host "Created folder: $f"
    }
}

# Helper: Write file ONLY if empty or missing
function Write-Code($path, $code) {
    if (-Not (Test-Path $path)) {
        $code | Set-Content $path
        Write-Host "Created: $path"
    } else {
        # overwrite without asking
        $code | Set-Content $path
        Write-Host "Updated: $path"
    }
}

#########################
# API FILES
#########################

Write-Code "src/api/client.js" @"
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem("authTokens");
  if (raw) {
    try {
      const tokens = JSON.parse(raw);
      config.headers.Authorization = `Bearer ${tokens.access}`;
    } catch (e) {}
  }
  return config;
});

export default client;
"@

Write-Code "src/api/auth.js" @"
import client from "./client";

export const login = (username, password) =>
  client.post("/auth/login/", { username, password });

export const register = (payload) =>
  client.post("/auth/register/", payload);
"@

Write-Code "src/api/quizzes.js" @"
import client from "./client";

export const fetchAssignedQuizzes = () =>
  client.get("/student/quizzes/assigned/");

export const fetchQuiz = (quizId) =>
  client.get(`/quizzes/${quizId}/`);

export const startQuizAttempt = (quizId) =>
  client.post(`/quizzes/${quizId}/start/`);

export const fetchTeacherQuizSummary = () =>
  client.get("/teacher/quizzes/summary/");

export const fetchTeacherQuizAttempts = (quizId) =>
  client.get(`/teacher/quizzes/${quizId}/attempts/`);
"@

Write-Code "src/api/attempts.js" @"
import client from "./client";

export const fetchAttempt = (id) => client.get(`/attempts/${id}/`);

export const submitAnswer = (id, payload) =>
  client.post(`/attempts/${id}/answer/`, payload);

export const finishAttempt = (id) =>
  client.post(`/attempts/${id}/finish/`);
"@

#########################
# AuthContext
#########################

Write-Code "src/context/AuthContext.jsx" @"
import { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { login as apiLogin, register as apiRegister } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const raw = localStorage.getItem("authTokens");
    return raw ? JSON.parse(raw) : null;
  });

  const [user, setUser] = useState(() => {
    try {
      return authTokens ? jwtDecode(authTokens.access) : null;
    } catch {
      return null;
    }
  });

  const loginUser = async (username, password) => {
    const res = await apiLogin(username, password);
    if (res.status === 200) {
      setAuthTokens(res.data);
      setUser(res.data.user);
      localStorage.setItem("authTokens", JSON.stringify(res.data));
      return true;
    }
    return false;
  };

  const registerUser = async (payload) => {
    const res = await apiRegister(payload);
    return res.status === 201;
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
  };

  useEffect(() => {
    if (authTokens) {
      try {
        setUser(jwtDecode(authTokens.access));
      } catch {}
    }
  }, [authTokens]);

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
"@

#########################
# Hooks
#########################

Write-Code "src/hooks/useAuth.js" @"
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default () => useContext(AuthContext);
"@

#########################
# ProtectedRoute
#########################

Write-Code "src/components/ProtectedRoute.jsx" @"
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
"@

#########################
# Pages
#########################

Write-Code "src/pages/LoginPage.jsx" @"
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await loginUser(form.username, form.password);
    if (ok) navigate("/");
    else alert("Invalid credentials");
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Username"
               value={form.username}
               onChange={(e) => setForm({ ...form, username: e.target.value })} />

        <input type="password"
               placeholder="Password"
               value={form.password}
               onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button>Login</button>
      </form>

      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
"@

Write-Code "src/pages/RegisterPage.jsx" @"
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await registerUser(form);
    if (ok) navigate("/login");
    else alert("Registration Failed");
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Username"
               value={form.username}
               onChange={(e) => setForm({ ...form, username: e.target.value })} />

        <input placeholder="Email"
               value={form.email}
               onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input type="password"
               placeholder="Password"
               value={form.password}
               onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <select value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <button>Create Account</button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
"@

Write-Code "src/pages/StudentDashboard.jsx" @"
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { fetchAssignedQuizzes } from "../api/quizzes";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { user, logoutUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchAssignedQuizzes().then((res) => setQuizzes(res.data));
  }, []);

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome {user.username}</p>
      <button onClick={logoutUser}>Logout</button>

      <h3>Your Quizzes</h3>
      {quizzes.map((q) => (
        <div key={q.id}>
          <h4>{q.title}</h4>
          <p>{q.description}</p>
          <Link to={`/quiz/${q.id}/start`}>Start</Link>
        </div>
      ))}
    </div>
  );
}
"@

Write-Code "src/pages/TeacherDashboard.jsx" @"
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { fetchTeacherQuizSummary } from "../api/quizzes";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const { user, logoutUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchTeacherQuizSummary().then((res) => setQuizzes(res.data));
  }, []);

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <p>Welcome {user.username}</p>
      <button onClick={logoutUser}>Logout</button>

      <h3>Your Quizzes</h3>
      {quizzes.map((q) => (
        <div key={q.quiz_id}>
          <h4>{q.title}</h4>
          <p>Attempts: {q.attempts}</p>
          <Link to={`/teacher/quizzes/${q.quiz_id}/attempts`}>View attempts</Link>
        </div>
      ))}
    </div>
  );
}
"@

Write-Code "src/pages/QuizTaking.jsx" @"
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuiz, startQuizAttempt } from "../api/quizzes";
import { fetchAttempt, submitAnswer, finishAttempt } from "../api/attempts";

export default function QuizTaking() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchQuiz(quizId).then((res) => setQuiz(res.data));
  }, [quizId]);

  const start = async () => {
    const res = await startQuizAttempt(quizId);
    setAttempt(res.data);
  };

  useEffect(() => {
    if (attempt) {
      fetchAttempt(attempt.id).then((res) => setAttempt(res.data));
    }
  }, [attempt?.id]);

  if (!quiz) return <p>Loading...</p>;
  if (!attempt)
    return (
      <div>
        <h2>{quiz.title}</h2>
        <button onClick={start}>Start Quiz</button>
      </div>
    );

  const q = attempt.quiz.questions[currentIndex];

  const answer = async (choiceId) => {
    await submitAnswer(attempt.id, { question: q.id, selected_choice: choiceId });
    const a = await fetchAttempt(attempt.id);
    setAttempt(a.data);
  };

  const finish = async () => {
    const res = await finishAttempt(attempt.id);
    alert(`Score: ${res.data.score}%`);
    navigate("/");
  };

  return (
    <div>
      <h2>{attempt.quiz.title}</h2>
      <h3>Question {currentIndex + 1}</h3>
      <p>{q.text}</p>

      {q.choices.map((c) => (
        <button key={c.id} onClick={() => answer(c.id)}>
          {c.text}
        </button>
      ))}

      <div>
        <button disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}>
          Prev
        </button>

        <button disabled={currentIndex === attempt.quiz.questions.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}>
          Next
        </button>
      </div>

      <button onClick={finish}>Finish</button>
    </div>
  );
}
"@

Write-Code "src/pages/TeacherQuizAttempts.jsx" @"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTeacherQuizAttempts } from "../api/quizzes";

export default function TeacherQuizAttempts() {
  const { quizId } = useParams();
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchTeacherQuizAttempts(quizId).then((res) => setAttempts(res.data));
  }, [quizId]);

  return (
    <div>
      <h2>Quiz Attempts</h2>
      {attempts.map((a) => (
        <div key={a.id}>
          <p>Student: {a.student_name}</p>
          <p>Score: {a.score}%</p>
        </div>
      ))}
    </div>
  );
}
"@

#########################
# App.jsx
#########################

Write-Code "src/App.jsx" @"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuizTaking from "./pages/QuizTaking";
import TeacherQuizAttempts from "./pages/TeacherQuizAttempts";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }/>

          <Route path="/quiz/:quizId/start" element={
            <ProtectedRoute role="student">
              <QuizTaking />
            </ProtectedRoute>
          }/>

          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }/>

          <Route path="/teacher/quizzes/:quizId/attempts" element={
            <ProtectedRoute role="teacher">
              <TeacherQuizAttempts />
            </ProtectedRoute>
          }/>
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
"@

#########################
# main.jsx
#########################

Write-Code "src/main.jsx" @"
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@

Write-Host "=== FRONTEND SETUP COMPLETE ==="
Write-Host "Run: npm run dev"
