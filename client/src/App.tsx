import { Switch, Route } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SosFlow from "@/pages/SosFlow";

declare global {
  interface Window {
    Telegram?: any;
  }
}

function DevRouterGuard() {
  const [, setLocation] = useLocation();

  const tg = window.Telegram?.WebApp;
  const startParam = tg?.initDataUnsafe?.start_param;

  // если нет Telegram → читаем из URL
  if (!tg) {
    const params = new URLSearchParams(window.location.search);
    const devRoute = params.get("route");

    if (devRoute === "sos") {
      setLocation("/sos");
    }
  }

  // если Telegram есть → используем start_param
  if (startParam === "sos") {
    setLocation("/sos");
  }

  return null;
}

function Router() {
  return (
    <>
      <DevRouterGuard />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sos" component={SosFlow} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;