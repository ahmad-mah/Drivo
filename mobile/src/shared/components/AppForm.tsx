"use no memo";
import type { ReactNode } from "react";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";

type AppFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  children: ReactNode;
};

// RHF's formState proxy mutates during render and breaks React Compiler
// memoization, so all RHF state access lives inside the form layer.
export function AppForm<T extends FieldValues>({ form, children }: AppFormProps<T>) {
  return <FormProvider {...form}>{children}</FormProvider>;
}
