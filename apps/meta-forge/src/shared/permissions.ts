import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { getAppContext } from "./app-context.ts";
import { venueOwners } from "./schema/venue-owners.ts";

export function getUser() {
  const { user } = getAppContext();
  if (!user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }
  return user;
}

export function requireAdmin(): void {
  if (!getUser().isAdmin) {
    throw new HTTPException(403, { message: "Insufficient permission" });
  }
}

export async function requireVenueOwner(venueId: string): Promise<void> {
  const user = getUser();
  if (user.isAdmin) {
    return;
  }
  const { db } = getAppContext();
  const [owner] = await db
    .select({ userId: venueOwners.userId })
    .from(venueOwners)
    .where(
      and(eq(venueOwners.venueId, venueId), eq(venueOwners.userId, user.id)),
    );
  if (!owner) {
    throw new HTTPException(403, { message: "Insufficient permission" });
  }
}
