import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { authApi, usersApi } from "../app/NexApi";

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// Auth is stored ONLY in sessionStorage (NOT localStorage).
//
// Why sessionStorage?
//   • Automatically wiped when the browser tab/window is closed.
//   • Persists across page refreshes within the same session (F5, hard reload).
//   • After close → reopen the app always starts at the Login page.
//   • After logout → sessionStorage is cleared → Login page immediately.
//
// localStorage is intentionally NOT used so that credentials never survive
// a browser restart.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_TOKEN_KEY = "chatapp_jwt_token";
const SESSION_USER_KEY = "chatapp_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const previousUserIdRef = useRef(null);

  // ── On mount: try to restore a session from sessionStorage or OAuth redirect ───
  useEffect(() => {
    // 1. Check if returning from Google OAuth redirect with ?token=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        completeGoogleOAuth(urlToken);
        window.history.replaceState({}, '', window.location.pathname);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('OAuth URL parse notice:', e);
    }

    // 2. Otherwise restore session from sessionStorage
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        previousUserIdRef.current = parsedUser.id;
      } catch {
        // Corrupted storage — ignore, user will see login page
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
    }
    // No session found → setLoading(false) → AppGate shows AuthPage
    setLoading(false);
  }, []);

  // ── Internal helper: write / clear the session ───────────────────────────
  const applyAuthSession = (targetUser, tokenValue, errorMessage = "") => {
    const normalizedToken = tokenValue || "";
    const normalizedUser = targetUser || null;
    const previousUserId = previousUserIdRef.current;

    setToken(normalizedToken);
    setUser(normalizedUser);
    setAuthError(errorMessage);

    if (normalizedToken && normalizedUser) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, normalizedToken);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(normalizedUser));

      // Reload when a different user logs in (e.g. account switching)
      if (
        previousUserId &&
        normalizedUser.id &&
        normalizedUser.id !== previousUserId
      ) {
        window.location.reload();
      }

      previousUserIdRef.current = normalizedUser.id;
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
      previousUserIdRef.current = null;
    }
  };

  // ── Google OAuth (redirect-based) ────────────────────────────────────────
  const completeGoogleOAuth = (tokenValue) => {
    if (!tokenValue) {
      setAuthError("Google sign-in failed. Please try again.");
      return;
    }
    try {
      const payloadBase64 = tokenValue.split(".")[1];
      const payload = JSON.parse(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")),
      );
      const googleUser = {
        id: payload.id || payload.sub || `google_${Date.now()}`,
        email: payload.email || "google.user@example.com",
        name: payload.name || payload.given_name || "Google User",
        avatarUrl:
          payload.avatarUrl ||
          payload.picture ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        provider: "google",
      };
      applyAuthSession(googleUser, tokenValue, "");
    } catch (err) {
      console.error("AuthContext: Failed to decode Google OAuth token:", err);
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  const loginWithGoogle = async (customUser) => {
    const targetUser = customUser
      ? {
          id: customUser.id || customUser.sub || `google_${Date.now()}`,
          email: customUser.email || "google.user@example.com",
          name: customUser.name || customUser.given_name || "Google User",
          avatarUrl:
            customUser.avatarUrl ||
            customUser.picture ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          provider: "google",
        }
      : {
          id: `usr_google_${Date.now()}`,
          email: "cyber.agent@nexus.net",
          name: "Agent_K (Google)",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          provider: "google",
        };

    try {
      const data = await authApi.exchangeGoogleToken(targetUser);
      const sessionUser = {
        ...(data.user || targetUser),
        avatarUrl: data.user?.avatarUrl || targetUser.avatarUrl,
        provider: "google",
      };
      applyAuthSession(sessionUser, data.token || "mock_token", "");
    } catch (err) {
      console.error("AuthContext: Error during Google login:", err);
      applyAuthSession(targetUser, "mock_token", "Google login failed.");
    }
  };

  // ── Email / Password sign-up ─────────────────────────────────────────────
  const signUp = async ({ name, email, password }) => {
    const payload = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      avatarUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&auto=format&fit=crop&q=80",
      provider: "local",
    };

    if (!payload.name || !payload.email || !payload.password) {
      setAuthError("Please enter your name, email, and password.");
      return false;
    }

    try {
      const data = await authApi.signup(payload);
      applyAuthSession(data.user || payload, data.token || "mock_token", "");
      return true;
    } catch (err) {
      console.error("AuthContext: Sign-up failed:", err);
      setAuthError(err.message || "Sign-up failed. Please try again.");
      return false;
    }
  };

  // ── Email / Password login ───────────────────────────────────────────────
  const login = async ({ email, password }) => {
    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return false;
    }

    try {
      const data = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      applyAuthSession(data.user, data.token || "mock_token", "");
      return true;
    } catch (err) {
      console.error("AuthContext: Login failed:", err);
      setAuthError(err.message || "Login failed. Please try again.");
      return false;
    }
  };

  // ── Profile updates ───────────────────────────────────────────────────────
  // Applies the change locally right away (instant UI feedback), then
  // persists it to the backend. Returns the saved user so callers (like
  // ChatContext) can broadcast the change over the socket. Throws on failure
  // so the caller can show an error — the optimistic local change is left in
  // place either way rather than silently reverting under the user.
  const updateProfile = async (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedFields };
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });

    if (!token) return null;

    setProfileSaving(true);
    try {
      const data = await usersApi.updateMe(token, updatedFields);
      let savedUser = null;
      setUser((prev) => {
        savedUser = { ...prev, ...(data?.user || updatedFields) };
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(savedUser));
        return savedUser;
      });
      return savedUser;
    } catch (err) {
      console.error("AuthContext: Failed to persist profile update:", err);
      setAuthError(err.message || "Failed to save profile changes.");
      throw err;
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Logout: wipe session → AppGate shows AuthPage ────────────────────────
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthError("");
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    // Also scrub any legacy localStorage entries that older versions may have set
    localStorage.removeItem("chatapp_jwt_token");
    localStorage.removeItem("chatapp_user");
    localStorage.removeItem("chatapp_logged_out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        profileSaving,
        login,
        signUp,
        loginWithGoogle,
        completeGoogleOAuth,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);