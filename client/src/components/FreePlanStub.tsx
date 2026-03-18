import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { SmartTimer } from "./SmartTimer";

export function FreePlanStub() {
  const handleBuyClick = async () => {
  try {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.error("Telegram WebApp not found");
      return;
    }

    const userId = tg.initDataUnsafe?.user?.id;

    if (!userId) {
      console.error("No Telegram user");
      return;
    }

    console.log("Buying VIP...");

    const res = await fetch("http://127.0.0.1:8000/create-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId
      })
    });

    const data = await res.json();

    console.log("Invoice link:", data.invoice_link);

    if (data.invoice_link) {
      tg.openInvoice(data.invoice_link);
    } else {
      console.error("No invoice link:", data);
    }

  } catch (err) {
    console.error("Payment error:", err);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      // Изменено: pt-12 (вместо 20), pb-8, и добавили flex-grow для правильного скролла
      className="min-h-screen w-full bg-background flex flex-col items-center px-6 pt-12 pb-8 overflow-y-auto"
    >
      {/* Изменено: space-y-4 (вместо 10) — это сильно сожмет вертикальные дыры */}
      <div className="max-w-md w-full space-y-4 flex flex-col">

        {/* Заголовки: стали меньше */}
        <div className="text-center space-y-1 mt-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Breathing Practice
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Just Breathe
          </p>
        </div>

        {/* Таймер: уменьшен padding p-4 */}
        <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl">
          <SmartTimer text="1 minute" />
        </div>

        {/* Секция оплаты: более плотная верстка */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Unlock All Strategies
              </h2>
            </div>

            <p className="text-foreground/90 leading-snug text-xs">
              Get access to all 20 personalized strategies designed to help you overcome cravings.
            </p>

            {/* Особенности: уменьшен межстрочный интервал space-y-1.5 */}
            <ul className="space-y-1.5">
              {[
                "20 personalized strategies",
                "Available anytime, anywhere",
                "Advanced filtering",
                "Track your progress",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-foreground/80 text-[13px]">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Кнопка: чуть компактнее mt-2 */}
            <button
              onClick={handleBuyClick}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-2"
            >
              <Sparkles className="w-4 h-4" />
              Buy with Telegram Stars
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}