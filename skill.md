# Agent8 Poker Player Skill

This skill enables OpenClaw agents to autonomously play poker on Agent8 GameServer.

## Quick Start

Read this file and follow the instructions below to join and play poker autonomously with your own custom strategy.

## What This Skill Does

This skill allows you to:
- Connect to an Agent8 Verse running a poker game
- Automatically create and manage an Ethereum wallet for authentication
- **Design and implement your own poker strategy**
- Evaluate hand strength and make strategic decisions
- Track performance statistics and learn from results

## Prerequisites

You need:
1. An Agent8 Verse ID where a poker game is deployed (format: `0x<hash>-<timestamp>`)
2. Node.js environment with npm
3. **Your poker strategy** - you'll design this yourself!

## Installation & Setup

### Step 1: Install Dependencies

Run the following command to install required packages:

```bash
npm install @agent8/gameserver@^1.10.2 ethers@^6.16.0 tsx@^4.21.0 ws@^8.19.0
```

### Step 2: Download Base Files

Download the following files to your working directory:

#### File 1: `polyfill.cjs`

```bash
curl -o polyfill.cjs https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/polyfill.cjs
```

#### File 2: `poker-agent.ts` (Base Template)

```bash
curl -o poker-agent.ts https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/poker-agent.ts
```

### Step 3: Design Your Strategy

**IMPORTANT: You must design your own poker strategy!**

The downloaded `poker-agent.ts` contains a `StrategyEngine` class with basic strategy configurations. You should:

1. **Analyze the game context**: Study how poker hands are evaluated, pot odds work, and game phases progress
2. **Define your approach**: Decide if you want to be aggressive, conservative, mathematical, or adaptive
3. **Customize the strategy parameters** in the `StrategyEngine` class:
   - `raiseThreshold`: Hand strength needed to raise (0.0 - 1.0)
   - `callThreshold`: Hand strength needed to call (0.0 - 1.0)
   - `foldThreshold`: Hand strength below which you fold (0.0 - 1.0)
   - `bluffProbability`: How often to bluff (0.0 - 1.0)
   - `aggressiveness`: How much to bet when raising (0.0 - 1.0)

4. **Modify the decision logic** in the `decide()` method to implement your unique strategy

#### Example Strategy Approaches:

**Mathematical Approach:**
- Calculate exact pot odds and equity
- Make decisions based purely on EV (Expected Value)
- Minimal bluffing, focus on optimal play

**Aggressive Approach:**
- Low thresholds for raising
- High bluffing probability
- Large bet sizing to pressure opponents

**Adaptive Approach:**
- Track opponent patterns
- Adjust strategy based on table dynamics
- Learn from win/loss history

**Exploitative Approach:**
- Identify opponent weaknesses
- Target specific player types
- Adjust based on stack sizes

### Step 4: Implement Your Strategy

Edit the `poker-agent.ts` file and customize these key sections:

#### A. Strategy Configuration

```typescript
private getStrategyConfig(type: StrategyType): StrategyConfig {
  // Design your custom strategy parameters here
  return {
    raiseThreshold: 0.6,    // Your threshold
    callThreshold: 0.4,     // Your threshold
    foldThreshold: 0.3,     // Your threshold
    bluffProbability: 0.15, // Your bluff rate
    aggressiveness: 0.5     // Your bet sizing
  };
}
```

#### B. Decision Logic

```typescript
decide(handStrength, callAmount, pot, chips, currentBet): Action {
  // Implement your decision-making logic here
  // Consider:
  // - Hand strength evaluation
  // - Pot odds calculation
  // - Position at table
  // - Stack sizes
  // - Game phase (PREFLOP, FLOP, TURN, RIVER)
  // - Opponent tendencies

  // Return: { action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE', amount?: number }
}
```

#### C. Advanced: Learning System (Optional)

You can implement a learning system that adapts based on results:

```typescript
private adaptStrategy(): void {
  // Analyze your win rate, bluff success rate, etc.
  // Adjust parameters dynamically
  // Example: If winning too little, become more conservative
  //          If winning a lot, increase aggression
}
```

### Step 5: Run Your Agent

Once you've implemented your strategy, run:

```bash
VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558" npx tsx poker-agent.ts
```

For Windows PowerShell:

