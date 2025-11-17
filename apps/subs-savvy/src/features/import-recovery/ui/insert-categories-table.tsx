import { zodResolver } from "@hookform/resolvers/zod";
import { ColorInput, Table, TextInput } from "@mantine/core";
import { usePrevious } from "@mantine/hooks";
import { cn } from "cn";
import { type FC, type Ref, useEffect } from "react";
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  type CategoryModel,
  categorySchema,
} from "../../../shared/api/category.model.ts";

export const InsertCategoriesTable: FC<InsertCategoriesTableProps> = ({
  categories,
  onSubmit,
  ref,
}) => {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<InsertCategoriesTableFormValue>({
    resolver: zodResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const prevCategories = usePrevious(categories);
  useEffect(() => {
    if (categories !== prevCategories) {
      remove();
      append(categories);
    }
  }, [append, prevCategories, remove, categories]);

  const submitCategories: SubmitHandler<InsertCategoriesTableFormValue> = ({
    categories,
  }) => {
    onSubmit(categories);
  };

  const { t } = useTranslation();

  return (
    <form
      id="categoriesUpsertTableForm"
      onSubmit={handleSubmit(submitCategories)}
      ref={ref}
    >
      <Table.ScrollContainer minWidth="100%">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("name")}</Table.Th>
              <Table.Th>{t("color")}</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {fields.map((field, index) => (
              <Table.Tr key={field.id}>
                <Table.Td className={cn("min-w-40")}>
                  <TextInput
                    {...register(`categories.${index}.name`)}
                    placeholder={t("name")}
                    autoComplete="off"
                    error={errors.categories?.[index]?.name?.message}
                  />
                </Table.Td>

                <Table.Td className={cn("min-w-40")}>
                  <Controller
                    control={control}
                    name={`categories.${index}.color`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <ColorInput
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={t("color")}
                        error={errors.categories?.[index]?.color?.message}
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
};

export interface InsertCategoriesTableProps {
  categories: Array<CategoryModel>;
  onSubmit(subscriptions: Array<CategoryModel>): void;
  ref: Ref<HTMLFormElement>;
}

export interface InsertCategoriesTableFormValue {
  categories: Array<CategoryModel>;
}

const schema = z.object({
  categories: z.array(categorySchema),
});
