'use client';

import { useAppContext } from '@/providers/AppProvider';
import { useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { BN } from '@coral-xyz/anchor';

interface CreateGameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TokenMint = 'SOL' | 'USDC';

export const CreateGameModal = ({ isOpen, onClose }: CreateGameModalProps) => {
    const [numPlayers, setNumPlayers] = useState<number>(2);
    const [entryStake, setEntryStake] = useState<string>('');
    const [tokenMint, setTokenMint] = useState<TokenMint>('SOL');
    const [maxWaitTime, setMaxWaitTime] = useState<number>(30); // Default 30s
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { program, wallet, getGames } = useAppContext();
    
    // Wait time options in seconds
    const waitTimeOptions = [
        { label: '30s', value: 30 },
        { label: '1m', value: 60 },
        { label: '2m', value: 120 },
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate inputs
        if (!entryStake || parseFloat(entryStake) <= 0) {
            setError('Entry stake must be greater than 0');
            return;
        }

        if (numPlayers < 2 || numPlayers > 5) {
            setError('Number of players must be between 2 and 5');
            return;
        }

        if (maxWaitTime < 1 || maxWaitTime > 120) {
            setError('Max wait time must be between 1 and 120 seconds');
            return;
        }

        try {
            setIsLoading(true);

            if (!program || !wallet) {
                throw new Error('Program or wallet not initialized');
            }

            // Convert entry stake to lamports (for SOL) or smallest unit
            const stakeAmount = parseFloat(entryStake);
            const stakeLamports = new BN(stakeAmount * LAMPORTS_PER_SOL);

            // Show loading toast
            const toastId = toast.loading('Creating game...');

            // TODO: Implement game creation
            // You'll need to:
            // 1. Import SystemProgram from '@solana/web3.js'
            // 2. Get the game PDA using your program's seed logic
            // 3. Call your program's create_game instruction with:
            //    - numPlayers
            //    - stakeLamports
            //    - tokenMint (convert to program's token enum)
            //    - maxWaitTime
            // 4. Pass required accounts (game PDA, creator, system program, etc.)
            
            console.log('Game params:', { numPlayers, stakeLamports: stakeLamports.toString(), tokenMint, maxWaitTime });

            // Refresh games list
            await getGames();

            // Success toast
            toast.success('Game created successfully!', {
                id: toastId,
            });

            // Reset form and close modal
            setNumPlayers(2);
            setEntryStake('');
            setTokenMint('SOL');
            setMaxWaitTime(60);
            onClose();
        } catch (err) {
            const error = err as Error;
            const errorMessage = error.message || 'Failed to create game. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-[#0C093E] to-[#1a1456] border border-green-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full mb-3">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        Create New Game
                    </h2>
                    <p className="text-sm text-gray-400">
                        Set up your game parameters
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Number of Players */}
                    <div>
                        <label htmlFor="numPlayers" className="block text-xs font-medium text-gray-400 mb-1.5">
                            Number of Players
                        </label>
                        <div className="flex gap-2">
                            {[2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setNumPlayers(num)}
                                    disabled={isLoading}
                                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                        numPlayers === num
                                            ? 'bg-green-600 text-white border border-green-500'
                                            : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Entry Stake */}
                    <div>
                        <label htmlFor="entryStake" className="block text-xs font-medium text-gray-400 mb-1.5">
                            Entry Stake
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="entryStake"
                                value={entryStake}
                                onChange={(e) => setEntryStake(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                disabled={isLoading}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                {tokenMint}
                            </span>
                        </div>
                    </div>

                    {/* Token Mint */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            Token
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setTokenMint('SOL')}
                                disabled={isLoading}
                                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    tokenMint === 'SOL'
                                        ? 'bg-green-600 text-white border border-green-500'
                                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.2 7.8l-8.2 8.2-8.2-8.2L2 9.6l10 10 10-10z" />
                                </svg>
                                SOL
                            </button>
                            <button
                                type="button"
                                onClick={() => setTokenMint('USDC')}
                                disabled={isLoading}
                                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    tokenMint === 'USDC'
                                        ? 'bg-green-600 text-white border border-green-500'
                                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                USDC
                            </button>
                        </div>
                    </div>

                    {/* Max Wait Time */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            Max Wait Time
                        </label>
                        <div className="flex gap-2">
                            {waitTimeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setMaxWaitTime(option.value)}
                                    disabled={isLoading}
                                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                        maxWaitTime === option.value
                                            ? 'bg-green-600 text-white border border-green-500'
                                            : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                            <p className="text-red-400 text-xs">{error}</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold text-sm rounded-lg transition-all duration-200 border border-green-500/50 hover:border-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Game
                            </>
                        )}
                    </button>
                </form>

                {/* Info */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 text-center">
                        Total pot: {entryStake && numPlayers ? (parseFloat(entryStake) * numPlayers).toFixed(2) : '0.00'} {tokenMint}
                    </p>
                </div>
            </div>
        </div>
    );
};
