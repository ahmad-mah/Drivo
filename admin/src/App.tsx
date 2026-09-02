import { Show } from "@clerk/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedOutScreen } from "./components/SignedOutScreen";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AuthBridge } from "./lib/AuthBridge";
import { DriversDashboardScreen } from "./features/drivers/screens/DriversDashboardScreen";
import { OverviewPlaceholder } from "./features/overview/screens/OverviewPlaceholder";
import { TripsPlaceholder } from "./features/trips/screens/TripsPlaceholder";
import { UsersPlaceholder } from "./features/users/screens/UsersPlaceholder";
import { StatisticsPlaceholder } from "./features/stats/screens/StatisticsPlaceholder";
import { PaymentsPlaceholder } from "./features/payments/screens/PaymentsPlaceholder";
import { SupportPlaceholder } from "./features/support/screens/SupportPlaceholder";
import { SettingsPlaceholder } from "./features/settings/screens/SettingsPlaceholder";
import { AuditPlaceholder } from "./features/audit/screens/AuditPlaceholder";
import { LocaleProvider } from "./contexts/LocaleContext.tsx";

export default function App() {
  return (
    <AuthBridge>
      <BrowserRouter>
        <Routes>
          {/* Public landing + sign-in page — no auth required */}
          <Route path="/" element={<SignedOutScreen />} />

          {/* Admin panel — auth required */}
          <Route
            path="/:locale/admin"
            element={
              <Show when="signed-in" fallback={<SignedOutScreen />}>
                <LocaleProvider>
                  <AdminLayout />
                </LocaleProvider>
              </Show>
            }
          >
            <Route index element={<OverviewPlaceholder />} />
            <Route path="trips" element={<TripsPlaceholder />} />
            <Route path="drivers" element={<DriversDashboardScreen />} />
            <Route path="users" element={<UsersPlaceholder />} />
            <Route path="statistics" element={<StatisticsPlaceholder />} />
            <Route path="payments" element={<PaymentsPlaceholder />} />
            <Route path="support" element={<SupportPlaceholder />} />
            <Route path="settings" element={<SettingsPlaceholder />} />
            <Route path="audit" element={<AuditPlaceholder />} />
          </Route>

          {/* Redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthBridge>
  );
}
