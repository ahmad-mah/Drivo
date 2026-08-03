import { DRIVER_STATUS_FILTERS } from "../constants/driverStatusFilters";
import type { DriverApprovalStatus as Status } from "../types/driver";

interface DriverFiltersBarProps {
  status: Status | undefined;
  onStatusChange: (status: Status | undefined) => void;
}

export function DriverFiltersBar({
  status,
  onStatusChange,
}: DriverFiltersBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Driver Applications
        </h2>
        <p className="text-sm text-gray-500">
          Review and manage driver onboarding requests.
        </p>
      </div>
      <nav className="flex gap-2" aria-label="Filter by status">
        {DRIVER_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => onStatusChange(filter.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              status === filter.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
