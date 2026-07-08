import { useState } from "react";
import { login, register } from "./api";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (mode === "register") {
        await register(username.trim(), email.trim(), password);
      }

      const data = await login(email.trim(), password);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", username.trim() || email.split("@")[0]);
      setToken(data.access_token);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        mode === "register"
          ? "Could not create that account. Try a different username or email."
          : "Login failed. Check your email and password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold">Fantasy Hub</h1>
        <p className="mt-2 text-zinc-400">
          {mode === "login"
            ? "Login to view your league dashboard."
            : "Create an account to start building your fantasy hub."}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={[
              "rounded-md px-3 py-2 text-sm font-semibold transition",
              mode === "login"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white",
            ].join(" ")}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={[
              "rounded-md px-3 py-2 text-sm font-semibold transition",
              mode === "register"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white",
            ].join(" ")}
          >
            Register
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {mode === "register" && (
            <input
              className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          )}

          <input
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          <button
            onClick={handleSubmit}
            disabled={
              saving ||
              !email.trim() ||
              !password ||
              (mode === "register" && !username.trim())
            }
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? mode === "register"
                ? "Creating..."
                : "Logging in..."
              : mode === "register"
                ? "Create account"
                : "Login"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {token && (
            <p className="text-sm text-emerald-400">Logged in successfully.</p>
          )}
        </div>
      </div>
    </div>
  );
}
