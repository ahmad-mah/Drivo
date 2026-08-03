import { Show } from "@clerk/react";
import { AppHeader } from "./components/AppHeader";
import { SignedOutScreen } from "./components/SignedOutScreen";
import { DriversDashboardScreen } from "./features/drivers/screens/DriversDashboardScreen";
import { AuthBridge } from "./lib/AuthBridge";

export default function App() {
  return (
    <AuthBridge>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <Show when="signed-in" fallback={<SignedOutScreen />}>
          <DriversDashboardScreen />
        </Show>
      </div>
    </AuthBridge>
  );
}
