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
      if (!authTokens?.access) return null;
      return jwtDecode(authTokens.access);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(username, password);
      if (res.status === 200) {
        setAuthTokens(res.data);
        setUser(res.data.user);
        localStorage.setItem("authTokens", JSON.stringify(res.data));
        return { ok: true };
      }
    } catch (err) {
      console.error(err);
      return { ok: false, error: "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (payload) => {
    setLoading(true);
    try {
      const res = await apiRegister(payload);
      if (res.status === 201) {
        return { ok: true };
      }
    } catch (err) {
      console.error(err);
      return { ok: false, error: "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
  };

  useEffect(() => {
    if (authTokens?.access) {
      try {
        const data = jwtDecode(authTokens.access);
        setUser(data);
      } catch {
        logoutUser();
      }
    }
  }, []);

  const value = {
    user,
    authTokens,
    loginUser,
    registerUser,
    logoutUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
