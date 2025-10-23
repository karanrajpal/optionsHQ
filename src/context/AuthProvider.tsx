"use client";
import React, { createContext, useContext, useMemo } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Broker } from "@/components/ConnectBroker";

type AuthContextType = {
  userId: string;
  userSecret: string;
  isLoggedIn: boolean;
  currentBroker: Broker | null;
  currentBrokerId: string | null;
  brokerAccounts: Partial<Record<Broker, BrokerAccount>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setUserSecret: Dispatch<SetStateAction<string>>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  setCurrentBroker: Dispatch<SetStateAction<Broker | null>>;
  addBrokerAccount: (account: BrokerAccount) => void;
};

type BrokerAccount = {
  name: Broker;
  accountId: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useLocalStorage("user_id", "");
  const [userSecret, setUserSecret] = useLocalStorage("user_secret", "");
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("is_logged_in", false);
  const [currentBroker, setCurrentBroker] = useLocalStorage<Broker | null>("current_broker", null);
  const [brokerAccounts, setBrokerAccounts] = useLocalStorage<Partial<Record<Broker, BrokerAccount>>>(
    "brokerAccounts",
    {}
  );

  const currentBrokerId = useMemo(() => {
    if (!currentBroker) return null;
    const account = brokerAccounts[currentBroker];
    return account ? account.accountId : null;
  }, [currentBroker, brokerAccounts]);

  const addBrokerAccount = (account: BrokerAccount) => {
    setBrokerAccounts((prev) => ({ ...prev, [account.name]: account }));
  };

  const removeBrokerAccount = (accountName: Broker) => {
    setBrokerAccounts((prev) => {
      const newAccounts = { ...prev };
      delete newAccounts[accountName];
      return newAccounts;
    });
  };

  const removeAllBrokerAccounts = () => {
    setBrokerAccounts({});
  };

  const logout = () => {
    setUserId("");
    setUserSecret("");
    setIsLoggedIn(false);
    removeAllBrokerAccounts();
    setCurrentBroker(null);
  };

  const value = useMemo(
    () => ({ userId, userSecret, setUserId, setUserSecret, isLoggedIn, setIsLoggedIn, logout, brokerAccounts, addBrokerAccount, currentBroker, setCurrentBroker, currentBrokerId }),
    [userId, userSecret, setUserId, setUserSecret, isLoggedIn, setIsLoggedIn, logout, brokerAccounts, addBrokerAccount, currentBroker, setCurrentBroker, currentBrokerId]
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
