"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk";
import { useUserDataAccounts } from "./UserDataAccountsProvider";

type SnaptradeAccountContextType = {
  accounts: Record<string, SnapTradeHoldingsAccount>;
  selectedAccount: SnapTradeHoldingsAccount | null;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
};

const SnapTradeAccountsContext = createContext<SnaptradeAccountContextType | undefined>(undefined);

export const SnaptradeAccountsProvider = ({ children }: { children: ReactNode }) => {
  const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

  const [accounts, setAccounts] = useState<Record<string, SnapTradeHoldingsAccount>>({});

  // Storing some of the user preferences for defaults in local storage
  const [selectedAccountId, setSelectedAccountId] = useLocalStorage<string | null>("selected_account_id", null);

  const selectedAccount = useMemo(() => {
    return selectedAccountId ? accounts[selectedAccountId] : null;
  }, [selectedAccountId, accounts]);


  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts: SnapTradeHoldingsAccount[] = await fetch("/api/snaptrade/accounts", {
        headers: {
          "user-id": snaptradeUserId as string,
          "user-secret": snaptradeUserSecret as string,
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
    () => ({ accounts, selectedAccount, setSelectedAccountId }),
    [accounts, selectedAccount, setSelectedAccountId]
  );

  return <SnapTradeAccountsContext.Provider value={value}>{children}</SnapTradeAccountsContext.Provider>;
};

export const useSnaptradeAccount = () => {
  const ctx = useContext(SnapTradeAccountsContext);
  if (!ctx) {
    throw new Error("useSnaptradeAccount must be used within an SnaptradeAccountProvider");
  }
  return ctx;
};
