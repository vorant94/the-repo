import { useCategories } from "@/entities/category/model/categories.store.tsx";
import type { CategoryModel } from "@/shared/api/category.model.ts";
import { subscriptionCyclePeriodsComboboxData } from "@/shared/api/subscription-cycle-period.model.ts";
import { subscriptionIconsComboboxData } from "@/shared/api/subscription-icon.model.ts";
import {
  type InsertSubscriptionModel,
  insertSubscriptionSchema,
} from "@/shared/api/subscription.model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ComboboxData,
  NumberInput,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { usePrevious } from "@mantine/hooks";
import { cn } from "cn";
import { forwardRef, memo, useEffect, useMemo } from "react";
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const InsertSubscriptionsTable = memo(
  forwardRef<HTMLFormElement, InsertSubscriptionsTableProps>(
    ({ subscriptions, categories: categoriesFromProps, onSubmit }, ref) => {
      const {
        handleSubmit,
        control,
        register,
        formState: { errors },
      } = useForm<InsertSubscriptionsTableFormValue>({
        resolver: zodResolver(schema),
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: "subscriptions",
      });

      const prevSubscriptions = usePrevious(subscriptions);
      useEffect(() => {
        if (subscriptions !== prevSubscriptions) {
          remove();
          append(subscriptions);
        }
      }, [append, prevSubscriptions, remove, subscriptions]);

      const categoriesFromDb = useCategories();
      const categories = useMemo(
        () => categoriesFromProps ?? categoriesFromDb,
        [categoriesFromProps, categoriesFromDb],
      );

      const categoriesData: ComboboxData = useMemo(() => {
        return categories.map((category) => ({
          label: category.name,
          value: `${category.id}`,
        }));
      }, [categories]);

      const submitSubscriptions: SubmitHandler<
        InsertSubscriptionsTableFormValue
      > = ({ subscriptions }) => {
        onSubmit(subscriptions);
      };

      const { t } = useTranslation();

      return (
        <form
          id="subscriptionsUpsertTableForm"
          onSubmit={handleSubmit(submitSubscriptions)}
          ref={ref}
        >
          <Table.ScrollContainer minWidth="100%">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("name")}</Table.Th>
                  <Table.Th>{t("description")}</Table.Th>
                  <Table.Th>{t("icon")}</Table.Th>
                  <Table.Th>{t("price")}</Table.Th>
                  <Table.Th>{t("started-at")}</Table.Th>
                  <Table.Th>{t("ended-at")}</Table.Th>
                  <Table.Th>{t("each")}</Table.Th>
                  <Table.Th>{t("period")}</Table.Th>
                  <Table.Th>{t("category")}</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {fields.map((field, index) => (
                  <Table.Tr key={field.id}>
                    <Table.Td className={cn("min-w-40")}>
                      <TextInput
                        {...register(`subscriptions.${index}.name`)}
                        placeholder={t("name")}
                        autoComplete="off"
                        error={errors.subscriptions?.[index]?.name?.message}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <TextInput
                        {...register(`subscriptions.${index}.description`)}
                        placeholder={t("description")}
                        error={
                          errors.subscriptions?.[index]?.description?.message
                        }
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.icon`}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            value={value}
                            onChange={(_, option) => onChange(option.value)}
                            onBlur={onBlur}
                            placeholder={t("icon")}
                            data={subscriptionIconsComboboxData}
                            error={errors.subscriptions?.[index]?.icon?.message}
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.price`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <NumberInput
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            placeholder={t("price")}
                            error={
                              errors.subscriptions?.[index]?.price?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.startedAt`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <DatePickerInput
                            className={cn("text-nowrap")}
                            placeholder={t("started-at")}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={
                              errors.subscriptions?.[index]?.startedAt?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40 overflow-hidden")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.endedAt`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <DatePickerInput
                            className={cn("text-nowrap")}
                            placeholder={t("ended-at")}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={
                              errors.subscriptions?.[index]?.endedAt?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.cycle.each`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <NumberInput
                            value={value}
                            onBlur={onBlur}
                            onChange={onChange}
                            placeholder={t("each")}
                            error={
                              errors.subscriptions?.[index]?.cycle?.each
                                ?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.cycle.period`}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            value={value}
                            onChange={(_, option) => onChange(option.value)}
                            onBlur={onBlur}
                            placeholder={t("period")}
                            data={subscriptionCyclePeriodsComboboxData}
                            error={
                              errors.subscriptions?.[index]?.cycle?.period
                                ?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>

                    <Table.Td className={cn("min-w-40")}>
                      <Controller
                        control={control}
                        name={`subscriptions.${index}.category`}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Select
                            placeholder={t("category")}
                            data={categoriesData}
                            value={`${value?.id}`}
                            onChange={(categoryId) =>
                              onChange(
                                categories.find(
                                  (category) => `${category.id}` === categoryId,
                                ),
                              )
                            }
                            onBlur={onBlur}
                            error={
                              errors.subscriptions?.[index]?.category?.message
                            }
                          />
                        )}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </form>
      );
    },
  ),
);

export interface InsertSubscriptionsTableProps {
  subscriptions: Array<InsertSubscriptionModel>;
  categories?: Array<CategoryModel>;
  onSubmit(subscriptions: Array<InsertSubscriptionModel>): void;
}

export interface InsertSubscriptionsTableFormValue {
  subscriptions: Array<InsertSubscriptionModel>;
}

const schema = z.object({
  subscriptions: z.array(insertSubscriptionSchema),
});
