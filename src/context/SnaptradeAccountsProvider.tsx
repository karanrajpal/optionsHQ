"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk";
import { useSnaptradeAuth } from "./SnaptradeAuthProvider";

type AccountContextType = {
  accounts: Record<string, SnapTradeHoldingsAccount>;
  selectedAccount: SnapTradeHoldingsAccount | null;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const SnaptradeAccountsProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useLocalStorage<Record<string, SnapTradeHoldingsAccount>>("broker_accounts", {});
  const [selectedAccountId, setSelectedAccountId] = useLocalStorage<string | null>("selected_account_id", null);

  const { userId, userSecret } = useSnaptradeAuth();

  const selectedAccount = useMemo(() => {
    return selectedAccountId ? accounts[selectedAccountId] : null;
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts: SnapTradeHoldingsAccount[] = await fetch("/api/snaptrade/accounts", {
        headers: {
          "user-id": userId as string,
          "user-secret": userSecret as string,
        },
      }).then(res => res.json());
      if (accounts && accounts.length > 0) {
        const accountsMap: Record<string, SnapTradeHoldingsAccount> = {};
        accounts.forEach((account, index) => {
          accountsMap[account.id || `Unknown ${index}`] = account;
        });
        setAccounts(accountsMap);
        // Set the first account as selected
        setSelectedAccountId(Object.keys(accountsMap)[0]);
      }
    };
    fetchAccounts();
  }, []);

  const value = useMemo(
    () => ({ accounts, setSelectedAccountId, selectedAccount }),
    [accounts, setSelectedAccountId, selectedAccount]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useSnaptradeAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useSnaptradeAccount must be used within an SnaptradeAccountProvider");
  }
  return ctx;
};
