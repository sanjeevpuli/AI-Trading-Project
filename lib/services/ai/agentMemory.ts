import { ConsolidatedDecision } from "../agentCoordinator";
import { Trade } from "../../types/trading";

export interface MemoryEntry {
  id: string;
  timestamp: number;
  type: "DECISION" | "TRADE" | "REJECTION";
  payload: any;
}

class AgentMemoryService {
  private memory: MemoryEntry[] = [];
  private static MAX_MEMORY = 500;

  public addDecision(decision: ConsolidatedDecision) {
    this.push({
      id: `DEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type: "DECISION",
      payload: decision,
    });
  }

  public recordTrade(trade: Trade) {
    this.push({
      id: `TRD-${trade.id}`,
      timestamp: Date.now(),
      type: "TRADE",
      payload: trade,
    });
  }

  public recordRejection(reason: string, decision: ConsolidatedDecision) {
    this.push({
      id: `REJ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type: "REJECTION",
      payload: { reason, decision },
    });
  }

  public getRecentMemories(limit: number = 50): MemoryEntry[] {
    return [...this.memory].slice(0, limit);
  }

  public getRecentTrades(limit: number = 10): Trade[] {
    return this.memory
      .filter((m) => m.type === "TRADE")
      .map((m) => m.payload as Trade)
      .slice(0, limit);
  }

  private push(entry: MemoryEntry) {
    this.memory.unshift(entry);
    if (this.memory.length > AgentMemoryService.MAX_MEMORY) {
      this.memory = this.memory.slice(0, AgentMemoryService.MAX_MEMORY);
    }
  }
}

export const agentMemory = new AgentMemoryService();
