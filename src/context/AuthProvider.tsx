"use client";
import React, { createContext, useContext, useMemo } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";

type AuthContextType = {
  userId: string;
  userSecret: string;
  setUserId: Dispatch<SetStateAction<string>>;
  setUserSecret: Dispatch<SetStateAction<string>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useLocalStorage("user_id", "");
  const [userSecret, setUserSecret] = useLocalStorage("user_secret", "");
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("is_logged_in", false);

  const logout = () => {
    setUserId("");
    setUserSecret("");
    setIsLoggedIn(false);
  };

  const value = useMemo(
    () => ({ userId, userSecret, setUserId, setUserSecret, isLoggedIn, setIsLoggedIn, logout }),
    [userId, userSecret, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
