import { zodResolver } from "@hookform/resolvers/zod";
import { ColorInput, TextInput } from "@mantine/core";
import { forwardRef, memo } from "react";
import { Controller, type DefaultValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  type UpsertCategoryModel,
  insertCategorySchema,
  updateCategorySchema,
} from "../../../shared/api/category.model.ts";
import { cn } from "../../../shared/ui/cn.ts";
import {
  useUpsertCategory,
  useUpsertCategoryActions,
} from "../model/upsert-category.store.tsx";

export const CategoryForm = memo(
  forwardRef<HTMLFormElement>((_, ref) => {
    const state = useUpsertCategory();
    const actions = useUpsertCategoryActions();

    const {
      register,
      handleSubmit,
      control,
      formState: { errors },
    } = useForm<UpsertCategoryModel>({
      resolver: zodResolver(
        state.mode === "update" ? updateCategorySchema : insertCategorySchema,
      ),
      defaultValues: state.mode === "update" ? state.category : defaultValues,
    });

    const { t } = useTranslation();

    return (
      <form
        id="categoryForm"
        ref={ref}
        onSubmit={handleSubmit(actions.upsert)}
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
  }),
);

const defaultValues: DefaultValues<UpsertCategoryModel> = {};
