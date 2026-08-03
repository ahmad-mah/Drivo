import { DriverFiltersBar } from "../components/DriverFiltersBar";
import { DriverListSection } from "../components/DriverListSection";
import { RejectModal } from "../components/RejectModal";
import { useAdminDrivers } from "../hooks/useAdminDrivers";
import { useRejectForm } from "../hooks/useRejectForm";
import { getDriverName } from "../utils/driver";

export function DriversDashboardScreen() {
  const {
    drivers,
    loading,
    error,
    actionError,
    busy,
    status,
    setStatus,
    approve,
    reject,
    suspend,
    reinstate,
  } = useAdminDrivers();

  const rejectForm = useRejectForm(reject);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <DriverFiltersBar status={status} onStatusChange={setStatus} />

      <DriverListSection
        drivers={drivers}
        loading={loading}
        busy={busy}
        error={error}
        actionError={actionError}
        onApprove={approve}
        onReject={rejectForm.openFor}
        onSuspend={suspend}
        onReinstate={reinstate}
      />

      <RejectModal
        driverName={rejectForm.target ? getDriverName(rejectForm.target) : ""}
        open={rejectForm.target !== null}
        reason={rejectForm.reason}
        error={rejectForm.error}
        onReasonChange={rejectForm.setReason}
        onClose={rejectForm.close}
        onConfirm={rejectForm.submit}
      />
    </main>
  );
}
