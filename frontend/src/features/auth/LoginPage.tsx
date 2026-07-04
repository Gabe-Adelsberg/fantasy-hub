import { useState } from "react";
import { login } from "./api";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("testi@example.com");
  const [password, setPassword] = useState("testi");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
  try {
    const data = await login(email, password);

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", email.split("@")[0]);
    setToken(data.access_token);

    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
}

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold">Fantasy Hub</h1>
        <p className="mt-2 text-zinc-400">Login to view your league dashboard.</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-500"
          >
            Login
          </button>

          {token && (
            <p className="text-sm text-emerald-400">Logged in successfully.</p>
          )}
        </div>
      </div>
    </div>
  );
}