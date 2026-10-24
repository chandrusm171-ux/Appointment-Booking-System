const TOKEN_KEY = "adminToken";
const ADMIN_KEY = "admin";

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
  } catch {
    return null;
  }
};

export const saveAdminSession = (token, admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const clearAdminSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

export const isTokenExpired = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
