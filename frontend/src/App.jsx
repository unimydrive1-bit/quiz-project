import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import QuizTaking from "./pages/QuizTaking";

// Teacher pages
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherQuizAttempts from "./pages/TeacherQuizAttempts";
import ManageQuestions from "./pages/ManageQuestions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ---------- STUDENT ROUTES ---------- */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz/:quizId/start"
            element={
              <ProtectedRoute role="student">
                <QuizTaking />
              </ProtectedRoute>
            }
          />

          {/* ---------- TEACHER ROUTES ---------- */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/quizzes/:quizId/attempts"
            element={
              <ProtectedRoute role="teacher">
                <TeacherQuizAttempts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/quizzes/:quizId/questions"
            element={
              <ProtectedRoute role="teacher">
                <ManageQuestions />
              </ProtectedRoute>
            }
          />

          {/* ---------- FALLBACK ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
