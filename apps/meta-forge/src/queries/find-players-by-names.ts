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
  const aliasValues = sql.join(
    nameValues.map((name) => sql`${name}`),
    sql`, `,
  );
  const { db } = getAppContext();
  const rawPlayers = await db
    .select({ id: players.id, name: players.name, aliases: players.aliases })
    .from(players)
    .where(
      or(
        inArray(players.name, nameValues),
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

  return idsByName;
}
