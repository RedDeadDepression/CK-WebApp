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
    console.log("Running outside Telegram");
}

const root = document.getElementById("root")

if (!root) {
    throw new Error("Root element not found");
}

createRoot(root).render(<App />);