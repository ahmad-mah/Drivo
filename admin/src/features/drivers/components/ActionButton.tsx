const variants = {
  primary: "bg-status-info text-white hover:bg-status-info/90",
  danger: "bg-status-danger text-white hover:bg-status-danger/90",
  outline: "bg-bg-glass text-text-primary border border-border-default hover:bg-bg-tertiary",
  warning: "bg-status-warning text-white hover:bg-status-warning/90",
} as const;

export type ActionButtonVariant = keyof typeof variants;

interface ActionButtonProps {
  label: string;
  variant: ActionButtonVariant;
  onClick: () => void;
  disabled?: boolean;
}

export function ActionButton({ label, variant, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${variants[variant]} ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {label}
    </button>
  );
}