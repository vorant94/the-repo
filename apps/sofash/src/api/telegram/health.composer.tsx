import { Composer } from "grammy";
import { renderToString } from "hono/jsx/dom/server";
import { z } from "zod";
import { checkHealth, healthStatuses } from "../../bl/system.ts";
import { userSchema } from "../../shared/schema/users.ts";
import { command } from "../../shared/telegram/command.ts";
import type { GrammyContext } from "../../shared/telegram/grammy-context.ts";
import { CodeBlock } from "../../shared/ui/code-block.tsx";

export const healthComposer = new Composer<GrammyContext>();

healthComposer.command(command.health, async (gc) => {
  const html = renderToString(
    <CodeBlock language="json">
      {JSON.stringify(healthDtoSchema.parse(await checkHealth()), null, 2)}
    </CodeBlock>,
  );

  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  return await gc.reply(html, { parse_mode: "HTML" });
});

const healthDtoSchema = z.object({
  status: z.enum(healthStatuses),
  components: z.object({
    database: z.object({
      status: z.enum(healthStatuses),
    }),
    telegram: z.object({
      username: z.string().nullish(),
      webhookUrl: z.string().url().nullish(),
    }),
  }),
  user: userSchema.pick({
    id: true,
    role: true,
    telegramChatId: true,
  }),
});
