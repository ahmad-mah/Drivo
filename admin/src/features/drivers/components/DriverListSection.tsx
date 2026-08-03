import type { AdminDriver } from "../types/driver";
import { DriversTable } from "./DriversTable";

interface DriverListSectionProps {
  drivers: AdminDriver[];
  loading: boolean;
  busy: boolean;
  error: string | null;
  actionError: string | null;
  onView: (driver: AdminDriver) => void;
  onApprove: (id: string) => void;
  onReject: (driver: AdminDriver) => void;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
}

export function DriverListSection({
  drivers,
  loading,
  busy,
  error,
  actionError,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReinstate,
}: DriverListSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      {actionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading applications…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          {error}
        </div>
      ) : drivers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No driver applications found.
        </div>
      ) : (
        <div className="relative">
          <DriversTable
            drivers={drivers}
            disabled={busy}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onReinstate={onReinstate}
          />
          {busy && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60"
              aria-busy="true"
            >
              <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg ring-1 ring-gray-200">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Updating…
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
