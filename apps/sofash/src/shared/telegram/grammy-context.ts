import type {
  /* Conversation, */
  ConversationFlavor,
} from "@grammyjs/conversations";
import type { Context, SessionFlavor } from "grammy";

export type GrammyContext = ConversationFlavor<
  Context & SessionFlavor<unknown>
>;

// export type GrammyConversation = Conversation<GrammyContext>;
