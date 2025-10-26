"use client";
import { createContext, useContext, useMemo, ReactNode, useState } from "react";
import { Dispatch, SetStateAction } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SnaptradeAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentBroker(null);
  };

  const value = useMemo(
    () => ({ isLoggedIn, setIsLoggedIn, logout }),
    [isLoggedIn, setIsLoggedIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSnaptradeAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useSnaptradeAuth must be used within an SnaptradeAuthProvider");
  }
  return ctx;
};
