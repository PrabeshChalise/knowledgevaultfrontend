import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kv_token");
    const userJson = localStorage.getItem("kv_user");
    if (token && userJson) {
      setUser(JSON.parse(userJson));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("kv_token", res.data.token);
    localStorage.setItem("kv_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("kv_token", res.data.token);
    localStorage.setItem("kv_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("kv_token");
    localStorage.removeItem("kv_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
