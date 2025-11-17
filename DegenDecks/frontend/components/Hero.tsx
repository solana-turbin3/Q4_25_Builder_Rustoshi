'use client';

import { useState } from 'react';
import { CreateGameModal } from './CreateGameModal';

export const Hero = () => {
    const [showCreateGameModal, setShowCreateGameModal] = useState(false);

    return (
        <>
            <CreateGameModal
                isOpen={showCreateGameModal}
                onClose={() => setShowCreateGameModal(false)}
            />
        <section className="relative py-20 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-transparent" />
            
            <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left side - Text and CTA */}
                    <div className="flex-1 text-left space-y-6 max-w-xl">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                            Play Whot.<br />
                            Win Solana.
                        </h1>

                        <p className="text-lg text-gray-300">
                            Fun, fair, decentralized gameplay — one tap to join.
                        </p>

                        <div className="pt-2">
                            <button 
                                onClick={() => setShowCreateGameModal(true)}
                                className="cursor-pointer px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 border border-green-500/50 hover:border-green-400"
                            >
                                Create Game
                            </button>
                        </div>
                    </div>

                    {/* Right side - Card illustration */}
                    <div className="flex-1 relative flex items-center justify-center lg:justify-end">
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
                            {/* Neon card outlines effect */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Back card - rotated left */}
                                <div 
                                    className="absolute w-48 h-64 rounded-2xl border-2 border-purple-500/60 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm"
                                    style={{ transform: 'rotate(-15deg) translateX(-30px)' }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl opacity-30">?</span>
                                    </div>
                                </div>
                                
                                {/* Front card - center */}
                                <div 
                                    className="absolute w-48 h-64 rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm z-10"
                                    style={{ transform: 'rotate(5deg)' }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl opacity-30">?</span>
                                    </div>
                                </div>
                                
                                {/* Right card - rotated right */}
                                <div 
                                    className="absolute w-48 h-64 rounded-2xl border-2 border-blue-500/60 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-sm"
                                    style={{ transform: 'rotate(15deg) translateX(30px)' }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-6xl opacity-30">?</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};
