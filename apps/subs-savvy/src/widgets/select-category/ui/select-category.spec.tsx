import { MantineProvider } from "@mantine/core";
import { type RenderResult, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectCategorySpy } from "../../../entities/category/model/__mocks__/categories.store.tsx";
import { categoryMock } from "../../../shared/api/__mocks__/category.model.ts";
import type { CategoryModel } from "../../../shared/api/category.model.ts";
import { SelectCategory } from "./select-category.tsx";

vi.mock(import("../../../entities/category/model/categories.store.tsx"));

describe("SelectCategory", () => {
  let screen: RenderResult;

  beforeEach(() => {
    screen = render(<SelectCategory />, {
      wrapper: ({ children }) => {
        return <MantineProvider>{children}</MantineProvider>;
      },
    });
  });

  it("should call selectCategory and close combobox on category selected", () => {
    const categoryToSelect = { ...categoryMock } satisfies CategoryModel;

    fireEvent.click(screen.getByLabelText("select-category"));
    fireEvent.click(
      screen.getByRole("option", { name: categoryToSelect.name }),
    );

    expect(selectCategorySpy).toBeCalledWith(`${categoryToSelect.id}`);
    expect(
      screen.queryByRole("option", { name: categoryToSelect.name }),
    ).not.toBeInTheDocument();
  });
});
