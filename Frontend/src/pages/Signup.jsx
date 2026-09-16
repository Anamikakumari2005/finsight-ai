import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/signup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign up</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-700">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default Signup;