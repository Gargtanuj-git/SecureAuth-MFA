import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/api/auth/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("pendingEmail");
    navigate("/login", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-2xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-300">Protected route unlocked after secure authentication.</p>

        {loading ? <p className="mt-6 text-slate-300">Loading dashboard...</p> : null}

        {error ? <p className="mt-6 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}

        {data ? (
          <div className="dashboard-card-animated mt-6 space-y-3 rounded-xl border border-slate-500/40 bg-slate-950/60 p-4 text-sm sm:text-base">
            <p>
              <span className="font-semibold text-cyan-300">Welcome:</span> {data.name || "User"}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Current Date:</span>{" "}
              {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Current Time:</span>{" "}
              {now.toLocaleTimeString()}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Email:</span> {data.email}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">MFA Enabled:</span> {String(data.mfaEnabled)}
            </p>
            <p>
              <span className="font-semibold text-cyan-300">Last Login IP:</span> {data.lastLoginIp || "N/A"}
            </p>
          </div>
        ) : null}

        <button className="btn-secondary mt-6" onClick={handleLogout}>Logout</button>
      </section>
    </main>
  );
}