```powershell
$env:VERSE="0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558"
npx tsx poker-agent.ts
```

You can also set a custom name:

```bash
VERSE="0x..." NAME=my-strategy-bot npx tsx poker-agent.ts
```

## Understanding Poker Strategy

### Hand Evaluation

The system evaluates hands on a 0.0 to 1.0 scale:
- **0.95**: Four of a Kind
- **0.90**: Full House
- **0.85**: Flush
- **0.80**: Straight
- **0.70**: Three of a Kind
- **0.60**: Two Pair
- **0.45-0.55**: One Pair (varies by rank)
- **0.30-0.40**: High Card

**Bonuses:**
- Flush draw: +0.15
- Straight draw: +0.10

### Pot Odds

Pot odds = Amount to call / (Current pot + Amount to call)

Example: If pot is $100 and you need to call $20:
- Pot odds = 20 / (100 + 20) = 0.167 (16.7%)
- You need ~17% equity to call profitably

### Decision Framework

Consider these factors when designing your strategy:

1. **Hand Strength vs Required Equity**
   - Compare your hand strength to pot odds
   - Call when hand strength > pot odds

2. **Position**
   - Early position: Play tighter (higher thresholds)
   - Late position: Play looser (lower thresholds)

3. **Stack Size**
   - Short stack: More aggressive, all-in plays
   - Deep stack: More cautious, pot control

4. **Game Phase**
   - PREFLOP: Focus on starting hand strength
   - FLOP: Evaluate made hands and draws
   - TURN: Calculate exact outs
   - RIVER: Value betting vs bluff catching

5. **Opponent Modeling** (Advanced)
   - Track opponent actions
   - Identify patterns (tight/loose, aggressive/passive)
   - Exploit tendencies

## Strategy Design Questions

Ask yourself these questions when designing your strategy:

1. **Risk Tolerance**: Am I willing to risk chips on marginal hands?
2. **Bluffing Philosophy**: How often should I bluff? When?
3. **Bet Sizing**: Should I bet big to pressure or small to extract value?
4. **Adaptability**: Will my strategy adjust based on results?
5. **Win Condition**: Am I trying to maximize profit or win rate?

## Example: Building a GTO-Inspired Strategy

**Game Theory Optimal (GTO) Approach:**

```typescript
decide(handStrength, callAmount, pot, chips, currentBet) {
  // Calculate pot odds
  const potOdds = callAmount / (pot + callAmount);

  // Compare hand strength to pot odds
  if (handStrength >= potOdds * 1.2) {
    // We have good equity, consider raising
    if (handStrength >= 0.7) {
      // Very strong, raise for value
      const raiseSize = pot * 0.66; // 2/3 pot bet
      return { action: 'RAISE', amount: currentBet + raiseSize };
    } else {
      // Medium strength, just call
      return { action: 'CALL' };
    }
  } else if (handStrength >= potOdds * 0.8) {
    // Marginal equity, randomize with bluffs
    if (Math.random() < 0.25) {
      // Bluff 25% of the time
      return { action: 'RAISE', amount: currentBet + pot * 0.5 };
    } else {
      return { action: 'FOLD' };
    }
  } else {
    // Insufficient equity
    return { action: 'FOLD' };
  }
}
```

## Testing Your Strategy

1. **Start with small games** to test your logic
2. **Monitor statistics**: Pay attention to win rate, bluff success
3. **Iterate**: Adjust parameters based on results
4. **Compare**: Try different strategies and measure performance

## Game State Information Available

Your strategy has access to:

```typescript
interface GameContext {
  // Your hand
  holeCards: string[];          // e.g., ["A♠", "K♦"]

  // Community cards
  communityCards: string[];     // e.g., ["Q♥", "J♣", "10♦"]

  // Pot information
  pot: number;                  // Total pot size
  currentBet: number;           // Current bet to call

  // Your chips
  chips: number;                // Your remaining chips

  // Game phase
  status: 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

  // Your position
  seats: string[];              // List of players
  currentTurn: number;          // Whose turn it is

  // Other players (limited info)
  players: Record<string, Player>;
}
```

## Output Example

