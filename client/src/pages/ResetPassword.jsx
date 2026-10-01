import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialToken = useMemo(() => location.state?.token || "", [location.state]);

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(data.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Reset password failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-300">Use your token and set a new password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Reset Token"
            className="input-ui"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />

          <input
            type="password"
            required
            minLength={8}
            placeholder="New Password"
            className="input-ui"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <input
            type="password"
            required
            minLength={8}
            placeholder="Confirm New Password"
            className="input-ui"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}

        <p className="mt-6 text-sm text-slate-300">
          Back to <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Login</Link>
        </p>
      </section>
    </main>
  );
}
