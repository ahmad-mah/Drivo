import type { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

/** Uppercase-labeled body section inside the driver detail modal. */
export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <>
      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500 first:mt-0">
        {title}
      </h3>
      {children}
    </>
  );
}
