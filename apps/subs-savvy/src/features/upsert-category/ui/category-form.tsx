import { zodResolver } from "@hookform/resolvers/zod";
import { ColorInput, TextInput } from "@mantine/core";
import { cn } from "cn";
import type { FC, Ref } from "react";
import { Controller, type DefaultValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  insertCategorySchema,
  type UpsertCategoryModel,
  updateCategorySchema,
} from "../../../shared/api/category.model.ts";
import { useStore, useUpsertCategory } from "../../../shared/store/hooks.ts";

export const CategoryForm: FC<CategoryFormProps> = ({ ref }) => {
  const state = useUpsertCategory();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpsertCategoryModel>({
    resolver: zodResolver(
      state.upsertCategoryMode === "update"
        ? updateCategorySchema
        : insertCategorySchema,
    ),
    defaultValues:
      state.upsertCategoryMode === "update"
        ? state.categoryToUpsert
        : defaultValues,
  });

  const { t } = useTranslation();

  return (
    <form
      id="categoryForm"
      ref={ref}
      onSubmit={handleSubmit(useStore.getState().upsertCategory)}
      className={cn("flex flex-col gap-2 self-stretch")}
    >
      <TextInput
        {...register("name")}
        label={t("name")}
        placeholder={t("name")}
        type="text"
        autoComplete="off"
        error={errors.name?.message}
      />

      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, onBlur, value } }) => (
          <ColorInput
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            label={t("color")}
            placeholder={t("color")}
            error={errors.color?.message}
          />
        )}
      />
    </form>
  );
};

export interface CategoryFormProps {
  ref: Ref<HTMLFormElement>;
}

const defaultValues: DefaultValues<UpsertCategoryModel> = {};
