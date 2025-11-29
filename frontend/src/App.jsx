import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuizTaking from "./pages/QuizTaking";
import TeacherQuizAttempts from "./pages/TeacherQuizAttempts";
import ManageQuestions from "./pages/ManageQuestions";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student routes */}
          <Route
            path="/"
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

          {/* Teacher routes */}
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


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
