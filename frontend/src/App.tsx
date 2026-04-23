import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";

import AuthPage from "./pages/AuthPage";
import CallPage from "./pages/CallPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage.tsx";
import { CommandPalette } from "./components/CommandPalette";

import * as Sentry from "@sentry/react";

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <CommandPalette>
      <SentryRoutes>
        <Route path="/" element={isSignedIn ? <HomePage /> : <Navigate to={"/auth"} replace />} />
        <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />} />

        <Route
          path="/call/:id"
          element={isSignedIn ? <CallPage /> : <Navigate to={"/auth"} replace />}
        />

        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/auth"} replace />}
        />

        <Route
          path="*"
          element={isSignedIn ? <Navigate to={"/"} replace /> : <Navigate to={"/auth"} replace />}
        />
      </SentryRoutes>
    </CommandPalette>
  );
};

export default App;
