/**
 * Autonomous Poker Agent - Base Template
 *
 * This template provides the foundation for building your own poker strategy.
 * Customize the StrategyEngine class to implement your unique approach!
 */

import './polyfill.cjs';
import { GameServer } from '@agent8/gameserver';
import { Wallet, HDNodeWallet } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Types & Interfaces
// ============================================

interface Player {
  account: string;
  chips: number;
  bet: number;
  totalBet: number;
  holeCards: string[];
  folded: boolean;
  allIn: boolean;
  role: 'SB' | 'BB' | 'D' | '';
  active: boolean;
  disconnected: boolean;
  ready: boolean;
}

interface PublicState {
  status: 'WAITING' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';
  players: Record<string, Player>;
  seats: string[];
  dealerIndex: number;
  currentTurn: number;
  pot: number;
  communityCards: string[];
  currentBet: number;
  minRaise: number;
  actionLog: string[];
  winnerInfo: string | null;
  myAccount: string;
}

interface StrategyConfig {
  raiseThreshold: number;    // Hand strength needed to raise (0.0-1.0)
  callThreshold: number;     // Hand strength needed to call (0.0-1.0)
  foldThreshold: number;     // Hand strength below which to fold (0.0-1.0)
  bluffProbability: number;  // How often to bluff (0.0-1.0)
  aggressiveness: number;    // Bet sizing multiplier (0.0-1.0)
}

// ============================================
// Hand Evaluator
// ============================================

class HandEvaluator {
  /**
   * Evaluates poker hand strength on a 0.0 to 1.0 scale
   *
   * Hand Rankings:
   * - 0.95: Four of a Kind
   * - 0.90: Full House
   * - 0.85: Flush
   * - 0.80: Straight
   * - 0.70: Three of a Kind
   * - 0.60: Two Pair
   * - 0.45-0.55: One Pair (varies by rank)
   * - 0.30-0.40: High Card
   *
   * Bonuses: Flush draw (+0.15), Straight draw (+0.10)
   */
  evaluate(holeCards: string[], communityCards: string[]): number {
    const cards = [...holeCards, ...communityCards].filter(c => c !== '??');
    if (cards.length < 2) return 0.3;

    const ranks = cards.map(c => this.normalizeRank(c.slice(0, -1)));
    const suits = cards.map(c => c.slice(-1));

    // Count rank frequencies
    const rankCounts: Record<number, number> = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    // Count suit frequencies
    const suitCounts: Record<string, number> = {};
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const maxSuit = Math.max(...Object.values(suitCounts));

    // Check for straight
    const sortedRanks = [...new Set(ranks)].sort((a, b) => b - a);
    const hasStraightDraw = this.checkStraightDraw(sortedRanks);

    let strength = 0.3; // Base strength

    // Evaluate made hands
    if (counts[0] === 4) strength = 0.95;                        // Four of a kind
    else if (counts[0] === 3 && counts[1] === 2) strength = 0.9; // Full house
    else if (maxSuit >= 5) strength = 0.85;                      // Flush
    else if (hasStraightDraw && sortedRanks.length >= 5) strength = 0.8; // Straight
    else if (counts[0] === 3) strength = 0.7;                    // Three of a kind
    else if (counts[0] === 2 && counts[1] === 2) strength = 0.6; // Two pair
    else if (counts[0] === 2) {                                  // One pair
      const pairRank = parseInt(Object.keys(rankCounts).find(k => rankCounts[parseInt(k)] === 2) || '0');
      strength = pairRank >= 10 ? 0.55 : 0.45; // High pair vs low pair
    } else {                                                     // High card
      const highCard = Math.max(...ranks);
      strength = highCard >= 12 ? 0.4 : 0.3;
    }

    // Add bonuses for draws
    if (maxSuit === 4) strength += 0.15;      // Flush draw
    if (hasStraightDraw) strength += 0.1;     // Straight draw

    return Math.min(strength, 1.0);
  }

  private normalizeRank(rank: string): number {
    const map: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return map[rank] || 0;
  }

  private checkStraightDraw(sortedRanks: number[]): boolean {
    if (sortedRanks.length < 4) return false;

    for (let i = 0; i <= sortedRanks.length - 4; i++) {
      const slice = sortedRanks.slice(i, i + 5);
      if (slice.length >= 4) {
        const max = slice[0];
        const min = slice[slice.length - 1];
        if (max - min <= 4) return true;
      }
    }

    // Check for wheel (A-2-3-4-5)
    if (sortedRanks.includes(14) && sortedRanks.includes(2)) return true;

    return false;
  }
}

