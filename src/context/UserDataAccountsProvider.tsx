"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useUser } from "@stackframe/stack";

type UserDataAccountsContextType = {
  alpacaApiKey: string | undefined;
  alpacaApiSecret: string | undefined;
  snaptradeUserId: string | undefined;
  snaptradeUserSecret: string | undefined;
  isLoading: boolean;
};

const UserDataAccountsContext = createContext<UserDataAccountsContextType | undefined>(undefined);

export const UserDataAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [alpacaApiKey, setAlpacaApiKey] = useLocalStorage<string | undefined>("alpaca_api_key", undefined);
  const [alpacaApiSecret, setAlpacaApiSecret] = useLocalStorage<string | undefined>("alpaca_api_secret", undefined);
  const [snaptradeUserId, setSnaptradeUserId] = useLocalStorage<string | undefined>("snaptrade_user_id", undefined);
  const [snaptradeUserSecret, setSnaptradeUserSecret] = useLocalStorage<string | undefined>("snaptrade_user_secret", undefined);
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
