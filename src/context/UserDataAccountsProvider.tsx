"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk";
import { stackClientApp } from "@/stack/client";

type UserDataAccountsContextType = {
  alpacaApiKey: string | null;
  alpacaApiSecret: string | null;
  snaptradeUserId: string | null;
  snaptradeUserSecret: string | null;
  userId: string | null;
  userDisplayName: string | null;
};

const UserDataAccountsContext = createContext<UserDataAccountsContextType | undefined>(undefined);

export const UserDataAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [alpacaApiKey, setAlpacaApiKey] = useLocalStorage<string | null>("alpaca_api_key", null);
  const [alpacaApiSecret, setAlpacaApiSecret] = useLocalStorage<string | null>("alpaca_api_secret", null);
  const [snaptradeUserId, setSnaptradeUserId] = useLocalStorage<string | null>("snaptrade_user_id", null);
  const [snaptradeUserSecret, setSnaptradeUserSecret] = useLocalStorage<string | null>("snaptrade_user_secret", null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  useEffect(() => {
        const fetchUserData = async () => {
            const user = await stackClientApp.getUser();
            setUserId(user?.id || null);
            setUserDisplayName(user?.displayName || null);
        };
        fetchUserData();
    }, []);

  useEffect(() => {
    const fetchUserDataAccounts = async () => {
      const response = await fetch(`/api/user_data_accounts?user_id=${userId}`);
      const data = await response.json();
      if (data) {
        setAlpacaApiKey(data.alpacaApiKey);
        setAlpacaApiSecret(data.alpacaApiSecret);
        setSnaptradeUserId(data.snaptradeUserId);
        setSnaptradeUserSecret(data.snaptradeUserSecret);
      }
    };
    if (userId) {
      fetchUserDataAccounts();
    }
  }, [userId]);

  const value = useMemo(
    () => ({ alpacaApiKey, alpacaApiSecret, snaptradeUserId, snaptradeUserSecret, userId, userDisplayName }),
    [alpacaApiKey, alpacaApiSecret, snaptradeUserId, snaptradeUserSecret, userId, userDisplayName]
  );

  return <UserDataAccountsContext.Provider value={value}>{children}</UserDataAccountsContext.Provider>;
};

export const useUserDataAccounts = () => {
  const ctx = useContext(UserDataAccountsContext);
  if (!ctx) {
    throw new Error("useUserDataAccounts must be used within an UserDataAccountsProvider");
  }
  return ctx;
};
