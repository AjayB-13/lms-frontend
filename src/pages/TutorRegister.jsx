import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function TutorRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/api/auth/register-tutor", {
        method: "POST",
        body: { name, email, password },
      });
      login(data.token);
      nav("/tutor");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tutor Register</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white rounded p-2">Create tutor account</button>
      </form>
      <p className="mt-2 text-sm">
        Are you a student? <Link to="/register" className="text-blue-600">Student Register</Link>
      </p>
    </div>
  );
}