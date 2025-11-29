import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 text-center px-4">
      
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-8">
        QuizApp
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Link
          to="/login"
          className="bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition text-lg"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-slate-200 text-slate-800 py-3 rounded-lg font-medium hover:bg-slate-300 transition text-lg"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
