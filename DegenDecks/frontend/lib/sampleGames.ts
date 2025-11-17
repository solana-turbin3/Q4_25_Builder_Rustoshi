import { PublicKey } from '@solana/web3.js';

// Generate sample game data based on the IDL structure
export const sampleGames = [
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 200000000, // 0.2 SOL
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Player1',
                    card_count: 5,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Player2',
                    card_count: 5,
                    player_index: 1,
                    claimed: false,
                },
            ],
            started: false,
            ended: false,
            winner: null,
            seed: 44,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 300000000, // 0.3 SOL
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Alice',
                    card_count: 3,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Bob',
                    card_count: 4,
                    player_index: 1,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Charlie',
                    card_count: 5,
                    player_index: 2,
                    claimed: false,
                },
            ],
            started: true,
            ended: false,
            winner: null,
            seed: 41,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 100000000, // 0.1 SOL
            no_players: 2,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'David',
                    card_count: 0,
                    player_index: 0,
                    claimed: true,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Eve',
                    card_count: 2,
                    player_index: 1,
                    claimed: false,
                },
            ],
            started: true,
            ended: true,
            winner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            seed: 40,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 500000000, // 0.5 SOL
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Frank',
                    card_count: 5,
                    player_index: 0,
                    claimed: false,
                },
            ],
            started: false,
            ended: false,
            winner: null,
            seed: 45,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 250000000, // 0.25 SOL
            no_players: 3,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Grace',
                    card_count: 5,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Henry',
                    card_count: 5,
                    player_index: 1,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Ivy',
                    card_count: 5,
                    player_index: 2,
                    claimed: false,
                },
            ],
            started: false,
            ended: false,
            winner: null,
            seed: 46,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 150000000, // 0.15 SOL
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Jack',
                    card_count: 2,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Kate',
                    card_count: 3,
                    player_index: 1,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Leo',
                    card_count: 4,
                    player_index: 2,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Mia',
                    card_count: 5,
                    player_index: 3,
                    claimed: false,
                },
            ],
            started: true,
            ended: false,
            winner: null,
            seed: 47,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 400000000, // 0.4 SOL
            no_players: 2,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Noah',
                    card_count: 5,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Olivia',
                    card_count: 5,
                    player_index: 1,
                    claimed: false,
                },
            ],
            started: false,
            ended: false,
            winner: null,
            seed: 48,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 350000000, // 0.35 SOL
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Paul',
                    card_count: 0,
                    player_index: 0,
                    claimed: true,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Quinn',
                    card_count: 3,
                    player_index: 1,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Ryan',
                    card_count: 4,
                    player_index: 2,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Sara',
                    card_count: 5,
                    player_index: 3,
                    claimed: false,
                },
            ],
            started: true,
            ended: true,
            winner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            seed: 49,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 180000000, // 0.18 SOL
            no_players: 3,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Tom',
                    card_count: 5,
                    player_index: 0,
                    claimed: false,
                },
            ],
            started: false,
            ended: false,
            winner: null,
            seed: 50,
        },
    },
    {
        publicKey: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
        account: {
            owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
            entry_stake: 900000000, // 0.9 SOL (High Stakes)
            no_players: 4,
            players: [
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Uma',
                    card_count: 4,
                    player_index: 0,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Victor',
                    card_count: 3,
                    player_index: 1,
                    claimed: false,
                },
                {
                    owner: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
                    username: 'Wendy',
                    card_count: 5,
                    player_index: 2,
                    claimed: false,
                },
            ],
            started: true,
            ended: false,
            winner: null,
            seed: 51,
        },
    },
];
