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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">Reject application</h2>
        <p className="mt-1 text-sm text-gray-500">
          Rejecting <span className="font-medium text-gray-700">{driverName}</span>'s
          application. The driver will be able to re-apply with corrections.
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-gray-700">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
            placeholder="e.g. License number could not be verified"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
