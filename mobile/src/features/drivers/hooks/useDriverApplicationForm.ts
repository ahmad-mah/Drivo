import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { useDriverApplication } from "./useDriverApplication";
import { applyDriverSchema } from "../schema/driver.schema";
import type { DriverApplicationFormData } from "../types/driver.types";

export function useDriverApplicationForm() {
  const { application, loading, submitting, error, submit } =
    useDriverApplication();

  const isReapply = application?.approvalStatus === DriverApprovalStatus.REJECTED;
  const isVehicleChange =
    application?.approvalStatus === DriverApprovalStatus.APPROVED;
  const isEditing = isReapply || isVehicleChange;

  const form = useForm<DriverApplicationFormData>({
    // z.coerce makes the schema's input type differ from its output; the cast
    // aligns react-hook-form with the resolved (post-coercion) shape.
    resolver: zodResolver(applyDriverSchema) as Resolver<DriverApplicationFormData>,
    mode: "all",
    defaultValues: {
      vehicleType: undefined,
      vehicleModel: "",
      vehicleColor: "",
      seats: undefined,
      vehiclePlate: "",
      licenseNumber: "",
    },
  });

  // Prefill an existing application (rejected re-apply or approved vehicle
  // change) so drivers can edit and resubmit
  useEffect(() => {
    if (!isEditing || !application) return;
    form.reset({
      vehicleType: application.vehicleType,
      vehicleModel: application.vehicleModel,
      vehicleColor: application.vehicleColor,
      seats: application.seats ?? undefined,
      vehiclePlate: application.vehiclePlate,
      licenseNumber: application.licenseNumber,
    });
  }, [isEditing, application, form]);

  const onSubmit = async (data: DriverApplicationFormData) => submit(data);

  return {
    form,
    onSubmit,
    isReapply,
    isVehicleChange,
    isFirstTime: !isEditing,
    loading,
    submitting,
    error,
  };
}
