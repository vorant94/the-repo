import { setUserRole } from "@/dal/db/users.table.ts";
import type { User } from "@/shared/schema/users.ts";

export async function promoteUserToAdmin(id: User["id"]): Promise<User> {
  return await setUserRole(id, "admin");
}
