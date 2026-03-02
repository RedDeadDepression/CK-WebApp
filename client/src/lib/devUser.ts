export function getTelegramUserId(): string | null {
  const tg = window.Telegram?.WebApp;

  if (tg?.initDataUnsafe?.user?.id) {
    return String(tg.initDataUnsafe.user.id);
  }

  // 👉 fallback для localhost
  if (import.meta.env.DEV) {
    return "123"; // тестовый пользователь
  }

  return null;
}