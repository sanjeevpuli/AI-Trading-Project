import type { Portfolio, Trade, Position } from '@/lib/types/trading';

/**
 * Synchronize portfolio updates to the database via API route.
 * Never imports Prisma — safe for browser/Zustand usage.
 */
export async function syncPortfolio(portfolio: Portfolio) {
  try {
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portfolio),
    });
  } catch (error) {
    console.error('Failed to sync portfolio:', error);
  }
}

/**
 * Persist a new trade record via API route.
 */
export async function syncTrade(trade: Trade) {
  try {
    await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trade),
    });
  } catch (error) {
    console.error('Failed to sync trade:', error);
  }
}

/**
 * Synchronize a position (open or updated) via API route.
 */
export async function syncPosition(position: Position) {
  try {
    await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(position),
    });
  } catch (error) {
    console.error('Failed to sync position:', error);
  }
}

/**
 * Delete a position (when closed) via API route.
 */
export async function deletePosition(id: string) {
  try {
    await fetch(`/api/positions?id=${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete position:', error);
  }
}
