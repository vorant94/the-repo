import { Composer } from "grammy";
import { roleGuard } from "../../bl/auth/role.guard.ts";
import { command } from "../../shared/env/command.ts";
import type { GrammyContext } from "../../shared/env/grammy-context.ts";

export const chainsComposer = new Composer<GrammyContext>();

chainsComposer.use(roleGuard("admin"));

chainsComposer.command(command.addChain, async (gc) => {
  return await gc.reply("hi");
});
