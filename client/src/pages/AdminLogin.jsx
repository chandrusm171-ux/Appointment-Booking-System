import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAdminSession } from "../services/auth";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/admin/login", {
        email: email.trim(),
        password,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Login failed.");
      }

      saveAdminSession(response.data.token, response.data.admin);
      const requestedReturn = new URLSearchParams(location.search).get("returnTo");
      const destination = location.state?.from || (requestedReturn ? decodeURIComponent(requestedReturn) : "/admin/dashboard");
      const safeDestination = destination.startsWith("/admin/") ? destination : "/admin/dashboard";
      navigate(safeDestination, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const sessionExpired = new URLSearchParams(location.search).get("reason") === "session-expired";

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <section className="admin-login-brand-panel">
          <Link className="brand login-brand" to="/">
            <span className="brand-mark">LS</span>
            <span className="brand-copy"><strong>LUMA STUDIO</strong><span>Admin workspace</span></span>
          </Link>
          <div className="login-brand-copy">
            <span className="admin-eyebrow">PRIVATE WORKSPACE</span>
            <h1>Run every appointment with clarity.</h1>
            <p>Manage your schedule, bookings, services and availability from one protected workspace.</p>
          </div>
          <div className="login-security-note"><span>✓</span><div><strong>Protected access</strong><small>Your session is verified before every admin workspace request.</small></div></div>
        </section>

        <section className="admin-login-card">
          <div className="login-card-heading">
            <span className="admin-eyebrow">WELCOME BACK</span>
            <h2>Admin sign in</h2>
            <p>Use your Luma Studio admin credentials to continue.</p>
          </div>

          {sessionExpired && <div className="alert alert-warning">Your session expired. Please sign in again.</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} className="secure-login-form">
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@lumastudio.com" autoComplete="username" autoFocus required />
            </div>
            <div className="form-field password-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </div>
            <button className="primary-button full-width secure-login-button" disabled={loading}>{loading ? "Verifying…" : "Sign in securely ↗"}</button>
          </form>

          <div className="login-card-footer"><span>Authorized staff only</span><Link to="/">Return to Luma Studio</Link></div>
        </section>
      </div>
    </div>
  );
}

export default AdminLogin;