// ============================================
// Strategy Engine - CUSTOMIZE THIS!
// ============================================

class StrategyEngine {
  private config: StrategyConfig;
  private stats = {
    wins: 0,
    losses: 0,
    totalHands: 0,
    successfulBluffs: 0,
    failedBluffs: 0
  };

  constructor() {
    // Initialize with default balanced strategy
    this.config = this.getDefaultStrategy();
  }

  /**
   * CUSTOMIZE THIS: Define your strategy parameters
   *
   * Design your own poker strategy by adjusting these values:
   * - raiseThreshold: Hand strength needed to raise (higher = tighter)
   * - callThreshold: Hand strength needed to call (higher = tighter)
   * - foldThreshold: Hand strength below which you fold
   * - bluffProbability: How often to bluff (0.0-1.0)
   * - aggressiveness: Bet sizing (higher = bigger bets)
   */
  private getDefaultStrategy(): StrategyConfig {
    return {
      raiseThreshold: 0.6,    // Raise with decent hands
      callThreshold: 0.4,     // Call with medium hands
      foldThreshold: 0.3,     // Fold weak hands
      bluffProbability: 0.15, // Bluff 15% of the time
      aggressiveness: 0.5     // Medium bet sizing
    };
  }

  /**
   * CUSTOMIZE THIS: Implement your decision-making logic
   *
   * This is where you design how your agent makes poker decisions.
   * Consider:
   * - Hand strength vs pot odds
   * - Position at the table
   * - Stack sizes
   * - Game phase (PREFLOP, FLOP, TURN, RIVER)
   * - Opponent patterns (advanced)
   */
  decide(
    handStrength: number,
    callAmount: number,
    pot: number,
    chips: number,
    currentBet: number,
    _phase: string  // Prefixed with _ to indicate intentionally unused
  ): { action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALL_IN', amount?: number } {

    // Calculate pot odds
    const potOdds = callAmount > 0 ? callAmount / (pot + callAmount) : 0;

    // Decide whether to bluff
    const shouldBluff = Math.random() < this.config.bluffProbability;
    const effectiveStrength = shouldBluff ? Math.min(handStrength + 0.3, 1.0) : handStrength;

    console.log(`  🧠 Hand: ${(handStrength * 100).toFixed(0)}% | Effective: ${(effectiveStrength * 100).toFixed(0)}% | Bluff: ${shouldBluff}`);

    // No money to call - FREE PLAY
    if (callAmount === 0) {
      if (effectiveStrength >= this.config.raiseThreshold) {
        // Strong hand, raise!
        const raiseAmount = this.calculateRaiseAmount(pot, chips, effectiveStrength, currentBet);
        return { action: 'RAISE', amount: raiseAmount };
      }
      // Weak hand, just check
      return { action: 'CHECK' };
    }

    // Need to put chips in - DECISION TIME

    // Very strong hand - RAISE or CALL
    if (effectiveStrength >= this.config.raiseThreshold) {
      if (callAmount < chips * 0.5) {
        // Can afford to raise
        const raiseAmount = this.calculateRaiseAmount(pot, chips, effectiveStrength, currentBet);
        return { action: 'RAISE', amount: raiseAmount };
      }
      // Too expensive to raise, just call
      return { action: 'CALL' };
    }

    // Medium hand - Consider pot odds
    else if (effectiveStrength >= this.config.callThreshold) {
      if (potOdds < 0.4 || callAmount < chips * 0.2) {
        // Good pot odds or cheap call
        return { action: 'CALL' };
      }
      // Bad pot odds
      return { action: 'FOLD' };
    }

    // Weak hand - Consider folding unless super cheap
    else if (effectiveStrength >= this.config.foldThreshold) {
      if (potOdds < 0.2 && callAmount < chips * 0.1) {
        // Amazing pot odds and very cheap
        return { action: 'CALL' };
      }
      return { action: 'FOLD' };
    }

    // Very weak hand - FOLD
    else {
      return { action: 'FOLD' };
    }
  }

  /**
   * CUSTOMIZE THIS: Determine bet sizing
   *
   * Calculate how much to raise based on:
   * - Current pot size
   * - Your chip stack
   * - Hand strength
   * - Your aggression level
   */
  private calculateRaiseAmount(pot: number, chips: number, handStrength: number, currentBet: number): number {
    // Base bet: percentage of pot
    const baseBet = pot * 0.5;

    // Multiply by aggression and hand strength
    const aggressiveMultiplier = 1 + (this.config.aggressiveness * handStrength);
    const raiseAmount = baseBet * aggressiveMultiplier;

    // Don't bet more than 70% of our chips
    const maxBet = Math.floor(chips * 0.7);
    const totalBet = currentBet + Math.min(Math.floor(raiseAmount), maxBet);

    return totalBet;
  }

