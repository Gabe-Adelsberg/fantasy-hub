import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }

  return (
    <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white">Welcome back</h1>

        <p className="mt-2 text-zinc-400">
          Here's what's happening in your fantasy league.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-zinc-900 px-5 py-3 text-white">
          {username}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full border border-zinc-800 px-5 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
