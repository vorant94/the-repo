import { findUsers, setUserRole } from "../dal/db/users.table.ts";
import type { User } from "../shared/schema/users.ts";

export async function promoteUserToAdmin(id: User["id"]): Promise<User> {
  return await setUserRole(id, "admin");
}

export async function findAllUsers(): Promise<Array<User>> {
  return await findUsers();
}
