import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function LayoutShell({ children, title }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">QuizApp</span>
            {title && (
              <span className="text-sm text-slate-500 border-l border-slate-300 pl-2">
                {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-slate-600">
                  Signed in as{" "}
                  <span className="font-semibold">{user.username}</span>{" "}
                  <span className="badge ml-2">
                    {user.role === "teacher" ? "Teacher" : "Student"}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-500 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        Built with Django & React · Tailwind UI
      </footer>
    </div>
  );
}
