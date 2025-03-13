import { useSubscriptions } from "@/entities/subscription/model/subscriptions.store.tsx";
import {
  monthlySubscription,
  yearlySubscription,
} from "@/shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import { MantineProvider } from "@mantine/core";
import {
  type RenderResult,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { SubscriptionList } from "./subscription-list.tsx";

vi.mock(import("@/entities/subscription/model/subscriptions.store.tsx"));
vi.mock(import("@/features/list-subscriptions/ui/subscription-grid.tsx"));
vi.mock(import("@/features/list-subscriptions/ui/subscription-grid-item.tsx"));

describe("SubscriptionList", () => {
  let screen: RenderResult;

  beforeEach(() => {
    screen = render(<SubscriptionList />, {
      wrapper: ({ children }) => {
        return <MantineProvider>{children}</MantineProvider>;
      },
    });
  });

  it("should render list items instead of no subscription placeholder", async () => {
    const subscriptions = [
      monthlySubscription,
      yearlySubscription,
    ] satisfies ReadonlyArray<SubscriptionModel>;

    await Promise.all(
      subscriptions.map((subscription) =>
        waitFor(() =>
          expect(screen.getByTestId(subscription.id)).toBeVisible(),
        ),
      ),
    );

    await waitFor(() =>
      expect(screen.queryByText("No Subscriptions")).not.toBeInTheDocument(),
    );
  });

  it("should filter out subscription by name", async () => {
    const filteredSubscription = {
      ...yearlySubscription,
    } satisfies SubscriptionModel;
    const filteredOutSubscription = {
      ...monthlySubscription,
    } satisfies SubscriptionModel;

    fireEvent.change(screen.getByLabelText("Name prefix"), {
      target: { value: "te" },
    });

    await Promise.all([
      waitFor(() =>
        expect(screen.getByTestId(filteredSubscription.id)).toBeVisible(),
      ),
      waitFor(() =>
        expect(
          screen.queryByTestId(filteredOutSubscription.id),
        ).not.toBeInTheDocument(),
      ),
    ]);
  });

  describe("without data", () => {
    beforeAll(() => {
      vi.mocked(useSubscriptions).mockReturnValue([]);
    });

    it("should show no subscription placeholder instead of list items", async () => {
      await waitFor(() =>
        expect(screen.queryByText("No Subscriptions")).toBeVisible(),
      );
    });

    it("should show no subscription placeholder instead of list items", async () => {
      await waitFor(() =>
        expect(screen.queryByText("No Subscriptions")).toBeVisible(),
      );
    });

    afterAll(() => {
      vi.mocked(useSubscriptions).mockRestore();
    });
  });
});
