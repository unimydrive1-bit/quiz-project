import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await registerUser(form);
    if (res.ok) {
      navigate("/login");
    } else {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <div className="app-container">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-slate-800 text-center">
          Create account
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Choose role: Teacher or Student
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
            required
          />

          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <label className="label">Password</label>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="label">Role</label>
          <select
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Already have an account?{" "}
          <Link className="link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
