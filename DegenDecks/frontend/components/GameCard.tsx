'use client';

import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

interface Player {
    owner: PublicKey;
    username: string;
    cardCount?: number | null;
    card_count?: number | null;
    playerIndex?: number | null;
    player_index?: number | null;
    claimed: boolean;
}

interface GameData {
    publicKey: PublicKey;
    account: {
        owner: PublicKey;
        entryStake?: BN | number;
        entry_stake?: BN | number;
        noPlayers?: number;
        no_players?: number;
        players: Player[];
        started: boolean;
        ended: boolean;
        winner: PublicKey | null;
        seed: BN | number;
    };
}

interface GameCardProps {
    game: GameData;
    onJoin?: (gameId: PublicKey) => void;
}

export const GameCard = ({ game, onJoin }: GameCardProps) => {
    const { account } = game;
    const currentPlayers = account.players?.length || 0;
    const maxPlayers = account.noPlayers || account.no_players || 0;
    
    // Handle both BN and number types for entryStake
    const entryStake = account.entryStake || account.entry_stake || 0;
    const stakeAmount = typeof entryStake === 'number' 
        ? entryStake / 1_000_000_000 
        : entryStake instanceof BN 
            ? entryStake.toNumber() / 1_000_000_000 
            : 0;
    
    const prizePool = stakeAmount * currentPlayers;
    
    // Handle both BN and number types for seed
    const seedValue = typeof account.seed === 'number' 
        ? account.seed 
        : account.seed instanceof BN 
            ? account.seed.toNumber() 
            : 0;

    // Determine game status
    const getStatus = () => {
        if (account.ended) return { label: 'COMPLETED', color: 'bg-gray-600' };
        if (account.started) return { label: 'ACTIVE', color: 'bg-orange-600' };
        return { label: 'NEW', color: 'bg-green-600' };
    };

    const status = getStatus();
    const isJoinable = !account.started && !account.ended && currentPlayers < maxPlayers;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Left: Image and Status */}
                <div className="relative flex-shrink-0">
                    {/* Status Badge */}
                    <div className={`absolute -top-2 -left-2 ${status.color} text-white text-xs font-bold px-3 py-1 rounded-md z-10`}>
                        {status.label}
                    </div>
                    
                    {/* Card Image Container */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-purple-500/30 flex items-center justify-center">
                        {/* Simplified card illustration */}
                        <div className="relative w-16 h-20">
                            <div className="absolute inset-0 border-2 border-purple-400/60 rounded-lg rotate-[-10deg] bg-gradient-to-br from-purple-800/30 to-blue-800/30" />
                            <div className="absolute inset-0 border-2 border-cyan-400/60 rounded-lg rotate-[5deg] bg-gradient-to-br from-blue-800/30 to-purple-800/30 flex items-center justify-center">
                                <span className="text-2xl opacity-40">?</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: Game Info */}
                <div className="flex-1 space-y-3">
                    {/* Game Title */}
                    <h3 className="text-xl font-bold text-white">
                        Whot Room #{seedValue.toString().slice(-3)}
                    </h3>

                    {/* Game Details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        {/* Players */}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {Array.from({ length: Math.min(currentPlayers, 4) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-[#000b19] flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ))}
                                {Array.from({ length: maxPlayers - currentPlayers }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#000b19] flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <span className="text-gray-400">
                                {currentPlayers}/{maxPlayers}
                            </span>
                        </div>

                        {/* Stake */}
                        <div className="flex items-center gap-1.5 text-gray-300">
                            <span className="text-gray-400">Stake</span>
                            <span className="font-semibold">{stakeAmount.toFixed(2)} SOL</span>
                        </div>

                        {/* Prize Pool */}
                        <div className="flex items-center gap-1.5 text-gray-300">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-400">Prize Pool</span>
                            <span className="font-semibold text-yellow-500">{prizePool.toFixed(2)} SOL</span>
                        </div>
                    </div>
                </div>

                {/* Right: Action Button */}
                <div className="w-full sm:w-auto flex-shrink-0">
                    {isJoinable ? (
                        <button
                            onClick={() => onJoin?.(game.publicKey)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 border border-purple-500/50"
                        >
                            Join Game
                        </button>
                    ) : account.ended ? (
                        <button
                            className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-lg transition-colors duration-200 border border-white/10"
                        >
                            View Results
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-full sm:w-auto px-6 py-2.5 bg-white/5 text-gray-500 font-semibold rounded-lg border border-white/10 cursor-not-allowed"
                        >
                            In Progress
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
