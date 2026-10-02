import { inArray, or, sql } from "drizzle-orm";
import { getAppContext } from "../shared/app-context.ts";
import { players } from "../shared/schema/players.ts";

export async function findPlayersByNames(names: Array<string>) {
  const requestedNames = new Set(names);
  const idsByName = new Map<string, string>();
  if (requestedNames.size === 0) {
    return idsByName;
  }

  const nameValues = [...requestedNames];
  const { db } = getAppContext();
  for (
    let index = 0;
    index < nameValues.length;
    index += maximumNamesPerQuery
  ) {
    const chunk = nameValues.slice(index, index + maximumNamesPerQuery);
    const aliasValues = sql.join(
      chunk.map((name) => sql`${name}`),
      sql`, `,
    );
    const rawPlayers = await db
      .select({ id: players.id, name: players.name, aliases: players.aliases })
      .from(players)
      .where(
        or(
          inArray(players.name, chunk),
          sql`exists (
            select 1
            from json_each(${players.aliases})
            where json_each.value in (${aliasValues})
          )`,
        ),
      );

    for (const player of rawPlayers) {
      for (const alias of player.aliases) {
        if (requestedNames.has(alias) && !idsByName.has(alias)) {
          idsByName.set(alias, player.id);
        }
      }

      if (requestedNames.has(player.name)) {
        idsByName.set(player.name, player.id);
      }
    }
  }

  return idsByName;
}

// Each name binds twice; D1 allows at most 100 parameters per query.
const maximumNamesPerQuery = 40;
