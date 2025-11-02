import { SiChase, SiRobinhood } from "react-icons/si";
import { SnapTradeHoldingsAccount } from "snaptrade-typescript-sdk"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { useSidebar } from "./ui/sidebar";

export const AccountPicker = () => {
    const { selectedAccount, accounts, accountsLoading, setSelectedAccountId } = useSnaptradeAccount();

    const { isMobile } = useSidebar();

    return (
        <div>
            <Select
                value={selectedAccount?.id ?? undefined}
                onValueChange={(val) => setSelectedAccountId(val)}
                disabled={accountsLoading}
            >
                <SelectTrigger className="w-48 md:w-64">
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(accounts).length > 0 ? (
                        Object.values(accounts).map((account: SnapTradeHoldingsAccount) => (
                            account.id ? (
                                <SelectItem key={account.id} value={account.id} className="cursor-pointer" title={`${account.institution_name} - ${account.name}`}>
                                    <span className="flex items-center gap-2">
                                        {account.institution_name === 'Fidelity' && (<img src="/fidelity.png" alt="Fidelity Logo" className="w-4 h-4" />)}
                                        {account.institution_name === 'Chase' && (<SiChase className="w-4 h-4" />)}
                                        {account.institution_name === 'Robinhood' && (<SiRobinhood className="w-4 h-4" />)}
                                        {!isMobile ? (
                                            <>{account.institution_name ? `${account.institution_name} - ` : ''}{account.name}</>
                                        ) : (
                                            <>{account.name}</>
                                        )}
                                    </span>
                                </SelectItem>
                            ) : null
                        ))
                    ) : (
                        <SelectItem value="no_accounts" disabled>No accounts found</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};
