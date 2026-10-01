import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = useMemo(() => {
    return location.state?.email || localStorage.getItem("pendingEmail") || "";
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/verify-otp", { email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      localStorage.removeItem("pendingEmail");
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Verify OTP</h2>
        <p className="mt-2 text-sm text-slate-300">Enter the 6-digit code from your authenticator app.</p>

        {!email ? (
          <p className="mt-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-100">
            Missing login context. Please <Link to="/login" className="font-semibold text-cyan-300">login again</Link>.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            required
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="123456"
            className="input-ui text-center text-2xl tracking-[0.35em]"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />

          <button type="submit" className="btn-primary w-full" disabled={loading || !email || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      </section>
    </main>
  );
}
