import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-blue-900/40 blur-3xl" />
      </div>

      <section className="glass-card fade-in w-full max-w-lg rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Secure Access</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-50 sm:text-4xl">Password + MFA Auth</h1>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Register with email and password, then secure sign-in with one-time authenticator codes.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button className="btn-primary" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
        </div>
      </section>
    </main>
  );
}
