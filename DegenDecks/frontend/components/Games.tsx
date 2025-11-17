'use client';

import { useState, useMemo } from 'react';
import { GameCard } from './GameCard';
import { PublicKey } from '@solana/web3.js';

type GameFilter = 'all' | 'active' | 'high-stakes' | 'history';

interface GamesProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    games: any[];
    connected?: boolean;
}

export const Games = ({ games, connected = false }: GamesProps) => {
    const [activeFilter, setActiveFilter] = useState<GameFilter>('all');

    const filters: { id: GameFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'high-stakes', label: 'High Stakes' },
        { id: 'history', label: 'History' },
    ];

    // Filter games based on active filter
    const filteredGames = useMemo(() => {
        switch (activeFilter) {
            case 'active':
                return games.filter(game => game.account.started && !game.account.ended);
            case 'high-stakes':
                return games.filter(game => game.account.entryStake?.toNumber() >= 500000000); // >= 0.5 SOL
            case 'history':
                return games.filter(game => game.account.ended);
            default:
                return games;
        }
    }, [activeFilter, games]);

    const handleJoinGame = (gameId: PublicKey) => {
        console.log('Joining game:', gameId.toString());
        // TODO: Implement join game logic
    };

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                    All Games
                </h2>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`
                                px-5 py-2.5 rounded-lg font-medium transition-all duration-200
                                ${activeFilter === filter.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Games List */}
                <div className="space-y-4">
                    {!connected ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
                                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Connect Your Wallet
                            </h3>
                            <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
                                Connect your wallet to view and join available games
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>Click &ldquo;Connect Wallet&rdquo; in the top right corner</span>
                            </div>
                        </div>
                    ) : games.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-gray-400 text-lg">Loading games...</p>
                        </div>
                    ) : filteredGames.length > 0 ? (
                        filteredGames.map((game) => (
                            <GameCard
                                key={game.publicKey.toString()}
                                game={game}
                                onJoin={handleJoinGame}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No games found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
