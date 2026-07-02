import { useEffect } from "react";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";

export function useErrorSnackbar(error: string | null) {
  const { show } = useSnackbar();

  useEffect(() => {
    if (!error) return;
    show(error);
  }, [error, show]);
}
