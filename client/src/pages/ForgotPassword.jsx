import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenPreview, setTokenPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setTokenPreview("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setMessage(data.message || "Reset instructions generated.");
      if (data.resetToken) {
        setTokenPreview(data.resetToken);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to generate reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Forgot Password</h2>
        <p className="mt-2 text-sm text-slate-300">Enter your email to generate a password reset token.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="input-ui"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Reset Token"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}

        {tokenPreview ? (
          <div className="mt-4 rounded-lg border border-cyan-300/30 bg-slate-900/70 p-3 text-xs sm:text-sm">
            <p className="text-cyan-200">Reset Token (dev preview):</p>
            <p className="mt-1 break-all text-slate-100">{tokenPreview}</p>
            <button
              className="btn-secondary mt-3"
              onClick={() => navigate("/reset-password", { state: { token: tokenPreview } })}
            >
              Continue To Reset Form
            </button>
          </div>
        ) : null}

        <p className="mt-6 text-sm text-slate-300">
          Back to <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Login</Link>
        </p>
      </section>
    </main>
  );
}
