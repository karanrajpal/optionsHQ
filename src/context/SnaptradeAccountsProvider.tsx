"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk";
import { useUserDataAccounts } from "./UserDataAccountsProvider";

type SnaptradeAccountContextType = {
  accounts: Record<string, SnapTradeHoldingsAccount>;
  selectedAccount: SnapTradeHoldingsAccount | null;
  accountsLoading: boolean;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
  removeAccount: (accountId: string) => void;
};

const SnapTradeAccountsContext = createContext<SnaptradeAccountContextType | undefined>(undefined);

export const SnaptradeAccountsProvider = ({ children }: { children: ReactNode }) => {
  const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();

  const [accounts, setAccounts] = useState<Record<string, SnapTradeHoldingsAccount>>({});
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Storing some of the user preferences for defaults in local storage
  const [selectedAccountId, setSelectedAccountId] = useLocalStorage<string | null>("selected_account_id", null);

  const selectedAccount = useMemo(() => {
    return selectedAccountId ? accounts[selectedAccountId] : null;
  }, [selectedAccountId, accounts]);

  // TODO: Remove this functionality if not needed
  const removeAccount = useCallback((accountId: string) => {
    const updatedAccounts = { ...accounts };
    delete updatedAccounts[accountId];
    setAccounts(updatedAccounts);
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsLoading(true);
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
        if (!selectedAccountId) {
          // Set the first account as selected
          setSelectedAccountId(Object.keys(accountsMap)[0]);
        }
        setAccountsLoading(false);
      }
    };
    fetchAccounts();
  }, [selectedAccountId, setSelectedAccountId, snaptradeUserId, snaptradeUserSecret]);

  const value = useMemo(
    () => ({ accounts, selectedAccount, setSelectedAccountId, removeAccount, accountsLoading }),
    [accounts, selectedAccount, setSelectedAccountId, removeAccount, accountsLoading]
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
