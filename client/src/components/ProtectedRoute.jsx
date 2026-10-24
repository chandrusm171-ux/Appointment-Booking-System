import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";
import { clearAdminSession, getAdminToken, isTokenExpired, saveAdminSession } from "../services/auth";

function ProtectedRoute() {
  const location = useLocation();
  const token = getAdminToken();
  const [checking, setChecking] = useState(Boolean(token));
  const [valid, setValid] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    if (!token || isTokenExpired(token)) {
      clearAdminSession();
      setValid(false);
      setChecking(false);
      return () => { active = false; };
    }

    const verifySession = async () => {
      try {
        const response = await api.get("/admin/me");
        if (!active) return;
        saveAdminSession(token, response.data.data);
        setValid(true);
      } catch {
        if (!active) return;
        clearAdminSession();
        setValid(false);
      } finally {
        if (active) setChecking(false);
      }
    };

    verifySession();
    return () => { active = false; };
  }, [token]);

  if (checking) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <span className="brand-mark">LS</span>
          <strong>Checking secure session</strong>
          <span>Please wait…</span>
        </div>
      </div>
    );
  }

  if (!valid) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
