import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      if (data.message === "MFA_REQUIRED") {
        localStorage.setItem("pendingEmail", email.trim().toLowerCase());
        navigate("/otp", { state: { email: email.trim().toLowerCase() } });
        return;
      }

      setError("Unexpected login response.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    setSocialLoading(provider);

    const socialEmail = window.prompt(`Enter your ${provider} email:`);
    const socialName = window.prompt(`Enter your name for ${provider} login:`);

    if (!socialEmail || !socialName) {
      setSocialLoading("");
      return;
    }

    try {
      const { data } = await api.post("/api/auth/social-login", {
        provider,
        email: socialEmail,
        name: socialName,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Social login failed.");
    } finally {
      setSocialLoading("");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-card fade-in w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-100">Login</h2>
        <p className="mt-2 text-sm text-slate-300">Enter your credentials to continue to OTP verification.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="input-ui"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="input-ui"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Checking Credentials..." : "Continue"}
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading === "google"}
            >
              {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSocialLogin("facebook")}
              disabled={socialLoading === "facebook"}
            >
              {socialLoading === "facebook" ? "Connecting..." : "Continue with Facebook"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}

        <p className="mt-6 text-sm text-slate-300">
          <Link to="/forgot-password" className="font-semibold text-cyan-300 hover:text-cyan-200">Forgot password?</Link>
        </p>

        <p className="mt-2 text-sm text-slate-300">
          Need an account? <Link to="/signup" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign Up</Link>
        </p>
      </section>
    </main>
  );
}
