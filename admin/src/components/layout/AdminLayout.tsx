import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout() {
  return (
    <div className="relative flex h-screen overflow-hidden bg-bg-primary">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-24 h-125 w-150 rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-24 h-100 w-125 rounded-full bg-[radial-gradient(ellipse,rgba(56,189,248,0.07)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(56,189,248,0.05)_0%,transparent_70%)]" />
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="custom-scrollbar flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}