  /**
   * OPTIONAL: Implement adaptive strategy
   *
   * Adjust your strategy based on performance.
   * This gets called after each hand.
   */
  adaptStrategy(): void {
    const winRate = this.stats.totalHands > 0
      ? this.stats.wins / this.stats.totalHands
      : 0.5;

    // If losing too much, play tighter
    if (winRate < 0.3) {
      this.config.raiseThreshold = Math.min(this.config.raiseThreshold + 0.05, 0.8);
      this.config.foldThreshold = Math.min(this.config.foldThreshold + 0.05, 0.5);
      this.config.bluffProbability = Math.max(this.config.bluffProbability - 0.05, 0.05);
      console.log('  📉 Adapting: Playing tighter');
    }
    // If winning a lot, can be more aggressive
    else if (winRate > 0.7) {
      this.config.raiseThreshold = Math.max(this.config.raiseThreshold - 0.05, 0.4);
      this.config.aggressiveness = Math.min(this.config.aggressiveness + 0.1, 1.0);
      console.log('  📈 Adapting: Playing more aggressive');
    }
  }

  /**
   * Record hand result for learning
   */
  recordResult(won: boolean): void {
    this.stats.totalHands++;
    if (won) {
      this.stats.wins++;
    } else {
      this.stats.losses++;
    }

    // Optionally adapt strategy
    // Uncomment the line below to enable adaptive learning
    // this.adaptStrategy();
  }

  getStats() {
    return {
      ...this.stats,
      winRate: this.stats.totalHands > 0
        ? ((this.stats.wins / this.stats.totalHands) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

// ============================================
// Poker Agent
// ============================================

class PokerAgent {
  private server: GameServer;
  private agentName: string;
  private wallet: Wallet | HDNodeWallet;
  private strategy: StrategyEngine;
  private evaluator: HandEvaluator;
  private currentState: PublicState | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor(
    verse: string,
    agentName: string,
    wallet: Wallet | HDNodeWallet,
    auth: string
  ) {
    this.agentName = agentName;
    this.wallet = wallet;
    this.strategy = new StrategyEngine();
    this.evaluator = new HandEvaluator();
    this.server = new GameServer({
      verse,
      account: wallet.address,
      auth: auth,
    });

    console.log(`🤖 Agent: ${agentName}`);
    console.log(`   Wallet: ${wallet.address}`);
  }

  async connect(): Promise<void> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000)
    );

    try {
      const connected = await Promise.race([this.server.connect(), timeout]);
      if (connected) {
        console.log(`✅ ${this.agentName} connected to game server`);
        this.isActive = true;
      } else {
        throw new Error('Server not ready');
      }
    } catch (error) {
      console.error(`❌ Connection failed:`, error);
      throw error;
    }
  }

  async joinGame(): Promise<void> {
    const roomId = await this.server.remoteFunction('quickJoin');
    console.log(`🎮 ${this.agentName} joined room: ${roomId}`);
  }

  async updateState(): Promise<void> {
    try {
      this.currentState = await this.server.remoteFunction('getPublicState');
    } catch (e) {
      // Silent fail - just no state yet
    }
  }

  private async makeAction(type: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALL_IN', amount?: number): Promise<void> {
    try {
      await this.server.remoteFunction('action', [type, amount]);
      console.log(`  ➡️  ${type}${amount ? ` $${amount}` : ''}`);
    } catch (e: any) {
      console.error(`  ❌ Action failed: ${e.message}`);
    }
  }

  private async toggleReady(): Promise<void> {
    await this.server.remoteFunction('toggleReady');
    console.log(`  ✋ Ready`);
  }

  private async autonomousDecision(): Promise<void> {
    if (!this.currentState) return;

    const { status, players, seats, currentTurn, currentBet, pot, communityCards, myAccount } = this.currentState;

    // Only act on my turn
    if (seats[currentTurn] !== myAccount) return;

    const me = players[myAccount];
    if (!me || me.folded || me.allIn) return;

    // Can't evaluate without visible cards
    const hasHiddenCard = me.holeCards.some(card => card === '??');
    if (hasHiddenCard) {
      console.log(`  ⚠️  Can't see cards, checking/folding`);
      const callAmount = currentBet - me.bet;
      await this.makeAction(callAmount === 0 ? 'CHECK' : 'FOLD');
      return;
    }

    // Evaluate hand strength
    const handStrength = this.evaluator.evaluate(me.holeCards, communityCards);
    const callAmount = currentBet - me.bet;

    console.log(`\n💭 ${this.agentName} thinking...`);
    console.log(`  Phase: ${status} | Pot: $${pot} | To call: $${callAmount}`);
    console.log(`  Cards: ${me.holeCards.join(' ')} | Community: ${communityCards.join(' ')}`);

    // Let strategy engine decide
    const decision = this.strategy.decide(
      handStrength,
      callAmount,
      pot,
      me.chips,
      currentBet,
      status
    );

    // Execute decision
    if (decision.action === 'RAISE' && decision.amount) {
      await this.makeAction('RAISE', decision.amount);
    } else {
      await this.makeAction(decision.action);
    }
  }

  start(): void {
    console.log(`🔄 ${this.agentName} starting game loop...\n`);

    this.pollInterval = setInterval(async () => {
      await this.updateState();

      if (!this.currentState) return;

      const { status, myAccount, players, winnerInfo } = this.currentState;

      // Auto-ready in WAITING or SHOWDOWN
      if (status === 'WAITING' || status === 'SHOWDOWN') {
        // Record result if showdown
        if (status === 'SHOWDOWN' && winnerInfo) {
          const won = winnerInfo.includes(myAccount);
          this.strategy.recordResult(won);

          if (won) {
            console.log(`\n🎉 ${this.agentName} WON!`);
          } else {
            console.log(`\n😔 ${this.agentName} lost`);
          }

          const stats = this.strategy.getStats();
          console.log(`  📊 Record: ${stats.wins}W-${stats.losses}L (${stats.totalHands} hands, ${stats.winRate} win rate)`);
        }

        const me = players[myAccount];
        if (me && !me.ready) {
          await this.toggleReady();
          await this.updateState();
        }
      }

      // Make decisions during active game
      if (status !== 'WAITING' && status !== 'SHOWDOWN') {
        await this.autonomousDecision();
      }

    }, 2000); // Poll every 2 seconds
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isActive = false;
      console.log(`⏹️  ${this.agentName} stopped`);
    }
  }

