'use client';
import { useState } from 'react';
import { SnapTradeReact } from 'snaptrade-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoginRedirectURI } from 'snaptrade-typescript-sdk';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUser } from '@stackframe/stack';
import { useUserDataAccounts } from '@/context/UserDataAccountsProvider';
import { Label } from './ui/label';

export type Broker = 'CHASE' | 'FIDELITY' | 'ALPACA' | 'ROBINHOOD';
const ConnectBroker = ({ enabled }: { enabled: boolean }) => {
    const [open, setOpen] = useState(false);
    const [redirectLink, setRedirectLink] = useState('');
    const user = useUser();
    const [broker, setBroker] = useState<Broker>('CHASE');
    const { snaptradeUserId, snaptradeUserSecret } = useUserDataAccounts();
    const [editableSnaptradeUserId, setEditableSnaptradeUserId] = useState(snaptradeUserId);
    const [editableSnaptradeUserSecret, setEditableSnaptradeUserSecret] = useState(snaptradeUserSecret);

    const connectionProcess = async () => {
        try {
            const response = await fetch(`/api/auth?broker=${broker}`, {
                headers: {
                    'x-snaptrade-user-id': editableSnaptradeUserId as string,
                    'x-snaptrade-user-secret': editableSnaptradeUserSecret as string,
                },
            });
            const data: LoginRedirectURI = await response.json();
            const link = data.redirectURI ?? '';

            // update the state with the generated link
            setRedirectLink(link);

            // update the "open" state to show the modal
            setOpen(true);
        } catch (error) {
            console.error("Error fetching redirect URI:", error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Request Snaptrade details from the admin</p>
            <div className="mb-4 w-[300px]">
                <Label htmlFor="snaptrade-user-id">Snaptrade User ID</Label>
                <Input
                    type="text"
                    id="snaptrade-user-id"
                    placeholder="Snaptrade User ID"
                    value={editableSnaptradeUserId}
                    onChange={(e) => setEditableSnaptradeUserId(e.target.value)}
                    className="mb-4"
                    disabled={!enabled}
                />
                <Label htmlFor="snaptrade-user-secret">Snaptrade User Secret</Label>
                <Input
                    type="password"
                    id="snaptrade-user-secret"
                    placeholder="Snaptrade User Secret"
                    value={editableSnaptradeUserSecret}
                    onChange={(e) => setEditableSnaptradeUserSecret(e.target.value)}
                    className="mb-4"
                    disabled={!enabled}
                />
            </div>
            <Select value={broker} onValueChange={(e) => setBroker(e as Broker)} disabled={!enabled}>
                <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder="Select Broker" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="FIDELITY">Fidelity</SelectItem>
                    <SelectItem value="CHASE">Chase</SelectItem>
                    <SelectItem value="ALPACA">Alpaca</SelectItem>
                    <SelectItem value="ROBINHOOD">Robinhood</SelectItem>
                </SelectContent>
            </Select>
            {/* your Connect button */}
            <Button className='mt-4' onClick={connectionProcess} disabled={!enabled}>Connect</Button>


            <SnapTradeReact
                loginLink={redirectLink}
                isOpen={open}
                close={() => setOpen(false)}
                onSuccess={async (data) => {
                    // Handle successful connection here
                    console.log('Connection successful:', data);

                    // Save Snaptrade credentials in the database
                    await fetch('/api/user_data_accounts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            editableSnaptradeUserId,
                            editableSnaptradeUserSecret,
                            userId: user?.id,
                        }),
                    });
                }}
                onError={(errorData) => {
                    // Handle connection error here
                    console.error('Connection error:', errorData);
                }}
                onExit={() => {
                    // Handle exit here
                    console.log('Connection exited');
                }}
            />
        </div>
    );
};

export default ConnectBroker;