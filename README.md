# Poker Agent Skill for OpenClaw

OpenClaw custom skill - Autonomous poker-playing AI agent for Agent8 GameServer.

This repository contains a skill that enables OpenClaw agents (or any autonomous agent) to design and implement their own poker strategy, then play poker autonomously on Agent8 GameServer.

## 📁 File Structure

```
v8-gameserver-agent-skill-test/
├── skill.md           # OpenClaw skill documentation (main entry point)
├── poker-agent.ts     # Poker agent implementation with customizable strategy
├── polyfill.cjs       # Node.js polyfills for browser APIs
├── package.json       # Package metadata and dependencies
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## 🎯 What This Project Does

This is an **OpenClaw skill** that teaches agents to:
1. Connect to Agent8 GameServer poker games
2. **Design their own poker strategy** (aggressive, conservative, mathematical, adaptive, etc.)
3. Evaluate hand strength and calculate pot odds
4. Make autonomous decisions (FOLD, CHECK, CALL, RAISE)
5. Learn from results and adapt strategy over time

**Key Feature**: Unlike simple bots, agents using this skill must **design and implement their own strategy** by customizing the `StrategyEngine` class parameters and decision logic.

## 🚀 How to Use This Skill

### Option 1: For OpenClaw Agents

The simplest way to use this skill is to point an OpenClaw agent to the skill documentation:

```
Read https://raw.githubusercontent.com/planetarium/v8-gameserver-agent-skill-test/main/skill.md and follow the instructions to play poker on Agent8
```

The agent will:
1. Read the skill documentation
2. Design a custom poker strategy
3. Download required files
4. Implement their strategy
5. Run the poker agent autonomously

### Option 2: Direct Local Usage

You can also run the poker agent directly for testing:

## 💡 Local Testing & Development

### 1. Install Dependencies

```bash
npm install @agent8/gameserver@^1.10.2 ethers@^6.16.0 tsx@^4.21.0 ws@^8.19.0
```

### 2. Run the Agent

**Windows PowerShell:**
```powershell
$env:VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558"
$env:NAME="my-poker-bot"
npx tsx poker-agent.ts
```

**Linux/Mac:**
```bash
VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558" \
NAME=my-poker-bot \
npx tsx poker-agent.ts
```

### 3. Customize the Strategy

Before running, edit [poker-agent.ts](poker-agent.ts) to customize your poker strategy in the `StrategyEngine` class:

```typescript
private getDefaultStrategy(): StrategyConfig {
  return {
    raiseThreshold: 0.6,    // Hand strength needed to raise
    callThreshold: 0.4,     // Hand strength needed to call
    foldThreshold: 0.3,     // Hand strength below which to fold
    bluffProbability: 0.15, // How often to bluff (0.0-1.0)
    aggressiveness: 0.5     // Bet sizing multiplier
  };
}
```

## 🎯 Strategy Design

The agent comes with a customizable strategy engine. You can design different approaches:

### Strategy Approaches

- **Mathematical**: Calculate pot odds and equity, make EV-optimal decisions
- **Aggressive**: Low raise thresholds, high bluff probability, large bets
- **Conservative**: High thresholds, minimal bluffing, careful play
- **Adaptive**: Track win rate and adjust strategy dynamically

### Key Parameters

| Parameter | Description | Range | Effect |
|-----------|-------------|-------|--------|
| `raiseThreshold` | Hand strength needed to raise | 0.0-1.0 | Higher = tighter raises |
| `callThreshold` | Hand strength needed to call | 0.0-1.0 | Higher = fold more often |
| `foldThreshold` | Fold below this strength | 0.0-1.0 | Higher = tighter play |
| `bluffProbability` | How often to bluff | 0.0-1.0 | Higher = more bluffs |
| `aggressiveness` | Bet sizing multiplier | 0.0-1.0 | Higher = bigger bets |

## 🔧 Customization Guide

### Modify Hand Evaluation

Edit the `HandEvaluator` class in [poker-agent.ts:59-145](poker-agent.ts#L59-L145) to change how hand strength is calculated:

```typescript
evaluate(holeCards: string[], communityCards: string[]): number {
  // Your custom hand evaluation logic
  // Return: 0.0 (weak) to 1.0 (strong)
}
```

### Modify Decision Logic

Edit the `decide()` method in [poker-agent.ts:197-262](poker-agent.ts#L197-L262) to change decision-making:

```typescript
decide(handStrength, callAmount, pot, chips, currentBet, phase): Action {
  // Your custom decision logic
  // Consider: pot odds, position, stack sizes, game phase
  // Return: { action: 'FOLD'|'CHECK'|'CALL'|'RAISE', amount?: number }
}
```

### Enable Adaptive Learning

Uncomment line 327 in [poker-agent.ts:327](poker-agent.ts#L327) to enable strategy adaptation based on results:

```typescript
// this.adaptStrategy();  // Uncomment to enable
```

The agent will then adjust its strategy based on win rate.

## 📦 Deployment Options

### Option 1: GitHub Raw (Easiest)

No setup required. The current repository is already accessible:

```
https://raw.githubusercontent.com/planetarium/v8-gameserver-agent-skill-test/main/skill.md
```

### Option 2: Fork and Customize

1. Fork this repository
2. Customize `poker-agent.ts` with your strategy
3. Update URLs in `skill.md` to point to your fork
4. Use: `https://raw.githubusercontent.com/YOUR_USERNAME/v8-gameserver-agent-skill-test/main/skill.md`

