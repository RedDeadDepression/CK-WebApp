/**
 * Check if Telegram WebApp is available
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Telegram?.WebApp;
}

/**
 * Get the Telegram WebApp instance
 */
export function getTelegramWebApp(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

/**
 * Send data to the Telegram bot
 */
export function sendDataToTelegram(data: Record<string, any>): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.warn('Telegram WebApp not available');
    return;
  }

  try {
    webApp.sendData(JSON.stringify(data));
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
  }
}

/**
 * Close the Telegram WebApp
 */
export function closeTelegramWebApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.warn('Telegram WebApp not available');
    return;
  }

  try {
    webApp.close();
  } catch (error) {
    console.error('Error closing Telegram WebApp:', error);
  }
}

/**
 * Send win data and close the app
 */
export function sendWinAndClose(practiceId: string): void {
  sendDataToTelegram({
    action: 'win_recorded',
    practice_id: practiceId,
  });
  closeTelegramWebApp();
}

/**
 * Get Telegram user ID from WebApp
 */
export function getTelegramUserId(): string | null {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return null;
  }

  try {
    const initData = webApp.initDataUnsafe;
    return initData?.user?.id?.toString() || null;
  } catch (error) {
    console.error('Error getting Telegram user ID:', error);
    return null;
  }
}