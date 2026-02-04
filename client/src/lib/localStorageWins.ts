const STORAGE_KEY = 'sos_total_wins';

/**
 * Get the total wins count from LocalStorage
 */
export function getLocalStorageWins(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return 0;
    const count = parseInt(stored, 10);
    return isNaN(count) ? 0 : count;
  } catch (error) {
    console.error('Error reading wins from LocalStorage:', error);
    return 0;
  }
}

/**
 * Increment the wins count in LocalStorage
 */
export function incrementLocalStorageWins(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const current = getLocalStorageWins();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error writing wins to LocalStorage:', error);
    return getLocalStorageWins();
  }
}

/**
 * Set the wins count in LocalStorage (for syncing)
 */
export function setLocalStorageWins(count: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, count.toString());
  } catch (error) {
    console.error('Error setting wins in LocalStorage:', error);
  }
}

