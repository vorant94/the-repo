import assert from "node:assert/strict";
import { test } from "node:test";
import { type AppContext, runWithAppContext } from "./app-context.ts";
import { requireAdmin, requireVenueOwner } from "./permissions.ts";

test("multiple owners can access the same venue", async () => {
  const expected = 2;
  let queries = 0;
  const db = {
    select: () => ({
      from: () => ({
        where: () => {
          queries += 1;
          return [{ userId: "owner" }];
        },
      }),
    }),
  } as unknown as AppContext["db"];
  const firstOwner = {
    id: "first-owner",
    name: "First owner",
    isActive: true,
    isAdmin: false,
    createdAt: "2026-11-24T00:00:00.000Z",
  };
  const secondOwner = { ...firstOwner, id: "second-owner" };

  await runWithAppContext({ db, user: firstOwner } as AppContext, async () => {
    await requireVenueOwner("venue-one");
  });
  await runWithAppContext({ db, user: secondOwner } as AppContext, async () => {
    await requireVenueOwner("venue-one");
  });
  assert.equal(queries, expected);
});

test("venue owners cannot administer global data", () => {
  const expected = 403;
  const user = {
    id: "owner",
    name: "Owner",
    isActive: true,
    isAdmin: false,
    createdAt: "2026-11-24T00:00:00.000Z",
  };

  runWithAppContext({ user } as AppContext, () => {
    assert.throws(requireAdmin, { status: expected });
  });
});

test("system admins can access venues without an ownership query", async () => {
  const expected = 0;
  let queries = 0;
  const db = {
    select: () => {
      queries += 1;
      throw new Error("Ownership query was not expected");
    },
  } as unknown as AppContext["db"];
  const user = {
    id: "admin",
    name: "Admin",
    isActive: true,
    isAdmin: true,
    createdAt: "2026-11-24T00:00:00.000Z",
  };

  await runWithAppContext({ db, user } as AppContext, async () => {
    assert.doesNotThrow(requireAdmin);
    await requireVenueOwner("venue-one");
  });
  assert.equal(queries, expected);
});

test("users without venue ownership cannot access a venue", async () => {
  const expected = 403;
  const db = {
    select: () => ({ from: () => ({ where: async () => [] }) }),
  } as unknown as AppContext["db"];
  const user = {
    id: "unassigned-user",
    name: "Unassigned user",
    isActive: true,
    isAdmin: false,
    createdAt: "2026-11-24T00:00:00.000Z",
  };

  await runWithAppContext({ db, user } as AppContext, async () => {
    await assert.rejects(requireVenueOwner("venue-one"), { status: expected });
    assert.throws(requireAdmin, { status: expected });
  });
});