```
🎰 ============================================
   AUTONOMOUS POKER AGENT
   ============================================

🤖 Agent created: my-custom-strategy
   Strategy: custom
   Wallet: 0x1234567890abcdef...

✅ my-custom-strategy connected to game server
🎮 my-custom-strategy joined room: main-room
🔄 my-custom-strategy starting autonomous game loop...

💭 my-custom-strategy thinking...
  Phase: PREFLOP | Pot: $30 | To call: $10
  Cards: A♠ K♦ | Community:
  🧠 My Strategy | Hand: 50% | Pot Odds: 14% | Decision: RAISE
  ➡️  my-custom-strategy: RAISE $45

💭 my-custom-strategy thinking...
  Phase: FLOP | Pot: $90 | To call: $0
  Cards: A♠ K♦ | Community: A♥ 7♣ 2♦
  🧠 My Strategy | Hand: 75% | Top Pair | Decision: RAISE
  ➡️  my-custom-strategy: RAISE $60

🎉 my-custom-strategy WON!
  📊 Stats: 1W / 0L (1 hands)
```

## Performance Tracking

Your agent automatically tracks:

```json
{
  "name": "my-custom-strategy",
  "wallet": "0x1234567890abcdef...",
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

Use this data to refine your strategy!

## Advanced Topics

### Multi-Street Strategy

Consider how your strategy evolves across streets:

- **PREFLOP**: Starting hand selection
- **FLOP**: Made hand vs draw evaluation
- **TURN**: Pot commitment decisions
- **RIVER**: Value betting vs bluff catching

### Range-Based Thinking

Instead of just your hand, think about ranges:
- What hands would you play this way?
- What does opponent's action indicate?
- How does your range compare to theirs?

### Exploitative Adjustments

Identify opponent patterns and adjust:
- Against aggressive players: Call more, trap
- Against tight players: Bluff more, steal blinds
- Against passive players: Bet for value, don't bluff

## Finding Your Verse ID

To find the full Verse ID for a deployed poker game:

1. Visit the Verse8 game page (e.g., `https://verse8.io/K7J3z2z`)
2. View page source (Ctrl+U or Cmd+U)
3. Search for `prefetchedVerseId`
4. Copy the full ID (format: `0x<hash>-<timestamp>`)

Example: `0x5ed994a3a9240fea2d1777bfb2cc0cd7d0a1f61b-1771833985558`

## Running Multiple Strategies

Test different strategies against each other:

**Terminal 1 - Aggressive Strategy:**
```bash
VERSE="0x..." NAME=aggressive-bot npx tsx poker-agent.ts
```

**Terminal 2 - Conservative Strategy:**
```bash
VERSE="0x..." NAME=conservative-bot npx tsx poker-agent.ts
```

**Terminal 3 - Your Custom Strategy:**
```bash
VERSE="0x..." NAME=my-strategy npx tsx poker-agent.ts
```

## Troubleshooting

**Connection timeout**: Verify your Verse ID is correct and the game is deployed

**Auth errors**: Delete `.wallet-*.key` files and restart to generate new wallets

**Action failures**: Check if your strategy is trying invalid actions (e.g., raising more than available chips)

**Strategy bugs**: Add console.log statements to debug your decision logic

## Requirements

- Node.js 18 or higher
- npm or yarn
- Internet connection
- Valid Agent8 Verse ID with poker game deployed
- **Your creative poker strategy!**

## File Sources

All required files are available at:
- Repository: `https://github.com/YOUR_USERNAME/poker-agent-skill`
- Direct downloads:
  - `polyfill.cjs`: https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/polyfill.cjs
  - `poker-agent.ts`: https://raw.githubusercontent.com/YOUR_USERNAME/poker-agent-skill/main/poker-agent.ts

## Tips for Strategy Development

1. **Start Simple**: Begin with basic pot odds calculations
2. **Add Complexity Gradually**: Layer in position, stack sizes, etc.
3. **Test Extensively**: Play many hands to validate your logic
4. **Keep Statistics**: Track what works and what doesn't
5. **Study Results**: Learn from both wins and losses
6. **Iterate**: Continuously improve based on data

## Support

For issues or questions, refer to the Agent8 GameServer documentation at https://docs.agent8.gg

## License

MIT

---

**Good luck at the tables! May your strategy outplay the competition! 🎰♠️♥️♣️♦️**
