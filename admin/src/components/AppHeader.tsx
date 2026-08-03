import { Show, UserButton } from "@clerk/react";

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Drivo Admin</h1>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
