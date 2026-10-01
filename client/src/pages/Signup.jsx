import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/register", formData);
      setQrCode(data.qrCodeDataURL || "");
      setMessage(data.message || "Registration successful.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Create Account</h2>
        <p className="mt-2 text-sm text-slate-300">Register to receive your MFA QR code.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            required
            minLength={2}
            placeholder="Full Name"
            className="input-ui"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          />

          <input
            type="email"
            required
            placeholder="Email"
            className="input-ui"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />

          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="input-ui"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}

        {qrCode ? (
          <div className="mt-6 rounded-xl border border-cyan-300/35 bg-slate-950/60 p-4 text-center">
            <p className="mb-3 text-sm text-cyan-200">Scan using authenticator app</p>
            <img src={qrCode} alt="MFA QR" className="mx-auto h-52 w-52 rounded-lg bg-white p-2" />
          </div>
        ) : null}

        <p className="mt-6 text-sm text-slate-300">
          Already registered? <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Login</Link>
        </p>
      </section>
    </main>
  );
}
