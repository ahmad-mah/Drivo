interface RejectModalProps {
  driverName: string;
  open: boolean;
  reason: string;
  error: string | null;
  submitting?: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RejectModal({
  driverName,
  open,
  reason,
  error,
  submitting,
  onReasonChange,
  onClose,
  onConfirm,
}: RejectModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Reject ${driverName}'s application`}
    >
      <div className="w-full max-w-md rounded-2xl bg-bg-primary p-6 shadow-xl">
        <h2 className="text-lg font-bold text-text-primary">Reject application</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Rejecting <span className="font-medium text-text-primary">{driverName}</span>'s
          application. The driver will be able to re-apply with corrections.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-text-secondary">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
            placeholder="e.g. License number could not be verified"
            className="mt-1 w-full rounded-lg border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-tertiary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-status-danger px-4 py-2 text-sm font-medium text-white hover:bg-status-danger/90 disabled:opacity-50"
          >
            {submitting ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}