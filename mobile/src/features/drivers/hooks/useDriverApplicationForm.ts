import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { useDriverApplication } from "./useDriverApplication";
import { applyDriverSchema } from "../schema/driver.schema";
import type { DriverApplicationFormData } from "../types/driver.types";

export function useDriverApplicationForm() {
  const { application, loading, submitting, error, submit } =
    useDriverApplication();

  const isReapply = application?.approvalStatus === DriverApprovalStatus.REJECTED;

  const form = useForm<DriverApplicationFormData>({
    resolver: zodResolver(applyDriverSchema),
    mode: "all",
    defaultValues: {
      vehicleType: undefined,
      vehicleModel: "",
      vehicleColor: "",
      vehiclePlate: "",
      licenseNumber: "",
    },
  });

  // Prefill the existing REJECTED application so drivers can edit and resubmit
  useEffect(() => {
    if (!isReapply || !application) return;
    form.reset({
      vehicleType: application.vehicleType,
      vehicleModel: application.vehicleModel,
      vehicleColor: application.vehicleColor,
      vehiclePlate: application.vehiclePlate,
      licenseNumber: application.licenseNumber,
    });
  }, [isReapply, application, form]);

  const onSubmit = async (data: DriverApplicationFormData) => submit(data);

  return { form, onSubmit, isReapply, loading, submitting, error };
}
