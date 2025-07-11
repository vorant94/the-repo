import { getTableColumns, type SQL, sql } from "drizzle-orm";
import { toSnakeCase } from "drizzle-orm/casing";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

export function createConflictUpdateColumns<
  T extends SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(table: T, columns: Array<Q>): Record<Q, SQL> {
  const cls = getTableColumns(table);

  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      // need to manually cast column name to snake case, because outside of
      // query context drizzle config field, that is responsible for casing,
      // has no effect.
      // see https://github.com/drizzle-team/drizzle-orm/issues/3094
      acc[column] = sql.raw(`excluded.${toSnakeCase(colName ?? "")}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
}
