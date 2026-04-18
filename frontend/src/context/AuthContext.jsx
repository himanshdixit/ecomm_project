"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { API_AUTH_ERROR_EVENT } from "@/lib/axios";
import { setCredentials, logout as clearAuthState } from "@/store/slices/authSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { clearWishlist } from "@/store/slices/wishlistSlice";
import { authService } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback((nextUser) => {
    const normalizedUser = nextUser || null;

    setUser(normalizedUser);

    if (normalizedUser) {
      dispatch(setCredentials({ user: normalizedUser }));
    } else {
      dispatch(clearAuthState());
      dispatch(clearCart());
      dispatch(clearWishlist());
    }

    return normalizedUser;
  }, [dispatch]);

  const refreshSession = useCallback(async () => {
    try {
      return applyUser(await authService.getProfile());
    } catch {
      applyUser(null);
      return null;
    }
  }, [applyUser]);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const sessionUser = await authService.getProfile();

        if (isMounted) {
          applyUser(sessionUser);
        }
      } catch {
        if (isMounted) {
          applyUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleAuthError = () => {
      if (!isMounted) {
        return;
      }

      applyUser(null);
      setIsLoading(false);
    };

    window.addEventListener(API_AUTH_ERROR_EVENT, handleAuthError);
    void hydrateSession();

    return () => {
      isMounted = false;
      window.removeEventListener(API_AUTH_ERROR_EVENT, handleAuthError);
    };
  }, [applyUser]);

  const register = useCallback(async (payload) => applyUser(await authService.register(payload)), [applyUser]);

  const login = useCallback(async (payload) => applyUser(await authService.login(payload)), [applyUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      logout,
      refreshSession,
      register,
    }),
    [isLoading, login, logout, refreshSession, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
