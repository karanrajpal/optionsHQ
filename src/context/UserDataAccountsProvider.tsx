"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useUser } from "@stackframe/stack";

type UserDataAccountsContextType = {
  alpacaApiKey: string | null;
  alpacaApiSecret: string | null;
  snaptradeUserId: string | null;
  snaptradeUserSecret: string | null;
  isLoading: boolean;
};

const UserDataAccountsContext = createContext<UserDataAccountsContextType | undefined>(undefined);

export const UserDataAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [alpacaApiKey, setAlpacaApiKey] = useLocalStorage<string | null>("alpaca_api_key", null);
  const [alpacaApiSecret, setAlpacaApiSecret] = useLocalStorage<string | null>("alpaca_api_secret", null);
  const [snaptradeUserId, setSnaptradeUserId] = useLocalStorage<string | null>("snaptrade_user_id", null);
  const [snaptradeUserSecret, setSnaptradeUserSecret] = useLocalStorage<string | null>("snaptrade_user_secret", null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const user = useUser();

  useEffect(() => {
    const fetchUserDataAccounts = async () => {
      const response = await fetch(`/api/user_data_accounts?user_id=${user?.id}`);
      const data = await response.json();
      if (data) {
        setAlpacaApiKey(data.alpaca_api_key);
        setAlpacaApiSecret(data.alpaca_api_secret);
        setSnaptradeUserId(data.snaptrade_user_id);
        setSnaptradeUserSecret(data.snaptrade_user_secret);
      }
      setIsLoading(false);
    };
    if (user?.id) {
      fetchUserDataAccounts();
    }
  }, [user?.id]);

  const value = useMemo(
    () => ({ alpacaApiKey, alpacaApiSecret, snaptradeUserId, snaptradeUserSecret, isLoading }),
    [alpacaApiKey, alpacaApiSecret, snaptradeUserId, snaptradeUserSecret, isLoading]
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
