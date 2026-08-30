import type { AdminDriver } from "../types/driver";
import { DriverRow, type DriverRowProps } from "./DriverRow";

type DriversTableProps = Omit<DriverRowProps, "driver"> & {
  drivers: AdminDriver[];
};
export function DriversTable({ drivers, ...rowHandlers }: DriversTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-bg-primary">
      <div className="overflow-x-auto">
        <table className="w-full text-start">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-tertiary text-xs font-semibold uppercase tracking-wide text-text-muted">
              <th className="py-3 ps-6 pe-4">Applicant</th>
              <th className="py-3 pe-4">Phone</th>
              <th className="py-3 pe-4">Vehicle</th>
              <th className="py-3 pe-4">License</th>
              <th className="py-3 pe-4">Submitted</th>
              <th className="py-3 pe-4">Status</th>
              <th className="py-3 pe-6 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <DriverRow key={driver.id} driver={driver} {...rowHandlers} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}