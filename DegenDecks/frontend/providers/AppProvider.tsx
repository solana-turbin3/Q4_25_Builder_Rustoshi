"use client"
import { useContext, createContext, useMemo, useState, useEffect } from 'react';
import { useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { DegenDecks } from '@/program/types/degen_decks';
import { Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { getProfilePda, getProgram } from '@/program';
import { 
  sendMagicTransaction,
  getClosestValidator 
} from 'magic-router-sdk';

// Define the context type
interface AppContextType {
    connected: boolean;
    program: Program<DegenDecks> | undefined;
    connection: Connection;
    user: any;
    isRegistered: boolean;
    isCheckingProfile: boolean;
    games: any[];
    wallet: AnchorWallet | undefined;
    getUser: () => Promise<void>;
    getGames: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const [user, setUser] = useState({} as any);
    const [games, setGames] = useState([] as any[]);

    // Memoize connection to prevent recreation on every render
    const connection = useMemo(() => new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed"
    }), []);

    // Connect to Magic Router
    // const routerConnection = new Connection(
    //     process.env.NEXT_MAGIC_ROUTER_RPC!, 
    //     "confirmed"
    // );

    const wallet: AnchorWallet | undefined = useAnchorWallet();
    const program: Program<DegenDecks> | undefined = useMemo(() => {
        if (connection && wallet) {
            return getProgram(connection, wallet);
        }
    }, [connection, wallet]);

    const getUser = async () => {
        try {
            setIsCheckingProfile(true);
            if (!program || !wallet) {
                return;
            }
            const pda = getProfilePda(wallet.publicKey);
            const account = await program.account.profile.fetch(pda);
            if (account) {
                setIsRegistered(true);
                setUser(account);
                setIsCheckingProfile(false);
            } else {
                setIsRegistered(false);
                setIsCheckingProfile(false);
                setUser({});
            }
        } catch (e: any) {
            let msg = e?.message;
            // If account doesn't exist, user is not registered
            if (msg && (msg.includes("Account does not exist") || msg.includes("AccountNotInitialized"))) {
                setIsRegistered(false);
                setUser({});
            }
        } finally {
            setIsCheckingProfile(false);
        }
    };

    const getGames = async () => {
        try {
            if (!program || !wallet) {
                return;
            }
            const games = await program.account.game.all();
            console.log(games);
            if (games) {
                setGames(games);
            }
        } catch (e: any) {
            let msg = e?.message;
            console.log(msg);
        }
    };


    // Auto-fetch profile and games when wallet connects
    useEffect(() => {
        if (wallet?.publicKey && program) {
            getUser();
            getGames();
        } else {
            // Reset state when wallet disconnects
            setIsRegistered(false);
            setIsCheckingProfile(false);
            setUser({});
            setGames([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet?.publicKey, program]);

    return (
        <AppContext.Provider value={{
            connected: wallet?.publicKey ? true : false,
            program,
            connection,
            user,
            isRegistered,
            isCheckingProfile,
            games,
            wallet,
            getGames,
            getUser
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}