import { gOnlyAdmins } from "@/bl/auth/only-admins.ts";
import { command } from "@/shared/env/command.ts";
import type { GrammyContext } from "@/shared/env/grammy-context.ts";
import { Composer } from "grammy";

export const chainsComposer = new Composer<GrammyContext>();

chainsComposer.use(gOnlyAdmins);

chainsComposer.command(command.addChain, async (gc) => {
  return await gc.reply("hi");
});
