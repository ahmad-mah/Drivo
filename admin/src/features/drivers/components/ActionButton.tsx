const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  warning: "bg-orange-500 text-white hover:bg-orange-600",
} as const;

type Variant = keyof typeof variants;

interface ActionButtonProps {
  label: string;
  variant: Variant;
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
