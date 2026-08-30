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
import { PromosPlaceholder } from "./features/promos/screens/PromosPlaceholder";
import { SettingsPlaceholder } from "./features/settings/screens/SettingsPlaceholder";
import { AuditPlaceholder } from "./features/audit/screens/AuditPlaceholder";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/utils/direction";
import { LocaleProvider } from "./contexts/LocaleContext.tsx";

export default function App() {
  return (
    <AuthBridge>
      <Show when="signed-in" fallback={<SignedOutScreen />}>
        <BrowserRouter>
          <LocaleProvider>
            <Routes>
              {SUPPORTED_LOCALES.map((locale) => (
                <Route key={locale} path={`/${locale}`}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<OverviewPlaceholder />} />
                    <Route path="trips" element={<TripsPlaceholder />} />
                    <Route path="drivers" element={<DriversDashboardScreen />} />
                    <Route path="users" element={<UsersPlaceholder />} />
                    <Route path="statistics" element={<StatisticsPlaceholder />} />
                    <Route path="payments" element={<PaymentsPlaceholder />} />
                    <Route path="support" element={<SupportPlaceholder />} />
                    <Route path="promos" element={<PromosPlaceholder />} />
                    <Route path="settings" element={<SettingsPlaceholder />} />
                    <Route path="audit" element={<AuditPlaceholder />} />
                  </Route>
                  <Route index element={<Navigate to={`/${locale}/admin`} replace />} />
                </Route>
              ))}
              <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}/admin`} replace />} />
            </Routes>
          </LocaleProvider>
        </BrowserRouter>
      </Show>
    </AuthBridge>
  );
}