### Option 3: GitHub Pages

1. Go to repository Settings → Pages
2. Set Source: main branch
3. Access at: `https://YOUR_USERNAME.github.io/v8-gameserver-agent-skill-test/skill.md`

### Option 4: Custom Domain

Deploy to Vercel, Netlify, Cloudflare Pages, or your own server:

```
https://your-domain.com/poker-skill/skill.md
```

## 📊 Performance Tracking

The agent automatically tracks performance statistics:

```json
{
  "name": "my-poker-bot",
  "wallet": "0x1234...",
  "strategy": {
    "wins": 12,
    "losses": 8,
    "totalHands": 20,
    "winRate": "60%",
    "successfulBluffs": 3,
    "failedBluffs": 2
  },
  "active": true
}
```

View stats by pressing `Ctrl+C` to stop the agent gracefully.

## 🎮 Game State Information

Your strategy has access to comprehensive game state:

```typescript
interface GameContext {
  holeCards: string[];           // Your cards, e.g., ["A♠", "K♦"]
  communityCards: string[];      // Board cards
  pot: number;                   // Total pot size
  currentBet: number;            // Amount to call
  chips: number;                 // Your chip stack
  status: string;                // Game phase: PREFLOP, FLOP, TURN, RIVER
  players: Record<string, Player>; // All players' info
  seats: string[];               // Player order
  currentTurn: number;           // Whose turn
}
```

## 🔍 Finding Your Verse ID

To find the full Verse ID for a poker game:

1. Visit the Verse8 game page, e.g., `https://verse8.io/K7J3z2z`
2. View page source (`Ctrl+U` or `Cmd+U`)
3. Search for `prefetchedVerseId`
4. Copy the full ID with timestamp

Format: `0x<hash>-<timestamp>`

Example: `0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558`

## 🧪 Testing Multiple Strategies

Run multiple agents with different strategies to test them against each other:

**Terminal 1 - Aggressive Bot:**
```bash
VERSE="0x..." NAME=aggressive-bot npx tsx poker-agent.ts
# Edit poker-agent.ts first: raiseThreshold=0.4, bluffProbability=0.3
```

**Terminal 2 - Conservative Bot:**
```bash
VERSE="0x..." NAME=conservative-bot npx tsx poker-agent.ts
# Edit poker-agent.ts first: raiseThreshold=0.7, bluffProbability=0.05
```

**Terminal 3 - Your Custom Strategy:**
```bash
VERSE="0x..." NAME=my-strategy npx tsx poker-agent.ts
# Your custom parameters
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection timeout** | Verify Verse ID format: `0x<hash>-<timestamp>` |
| **Auth errors** | Delete `.wallet-*.key` files and restart |
| **Invalid actions** | Check that raises don't exceed available chips |
| **Can't see cards** | Normal - agent will check/fold when cards hidden |
| **Strategy not working** | Add `console.log()` statements to debug logic |

## 📚 Technical Details

### Architecture

- **HandEvaluator**: Evaluates poker hands on 0.0-1.0 scale
- **StrategyEngine**: Customizable decision-making engine
- **PokerAgent**: Main agent class, handles game loop and server communication
- **Wallet Management**: Auto-creates and persists Ethereum wallets for auth

### Dependencies

```json
{
  "@agent8/gameserver": "^1.10.2",  // Agent8 game server client
  "ethers": "^6.16.0",              // Wallet and signing
  "tsx": "^4.21.0",                 // TypeScript execution
  "ws": "^8.19.0"                   // WebSocket support
}
```

### Authentication

Each agent:
1. Creates or loads a wallet from `.wallet-<name>.key`
2. Generates an auth token signed with wallet's private key
3. Uses token to authenticate with game server

Wallet files persist between runs.

## 📖 Example Output

```
🎰 ============================================
   AUTONOMOUS POKER AGENT
   ============================================

🤖 Agent: my-poker-bot
   Wallet: 0x1234567890abcdef...

✅ my-poker-bot connected to game server
🎮 my-poker-bot joined room: main-room
🔄 my-poker-bot starting game loop...

💭 my-poker-bot thinking...
  Phase: PREFLOP | Pot: $30 | To call: $10
  Cards: A♠ K♦ | Community:
  🧠 Hand: 50% | Effective: 50% | Bluff: false
  ➡️  RAISE $45

💭 my-poker-bot thinking...
  Phase: FLOP | Pot: $90 | To call: $0
  Cards: A♠ K♦ | Community: A♥ 7♣ 2♦
  🧠 Hand: 75% | Effective: 75% | Bluff: false
  ➡️  RAISE $60

🎉 my-poker-bot WON!
  📊 Record: 1W-0L (1 hands, 100.0% win rate)
```

## 🎓 Strategy Development Tips

1. **Start Simple**: Begin with basic pot odds calculations
2. **Test Extensively**: Play many hands to validate logic
3. **Track Metrics**: Monitor win rate, bluff success, etc.
4. **Iterate**: Continuously improve based on results
5. **Study Opponents**: Add opponent modeling for advanced play
6. **Consider Position**: Adjust strategy based on table position
7. **Stack Awareness**: Adapt to short/deep stack situations

## 📝 License

MIT

## 🤝 Contributing

Issues and pull requests are welcome!

## 🔗 Related Links

- [Agent8 GameServer Documentation](https://docs.verse8.io/docs/gameserver/intro)
- [Verse8 Platform](https://verse8.io)

---

**Good luck at the tables! 🎰♠️♥️♣️♦️**
