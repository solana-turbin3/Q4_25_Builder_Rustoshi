# DegenDecks 🃏

> A fully on-chain, multiplayer Whot card game built on Solana with verifiable randomness and optimistic execution.

[![Solana](https://img.shields.io/badge/Solana-2.1.0-blueviolet)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-blue)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

DegenDecks brings the classic African card game **Whot** to the blockchain, featuring real-time multiplayer gameplay, provably fair card shuffling, and SPL token staking. Built with cutting-edge Solana infrastructure including MagicBlock's Ephemeral Rollups for optimistic execution and VRF for verifiable randomness.

### 📍 Program ID
```
Dege4SWaJoarqG9qh3wWhKwP84XaCru2FuNCEkAUQY6U
```

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Game Rules](#game-rules)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

DegenDecks is a decentralized gaming platform that implements the popular Whot card game entirely on-chain. Players can create game rooms, stake SOL or USDC, and compete in real-time matches where every card shuffle is verifiably random and every move is recorded on the Solana blockchain.

### What is Whot?

Whot is a fast-paced card game similar to UNO, popular across Africa. Players race to empty their hands by matching cards by shape or number, with special action cards that can change the game's momentum.

---

## ✨ Features

### 🎮 Gameplay
- **Multiplayer Support**: 2-5 players per game
- **Real-time Gameplay**: Fast, responsive on-chain interactions
- **Special Cards**: Hold On, Pick 2, Pick 3, Suspension, General Market, and WHOT (wild card)
- **Timeout Enforcement**: Automatic penalties for slow players (30-120 second turns)
- **Win Conditions**: First to empty hand wins, or lowest card count when deck runs out

### 🔐 Security & Fairness
- **Verifiable Randomness**: MagicBlock VRF ensures provably fair card shuffling
- **On-chain Validation**: All game logic executed and verified on Solana
- **Transparent Rules**: Open-source smart contract with auditable game mechanics
- **No Cheating**: Impossible to manipulate card draws or game state

### 💰 Economics
- **Multi-token Support**: Stake with SOL or USDC (configurable)
- **Platform Fees**: Configurable fee system (basis points)
- **Winner Takes All**: Prize pool distributed to winner minus platform fee
- **Player Stats**: Track wins, losses, and earnings on-chain

### ⚡ Performance
- **Ephemeral Rollups**: Optimistic execution via MagicBlock for instant gameplay
- **Low Latency**: Sub-second transaction confirmations
- **Scalable**: Handles multiple concurrent games efficiently

### 🎨 User Experience
- **Modern UI**: Built with Next.js 15 and Tailwind CSS
- **Wallet Integration**: Support for all major Solana wallets
- **Toast Notifications**: Real-time feedback for all actions
- **Responsive Design**: Works on desktop and mobile devices

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Hero       │  │   Games      │  │   Profile    │      │
│  │   Component  │  │   List       │  │   Stats      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Wallet Adapter & Anchor Provider              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        MagicBlock Magic Router SDK                   │   │
│  │        (Session & Transaction Routing)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ RPC
┌─────────────────────────────────────────────────────────────┐
│                      Solana Blockchain                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         DegenDecks Program (Anchor)                  │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Config  │  │ Profile  │  │   Game   │          │   │
│  │  │   PDA    │  │   PDA    │  │   PDA    │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  │                                                       │   │
│  │  Game Logic: Card Validation, Turn Management,      │   │
│  │  Special Cards, Win Conditions, Prize Distribution  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        MagicBlock Ephemeral Rollups SDK              │   │
│  │        (Optimistic Execution Layer)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        MagicBlock VRF Oracle                         │   │
│  │        (Verifiable Random Function)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Smart Contract
- **[Anchor Framework](https://www.anchor-lang.com/)** `v0.31.1` - Solana program development framework
- **[Solana](https://solana.com)** `v2.1.0` - High-performance blockchain
- **[MagicBlock Ephemeral Rollups SDK](https://docs.magicblock.gg/)** `v0.2.12` - Optimistic execution layer
- **[MagicBlock VRF SDK](https://docs.magicblock.gg/)** `v0.1.2` - Verifiable randomness oracle
- **Rust** - Systems programming language

### Frontend
- **[Next.js](https://nextjs.org/)** `v15.4.6` - React framework with App Router
- **[React](https://react.dev/)** `v19.1.0` - UI library
- **[TypeScript](https://www.typescriptlang.org/)** `v5` - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** `v4` - Utility-first CSS framework
- **[MagicBlock Magic Router SDK](https://docs.magicblock.gg/)** `v1.0.10` - Ephemeral session management
- **[Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)** - Wallet integration
- **[@coral-xyz/anchor](https://www.npmjs.com/package/@coral-xyz/anchor)** `v0.31.1` - Anchor TypeScript client
- **[react-hot-toast](https://react-hot-toast.com/)** - Toast notifications

> **Note**: The frontend is currently under active development. Core gameplay UI (card playing, hand management, game state visualization) is being implemented.

### Development Tools
- **TypeScript** - Type safety across the stack
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Mocha & Chai** - Testing framework

---

## 🎲 Game Rules

### Deck Composition (54 cards)
- **Circle**: 12 cards (1,2,3,4,5,7,8,10,11,12,13,14)
- **Triangle**: 12 cards (1,2,3,4,5,7,8,10,11,12,13,14)
- **Cross**: 9 cards (1,2,3,5,7,10,11,13,14)
- **Square**: 9 cards (1,2,3,5,7,10,11,13,14)
- **Star**: 7 cards (1,2,3,4,5,7,8)
- **WHOT**: 5 cards (20,20,20,20,20)

### Special Cards
| Card | Name | Effect |
|------|------|--------|
| **1** | Hold On | Play again immediately |
| **2** | Pick 2 | Next player draws 2 cards (stackable) |
| **5** | Pick 3 | Next player draws 3 cards (stackable) |
| **8** | Suspension | Skip next player's turn |
| **14** | General Market | All other players draw 1 card |
| **20** | WHOT | Wild card - request any shape |

### Gameplay
1. Each player starts with 2 cards
2. One card is placed face-up as the "call card"
3. Players take turns matching the call card by **shape** or **number**
4. If unable to play, draw from the pile
5. Special cards trigger their effects immediately
6. First player to empty their hand wins
7. If deck runs out, player with lowest card count wins

### Scoring (when deck empty)
- Regular cards: Face value
- WHOT cards: 2× face value (40 points each)

### Timeout Rules
- Each turn has a time limit (30-120 seconds, set by game creator)
- If a player exceeds the time limit, any other player can penalize them
- Penalty: Draw 1 card and lose turn

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `v18+` and **npm** or **yarn**
- **Rust** `v1.75+` and **Cargo**
- **Solana CLI** `v2.1.0+`
- **Anchor CLI** `v0.31.1`
- **Solana Wallet** (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/DegenDecks.git
   cd DegenDecks
   ```

2. **Install Anchor Program dependencies**
   ```bash
   cd anchor-program
   yarn install
   ```

3. **Install Frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Set up Solana CLI**
   ```bash
   # Set to devnet
   solana config set --url devnet
   
   # Create a new keypair (if needed)
   solana-keygen new
   
   # Airdrop SOL for testing
   solana airdrop 2
   ```

2. **Configure Anchor**
   
   Edit `anchor-program/Anchor.toml`:
   ```toml
   [provider]
   cluster = "devnet"
   wallet = "~/.config/solana/id.json"
   ```

3. **Environment Variables**
   
   Create `anchor-program/.env`:
   ```env
   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
   ANCHOR_WALLET=~/.config/solana/id.json
   ```

---

## 📁 Project Structure

```
DegenDecks/
├── anchor-program/              # Solana smart contract
│   ├── programs/
│   │   └── degen_decks/
│   │       ├── src/
│   │       │   ├── lib.rs       # Program entry point
│   │       │   ├── constants.rs # Game constants
│   │       │   ├── state/       # Account structures
│   │       │   │   ├── config.rs
│   │       │   │   ├── profile.rs
│   │       │   │   ├── game.rs
│   │       │   │   ├── player.rs
│   │       │   │   └── card.rs
│   │       │   ├── instructions/ # Program instructions
│   │       │   │   ├── initialize.rs
│   │       │   │   ├── initialize_profile.rs
│   │       │   │   ├── initialize_game.rs
│   │       │   │   ├── join_game.rs
│   │       │   │   ├── play_card.rs
│   │       │   │   ├── draw_from_pile.rs
│   │       │   │   ├── penalize_opponent.rs
│   │       │   │   ├── claim_prize.rs
│   │       │   │   ├── exit_game.rs
│   │       │   │   └── consume_randomness.rs
│   │       │   ├── errors/      # Custom error types
│   │       │   ├── events.rs    # Program events
│   │       │   └── utils/       # Helper functions
│   │       │       ├── shuffle_cards.rs
│   │       │       └── spl_transfer.rs
│   │       └── Cargo.toml
│   ├── tests/                   # Integration tests
│   │   └── degen-decks.ts
│   ├── Anchor.toml              # Anchor configuration
│   └── package.json
│
├── frontend/                    # Next.js application
│   ├── app/                     # App router pages
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── Games.tsx
│   │   ├── GameCard.tsx
│   │   ├── RegistrationModal.tsx
│   │   ├── RegistrationCheck.tsx
│   │   ├── CreateGameModal.tsx
│   │   └── ToasterProvider.tsx
│   ├── providers/               # Context providers
│   │   ├── AppProvider.tsx
│   │   └── WalletContextProvider.tsx
│   ├── program/                 # Program utilities
│   │   └── index.ts             # PDA helpers, types
│   ├── public/                  # Static assets
│   ├── tailwind.config.ts       # Tailwind configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── package.json
│
└── README.md                    # This file
```

---

## 🔧 Smart Contract

### Core Instructions

#### 1. Initialize (Admin)
```rust
pub fn initialize(
    ctx: Context<Initialize>,
    platform_fee: u16,
    allow_mints: Vec<Pubkey>
) -> Result<()>
```
Sets up global configuration with platform fee and allowed token mints.

#### 2. Initialize Profile
```rust
pub fn initialize_profile(
    ctx: Context<InitializeProfile>,
    username: String
) -> Result<()>
```
Creates a user profile with username (3-32 characters).

#### 3. Initialize Game
```rust
pub fn initialize_game(
    ctx: Context<InitializeGame>,
    seed: u64,
    entry_stake: u64,
    no_players: u8,
    wait_time: i64
) -> Result<()>
```
Creates a new game room with specified parameters:
- `seed`: Unique game identifier
- `entry_stake`: Amount each player must stake
- `no_players`: Number of players (2-5)
- `wait_time`: Turn timeout in seconds (30-120)

#### 4. Join Game
```rust
pub fn join_game(ctx: Context<JoinGame>) -> Result<()>
```
Allows players to join an existing game. When the game fills up, automatically requests VRF randomness.

#### 5. Consume Randomness (VRF Callback)
```rust
pub fn consume_randomness(
    ctx: Context<ConsumeRandomness>,
    randomness: [u8; 32]
) -> Result<()>
```
Called by MagicBlock VRF oracle to provide randomness. Shuffles deck, deals cards, and starts the game.

#### 6. Play Card
```rust
pub fn play_card(
    ctx: Context<PlayCard>,
    card: Card,
    shape_requested: Option<u8>
) -> Result<()>
```
Plays a card from the player's hand. Validates card matches call card and handles special card effects.

#### 7. Draw From Pile
```rust
pub fn draw_from_pile(ctx: Context<DrawFromPile>) -> Result<()>
```
Draws a card from the deck when unable to play.

#### 8. Penalize Opponent
```rust
pub fn penalize_opponent(ctx: Context<PenalizeOpponent>) -> Result<()>
```
Enforces timeout by making slow player draw a card.

#### 9. Claim Prize
```rust
pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()>
```
Winner claims the prize pool after game ends.

### Account Structure

#### Config (Global)
```rust
pub struct Config {
    pub platform_fee: u16,           // Basis points
    pub fee_wallet: Pubkey,
    pub allowed_mints: Vec<Pubkey>,  // Max 10
    pub bump: u8
}
```
**PDA**: `["CONFIG"]`

#### Profile (Per User)
```rust
pub struct Profile {
    pub username: String,      // Max 32 chars
    pub total_won: u64,
    pub total_lost: u64,
    pub created_at: i64,
    pub bump: u8
}
```
**PDA**: `["PROFILE", user_pubkey]`

#### Game (Per Game Room)
```rust
pub struct Game {
    pub owner: Pubkey,
    pub entry_stake: u64,
    pub game_vault: Pubkey,
    pub stake_mint: Pubkey,
    pub no_players: u8,
    pub player_turn: u8,
    pub players: Vec<Player>,         // Max 5
    pub winner: Option<Pubkey>,
    pub call_card: Option<Card>,
    pub draw_pile: Option<Vec<Card>>, // Max 54
    pub cards_to_draw: Option<u8>,
    pub card_requested: Option<u8>,
    pub wait_time: i64,
    pub seed: u64,
    pub random_seed: Option<u64>,
    pub delegated: bool,
    pub started: bool,
    pub ended: bool,
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub ended_at: Option<i64>,
    pub last_move_time: Option<i64>,
    pub bump: u8
}
```
**PDA**: `["GAME", seed (u64), owner_pubkey]`

---

## 🎨 Frontend

### Key Components

#### AppProvider
Global state management for:
- Wallet connection
- Program instance
- User profile
- Games list
- Registration status

#### CreateGameModal
User-friendly modal for creating games:
- Number of players (2-5) - pill buttons
- Entry stake - numeric input
- Token selection (SOL/USDC) - toggle buttons
- Max wait time (30s/1m/2m) - pill buttons
- Real-time validation
- Toast notifications

#### Games Component
Displays all available games with filters:
- All games
- Active games
- High stakes
- Game history

#### RegistrationCheck
Automatic profile check on wallet connection. Prompts user to register if no profile exists.

### Wallet Integration

Supports all major Solana wallets:
- Phantom
- Solflare
- Backpack
- Ledger
- And more via `@solana/wallet-adapter`

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd anchor-program

# Run all tests
anchor test

# Run specific test file
anchor test --skip-deploy tests/degen-decks.ts

# Run with detailed logs
RUST_LOG=debug anchor test
```

### Test Coverage
The test suite covers complete gameplay which includes:
- ✅ Config initialization
- ✅ Profile creation
- ✅ Game creation with WSOL
- ✅ Multiple players joining
- ✅ VRF randomness consumption
- ✅ Card playing and validation
- ✅ Special card effects
- ✅ Drawing from pile
- ✅ Win conditions
- ✅ Prize claiming

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

Visit `http://localhost:3000` to see the app.

---

## 🚢 Deployment

### Deploy Smart Contract

1. **Build the program**
   ```bash
   cd anchor-program
   anchor build
   ```

2. **Deploy to devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. **Initialize config** (one-time)
   ```bash
   # Run initialization script
   anchor run initialize
   ```

4. **Verify deployment**
   ```bash
   solana program show <PROGRAM_ID>
   ```

### Deploy Frontend

#### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`
   - Deploy

3. **Configure environment variables** (if needed)
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=Dege4SWaJoarqG9qh3wWhKwP84XaCru2FuNCEkAUQY6U
   ```

#### Manual Deployment

```bash
cd frontend
npm run build
npm run start
```

---

## 🔑 Key Protocols & Technologies

### MagicBlock Ephemeral Rollups

**What it does**: Provides optimistic execution for instant gameplay while maintaining Solana's security.

**How we use it**:
- `#[ephemeral]` attribute on the program module enables rollup support
- Delegation flags (`play_card_and_delegate`, `draw_from_pile_and_delegate`) for optimistic transactions
- `commit_game` instruction finalizes game state on L1

**Benefits**:
- Sub-second transaction confirmations
- Better UX for real-time gameplay
- Lower costs for frequent actions
- Automatic rollback on conflicts

**Learn more**: [MagicBlock Docs](https://docs.magicblock.gg/)

### MagicBlock VRF (Verifiable Random Function)

**What it does**: Provides cryptographically secure, verifiable randomness on-chain.

**How we use it**:
- `#[vrf]` macro on `JoinGame` instruction
- Requests randomness when game fills up
- VRF oracle calls back to `consume_randomness` with 32 bytes of randomness
- Fisher-Yates shuffle algorithm uses VRF output to shuffle deck

**Why it matters**:
- Prevents card manipulation
- Ensures fair gameplay
- Verifiable by all players
- No trusted third party needed

**Flow**:
```
1. Last player joins → request_randomness()
2. VRF oracle generates randomness
3. Oracle calls consume_randomness(randomness)
4. Program shuffles deck using randomness
5. Game starts with provably fair deck
```

**Learn more**: [MagicBlock VRF Docs](https://docs.magicblock.gg/VRF/overview)

### MagicBlock Magic Router

**What it does**: Manages ephemeral sessions and routes transactions to the appropriate execution layer (L1 or ephemeral rollup).

**How we use it**:
- Session management for seamless gameplay
- Automatic routing of delegated vs. non-delegated transactions
- Handles ephemeral account lifecycle
- Manages state synchronization between L1 and rollup

**Benefits**:
- Simplified developer experience
- Automatic session handling
- Transparent transaction routing
- Reduced complexity for end users

**Use cases in DegenDecks**:
- Managing player sessions during active games
- Routing gameplay actions (play card, draw) to ephemeral layer
- Routing critical actions (create game, claim prize) to L1
- Automatic session cleanup after game ends

**Learn more**: [MagicBlock Magic Router Docs](https://docs.magicblock.gg/)

---

## 🎯 Roadmap

- [x] Core game logic
- [x] VRF integration
- [x] Ephemeral rollups support
- [x] Multi-token support
- [x] Frontend UI
- [x] Create game modal
- [ ] In-game UI (play cards, draw, etc.)
- [ ] Game spectator mode
- [ ] Tournament system
- [ ] Leaderboards
- [ ] NFT card skins
- [ ] Mainnet deployment

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Use conventional commits
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[MagicBlock](https://magicblock.gg/)** - For Ephemeral Rollups and VRF infrastructure
- **[Solana Foundation](https://solana.org/)** - For the high-performance blockchain
- **[Anchor](https://www.anchor-lang.com/)** - For the amazing development framework
- **[Whot Game](https://en.wikipedia.org/wiki/Whot!)** - For the classic card game inspiration
