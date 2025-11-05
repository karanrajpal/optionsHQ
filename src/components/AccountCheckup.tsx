import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { Button } from "./ui/button";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { useUser } from "@stackframe/stack";

/**
 * Account Checkup component
 * This checks whether the user's connected accounts (Snaptrade and Alpaca) are valid and up-to-date.
 * If not it lets them enter the details to reconnect their accounts.
 * For now Alpaca is automatically correct for everyone but the user has to enter their Snaptrade API key and secret.
 * Uses the connected user_data_accounts type from the API
 */
export const AccountCheckup = () => {
    const { snaptradeUserId, snaptradeUserSecret, alpacaApiKey, alpacaApiSecret, isUserAccountDetailsLoading } = useUserDataAccounts();
    const isSnaptradeConnected = snaptradeUserId && snaptradeUserSecret;
    const isAlpacaConnected = alpacaApiKey && alpacaApiSecret;
    const { accounts } = useSnaptradeAccount();
    const user = useUser();

    return (
        <div>
            <h2 className="font-bold text-3xl mb-6">Welcome, {user?.displayName ?? 'Options Lover'}</h2>
            <div className="flex justify-center">
                {isUserAccountDetailsLoading ? (
                    <Skeleton className="w-40 h-10 rounded" />
                ) : !isSnaptradeConnected ? (
                    <div>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="snaptrade">
                                <AccordionTrigger>Add Broker</AccordionTrigger>
                                <AccordionContent>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                ) : (
                    <div>
                        <Button>
                            <Link href="/holdings">Go to your holdings</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
