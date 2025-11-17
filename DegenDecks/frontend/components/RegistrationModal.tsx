'use client';

import { useAppContext } from '@/providers/AppProvider';
import { useState } from 'react';
import { getProfilePda } from '@/program';
import { SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose?: () => void;
    canClose?: boolean;
}

export const RegistrationModal = ({ isOpen, onClose, canClose = true }: RegistrationModalProps) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { program, getUser, wallet } = useAppContext();


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate username
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        if (username.length < 3 || username.length > 32) {
            setError('Username must be between 3 and 32 characters');
            return;
        }

        try {
            setIsLoading(true);

            if (!program || !wallet) {
                throw new Error('Program or wallet not initialized');
            }

            const pda = getProfilePda(wallet.publicKey);

            // Show loading toast
            const toastId = toast.loading('Creating your profile...');

            await program.methods
                .initializeProfile(username)
                .accountsStrict({
                    profile: pda,
                    signer: wallet.publicKey,
                    systemProgram: SystemProgram.programId
                })
                .rpc();

            await getUser();

            // Success toast
            toast.success(`Welcome, ${username}! Your profile has been created.`, {
                id: toastId,
            });

            setUsername('');
            if (canClose && onClose) {
                onClose();
            }
        } catch (err) {
            const error = err as Error;
            const errorMessage = error.message || 'Failed to register. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = () => {
        if (canClose && onClose) {
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
            <div className="relative bg-gradient-to-br from-[#0C093E] to-[#1a1456] border border-green-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Close button - only show if canClose */}
                {canClose && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome to Degen Decks!
                    </h2>
                    <p className="text-gray-400">
                        Create your profile to start playing
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            disabled={isLoading}
                            maxLength={32}
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            3-32 characters
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-lg transition-all duration-200 border border-green-500/50 hover:border-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating Profile...
                            </>
                        ) : (
                            'Create Profile'
                        )}
                    </button>
                </form>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 text-center">
                        Your profile will be stored on the Solana blockchain
                    </p>
                </div>
            </div>
        </div>
    );
};
