import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  type ComboboxData,
  Fieldset,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { cn } from "cn";
import { memo, useMemo } from "react";
import { Controller, type DefaultValues, useForm } from "react-hook-form";
import { subscriptionCyclePeriodsComboboxData } from "../../../shared/api/subscription-cycle-period.model.ts";
import { subscriptionIconsComboboxData } from "../../../shared/api/subscription-icon.model.ts";
import {
  type UpsertSubscriptionModel,
  insertSubscriptionSchema,
  updateSubscriptionSchema,
} from "../../../shared/api/subscription.model.ts";
import {
  useCategories,
  useStore,
  useUpsertSubscription,
} from "../../../shared/store/hooks.ts";
import { createDatePickerInputAriaLabels } from "../../../shared/ui/create-date-picker-input-aria-labels.ts";

export const UpsertSubscription = memo(() => {
  const state = useUpsertSubscription();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpsertSubscriptionModel>({
    resolver: zodResolver(
      state.upsertSubscriptionMode === "update"
        ? updateSubscriptionSchema
        : insertSubscriptionSchema,
    ),
    defaultValues:
      state.upsertSubscriptionMode === "update"
        ? state.subscriptionToUpsert
        : defaultValues,
  });

  const categories = useCategories();
  const categoriesData: ComboboxData = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: `${category.id}`,
    }));
  }, [categories]);

  return (
    <form
      onSubmit={handleSubmit(useStore.getState().upsertSubscription)}
      className={cn("flex flex-1 flex-col gap-2 self-stretch")}
    >
      <TextInput
        {...register("name")}
        label="Name"
        placeholder="Name"
        autoComplete="off"
        error={errors.name?.message}
      />

      <Textarea
        {...register("description")}
        label="Description"
        placeholder="Description"
        error={errors.description?.message}
      />

      <Controller
        control={control}
        name="icon"
        render={({ field: { value, onChange, onBlur } }) => (
          <Select
            value={value}
            onChange={(_, option) => option && onChange(option.value)}
            onBlur={onBlur}
            label="Icon"
            placeholder="Icon"
            data={subscriptionIconsComboboxData}
            error={errors.icon?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, onBlur, value } }) => (
          <NumberInput
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            label="Price"
            placeholder="Price"
            error={errors.price?.message}
          />
        )}
      />

      <Fieldset
        legend="Active Period"
        className={cn("grid grid-cols-2 gap-2")}
      >
        <Controller
          control={control}
          name="startedAt"
          render={({ field: { onChange, onBlur, value } }) => (
            <DatePickerInput
              label="Started At"
              ariaLabels={createDatePickerInputAriaLabels("started at")}
              placeholder="Started At"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.startedAt?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="endedAt"
          render={({ field: { onChange, onBlur, value } }) => (
            <DatePickerInput
              label="Ended At"
              ariaLabels={createDatePickerInputAriaLabels("ended at")}
              placeholder="Ended At"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.endedAt?.message}
            />
          )}
        />
      </Fieldset>

      <Fieldset
        legend="Billing Cycle"
        className={cn("grid grid-cols-2 gap-2")}
      >
        <Controller
          control={control}
          name="cycle.each"
          render={({ field: { onChange, onBlur, value } }) => (
            <NumberInput
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              label="Each"
              placeholder="Each"
              error={errors.cycle?.each?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="cycle.period"
          render={({ field: { value, onChange, onBlur } }) => (
            <Select
              value={value}
              onChange={(_, option) => option && onChange(option.value)}
              onBlur={onBlur}
              label="Period"
              placeholder="Period"
              data={subscriptionCyclePeriodsComboboxData}
              error={errors.cycle?.period?.message}
            />
          )}
        />
      </Fieldset>

      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange, onBlur } }) => (
          <Select
            label="Category"
            placeholder="Category"
            data={categoriesData}
            value={`${value?.id}`}
            onChange={(categoryId) =>
              onChange(
                categories.find((category) => `${category.id}` === categoryId),
              )
            }
            onBlur={onBlur}
            error={errors.category?.message}
          />
        )}
      />

      <div className={cn("flex-1")} />

      <div className={cn("flex justify-end gap-2")}>
        <Button type="submit">
          {state.upsertSubscriptionMode === "update" ? "Update" : "Insert"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={useStore.getState().closeUpsertSubscription}
        >
          Close
        </Button>
        {state.upsertSubscriptionMode === "update" && (
          <Button
            type="button"
            color="red"
            variant="outline"
            onClick={useStore.getState().deleteSubscription}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
});

const defaultValues: DefaultValues<UpsertSubscriptionModel> = {
  startedAt: new Date(),
  cycle: {
    each: 1,
    period: "monthly",
  },
};
