import { use, useEffect, useState } from "react";
import { stackClientApp } from "../stack/client";
import { useUserDataAccounts } from "@/context/UserDataAccountsProvider";
import { LuCheck, LuCross } from "react-icons/lu";
import { MdClose } from "react-icons/md";

/**
 * Account Checkup component
 * This checks whether the user's connected accounts (Snaptrade and Alpaca) are valid and up-to-date.
 * If not it lets them enter the details to reconnect their accounts.
 * For now Alpaca is automatically correct for everyone but the user has to enter their Snaptrade API key and secret.
 * Uses the connected user_data_accounts type from the API
 */
export const AccountCheckup = () => {
    const { snaptradeUserId, snaptradeUserSecret, alpacaApiKey, alpacaApiSecret, userId, userDisplayName } = useUserDataAccounts();
    const isSnaptradeConnected = snaptradeUserId && snaptradeUserSecret;
    const isAlpacaConnected = alpacaApiKey && alpacaApiSecret;

    return (
        <div>
            <div>
                <h2>Welcome {userDisplayName}</h2>
                <div className={`w-64 p-4 border rounded-md ${isSnaptradeConnected ? 'bg-green-300' : 'bg-red-300'}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Snaptrade</span>
                        {isSnaptradeConnected ? (
                            <span className="text-green-600 text-2xl">
                                <LuCheck />
                            </span>
                        ) : (
                            <span className="text-red-600 text-2xl">
                                <MdClose />
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-64 p-4 border rounded-md mt-4 ${isAlpacaConnected ? 'bg-green-300' : 'bg-red-300'}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Alpaca</span>
                        {isAlpacaConnected ? (
                            <span className="text-green-600 text-2xl">
                                <LuCheck />
                            </span>
                        ) : (
                            <span className="text-red-600 text-2xl">
                                <MdClose />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
