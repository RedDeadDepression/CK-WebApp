import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
    interface Window {
        Telegram?: any;
    }
}

/**
 * 🔥 ГЛОБАЛЬНЫЙ ЛОВЕЦ ОШИБОК (очень важно для Telegram)
 */
window.onerror = function (message, source, lineno, colno, error) {
    console.error("GLOBAL ERROR:", message, error);
};

const tg = window.Telegram?.WebApp;

if (tg) {
    try {
        tg.ready();
        tg.expand();

        console.log("Telegram WebApp detected");
        console.log("INIT DATA:", tg.initDataUnsafe);

        /**
         * 🔥 ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА
         */
        if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
            console.warn("⚠️ No user in initDataUnsafe");
        }

    } catch (e) {
        console.error("TG INIT ERROR:", e);
    }
} else {
    console.log("Running outside Telegram — using DEV mock");

    const params = new URLSearchParams(window.location.search);
    const devUserId = params.get("telegram_user_id") || "123";

    window.Telegram = {
        WebApp: {
            ready: () => {},
            expand: () => {},
            initDataUnsafe: {
                user: {
                    id: devUserId,
                    first_name: "Dev",
                    username: "local_user"
                }
            }
        }
    };
}

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root element not found");
}

console.log("🚀 App rendering...");

createRoot(root).render(<App />);