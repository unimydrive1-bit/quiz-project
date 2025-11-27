import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { loginUser, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await loginUser(form.username, form.password);
    if (res.ok) {
      // redirect by role
      if (res?.user?.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="app-container">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-slate-800 text-center">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Sign in to access your quizzes
        </p>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="label">Username</label>
          <input
            className="input"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />

          <label className="label">Password</label>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button
            className="btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          No account?{" "}
          <Link className="link" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
