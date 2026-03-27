export function getTelegramUserId(): string | null {
  const tg = window.Telegram?.WebApp;

  const id = tg?.initDataUnsafe?.user?.id;

  if (id) {
    return String(id);
  }

  console.warn("⚠️ Telegram user not ready, using fallback");

  // 🔥 fallback ВСЕГДА (даже в production)
  return "123";
}