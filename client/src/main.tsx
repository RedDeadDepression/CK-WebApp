import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
    interface Window {
        Telegram?: any;
    }
}

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    console.log("Telegram WebApp detected", tg.initDataUnsafe);
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

createRoot(root).render(<App />);