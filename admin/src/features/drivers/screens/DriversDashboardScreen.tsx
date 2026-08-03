import { DriverFiltersBar } from "../components/DriverFiltersBar";
import { DriverDetailModal } from "../components/DriverDetailModal";
import { DriverListSection } from "../components/DriverListSection";
import { RejectModal } from "../components/RejectModal";
import { useAdminDrivers } from "../hooks/useAdminDrivers";
import { useDriverDetail } from "../hooks/useDriverDetail";
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
  const detail = useDriverDetail();

  const handleRejectConfirm = async () => {
    await rejectForm.submit();
    detail.refresh();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <DriverFiltersBar status={status} onStatusChange={setStatus} />

      <DriverListSection
        drivers={drivers}
        loading={loading}
        busy={busy}
        error={error}
        actionError={actionError}
        onView={detail.openFor}
        onApprove={approve}
        onReject={rejectForm.openFor}
        onSuspend={suspend}
        onReinstate={reinstate}
      />

      {detail.target && detail.detail && (
        <DriverDetailModal
          driver={detail.detail}
          loading={detail.loading}
          busy={busy}
          onClose={detail.close}
          onApprove={approve}
          onReject={rejectForm.openFor}
          onSuspend={suspend}
          onReinstate={reinstate}
          onStatusChanged={detail.refresh}
        />
      )}

      <RejectModal
        driverName={rejectForm.target ? getDriverName(rejectForm.target) : ""}
        open={rejectForm.target !== null}
        reason={rejectForm.reason}
        error={rejectForm.error}
        onReasonChange={rejectForm.setReason}
        onClose={rejectForm.close}
        onConfirm={handleRejectConfirm}
      />
    </main>
  );
}
