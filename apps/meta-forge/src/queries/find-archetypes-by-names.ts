import { inArray, or, sql } from "drizzle-orm";
import { getAppContext } from "../shared/app-context.ts";
import { archetypes } from "../shared/schema/archetypes.ts";

export async function findArchetypesByNames(names: Array<string>) {
  const requestedNames = new Set(names);
  const idsByName = new Map<string, string>();
  if (requestedNames.size === 0) {
    return idsByName;
  }

  const nameValues = [...requestedNames];
  const aliasValues = sql.join(
    nameValues.map((name) => sql`${name}`),
    sql`, `,
  );
  const { db } = getAppContext();
  const rawArchetypes = await db
    .select({
      id: archetypes.id,
      name: archetypes.name,
      aliases: archetypes.aliases,
    })
    .from(archetypes)
    .where(
      or(
        inArray(archetypes.name, nameValues),
        sql`exists (
          select 1
          from json_each(${archetypes.aliases})
          where json_each.value in (${aliasValues})
        )`,
      ),
    );

  for (const archetype of rawArchetypes) {
    for (const alias of archetype.aliases) {
      if (requestedNames.has(alias) && !idsByName.has(alias)) {
        idsByName.set(alias, archetype.id);
      }
    }

    if (requestedNames.has(archetype.name)) {
      idsByName.set(archetype.name, archetype.id);
    }
  }

  return idsByName;
}