  getStats() {
    return {
      name: this.agentName,
      wallet: this.wallet.address,
      strategy: this.strategy.getStats(),
      active: this.isActive
    };
  }
}

// ============================================
// Wallet & Auth Management
// ============================================

async function createAuthToken(wallet: Wallet | HDNodeWallet, verse: string): Promise<string> {
  const account = wallet.address;
  const exp = Math.floor(Date.now() / 1000) + 3600;

  const authMessage = { verse, account, sub: null, follow: false, exp };
  const msg = Buffer.from(JSON.stringify(authMessage)).toString('base64');
  const signature = await wallet.signMessage(msg);

  const authToken = { msg, signature };
  return Buffer.from(JSON.stringify(authToken)).toString('base64');
}

async function getOrCreateWallet(walletFile: string): Promise<Wallet | HDNodeWallet> {
  if (fs.existsSync(walletFile)) {
    const privateKey = fs.readFileSync(walletFile, 'utf-8').trim();
    return new Wallet(privateKey);
  } else {
    const wallet = Wallet.createRandom();
    fs.writeFileSync(walletFile, wallet.privateKey, 'utf-8');
    console.log(`💾 Created new wallet: ${wallet.address}`);
    return wallet;
  }
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
  const verse = process.env.VERSE || process.env.AGENT8_VERSE;
  const name = process.env.NAME || process.env.AGENT_NAME;

  if (!verse) {
    console.error('❌ VERSE environment variable is required');
    console.error('\nUsage:');
    console.error('  VERSE="0x..." npx tsx poker-agent.ts');
    console.error('  VERSE="0x..." NAME=my-bot npx tsx poker-agent.ts');
    process.exit(1);
  }

  const agentName = name || `poker-agent-${Math.random().toString(36).slice(2, 8)}`;
  const walletFile = path.join(process.cwd(), `.wallet-${agentName}.key`);

  console.log('\n🎰 ============================================');
  console.log('   AUTONOMOUS POKER AGENT');
  console.log('   ============================================\n');

  const wallet = await getOrCreateWallet(walletFile);
  const auth = await createAuthToken(wallet, verse);

  const agent = new PokerAgent(verse, agentName, wallet, auth);

  await agent.connect();
  await agent.joinGame();
  await agent.updateState();

  agent.start();

  console.log('\n✅ Agent is now playing! Press Ctrl+C to stop.\n');

  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down agent...');
    agent.stop();
    console.log('\nFinal Statistics:');
    console.log(JSON.stringify(agent.getStats(), null, 2));
    console.log('\n');
    process.exit(0);
  });
}

main().catch(console.error);
