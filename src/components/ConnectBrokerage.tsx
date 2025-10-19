'use client';
import { useState } from 'react';
import { SnapTradeReact } from 'snaptrade-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoginRedirectURI } from 'snaptrade-typescript-sdk';
import { useAuth } from '@/context/AuthProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLocalStorage } from '@/lib/useLocalStorage';

type Brokerage = 'CHASE' | 'FIDELITY';
const ConnectBrokerage = () => {
    const [open, setOpen] = useState(false);
    const [redirectLink, setRedirectLink] = useState('');
    const { userId, userSecret, setUserId, setUserSecret, setIsLoggedIn } = useAuth();
    const [brokerage, setBrokerage] = useLocalStorage<Brokerage>('brokerage', 'CHASE');

    const connectionProcess = async () => {
        try {
            const response = await fetch(`/api/auth?brokerage=${brokerage}`, {
                headers: {
                    'x-snaptrade-user-id': userId,
                    'x-snaptrade-user-secret': userSecret,
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
        <div>
            <h2 className='text-lg font-bold mb-4'>Add your Snaptrade deets</h2>

            <div className="flex flex-col justify-center items-center">
                <Input
                    type="text"
                    placeholder="Snaptrade User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="mb-4 w-[300px]"
                />
                <Input
                    type="password"
                    placeholder="Snaptrade User Secret"
                    value={userSecret}
                    onChange={(e) => setUserSecret(e.target.value)}
                    className="mb-4 w-[300px]"
                />
                <Select value={brokerage} onValueChange={(e) => setBrokerage(e as Brokerage)}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder="Select Brokerage" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FIDELITY">Fidelity</SelectItem>
                        <SelectItem value="CHASE">Chase</SelectItem>
                    </SelectContent>
                </Select>
                {/* your Connect button */}
                <Button className='mt-4' disabled={!userId || !userSecret} onClick={connectionProcess}>Connect</Button>

            </div>

            <SnapTradeReact
                loginLink={redirectLink}
                isOpen={open}
                close={() => setOpen(false)}
                onSuccess={(data) => {
                    // Handle successful connection here
                    console.log('Connection successful:', data);
                    setIsLoggedIn(true);
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

export default ConnectBrokerage;