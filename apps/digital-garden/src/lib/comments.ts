import type { ActionAPIContext } from "astro:actions";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import {
  type Comment,
  commentSchema,
  comments as commentsTable,
} from "../schema/comments";
import { type User, userSchema, users } from "../schema/users";

export interface CommentWithAuthor extends Omit<Comment, "authorId"> {
  author: User | null;
}

export async function getComments(
  ctx: APIContext | ActionAPIContext,
  postSlug: string,
): Promise<Array<CommentWithAuthor>> {
  const { db } = ctx.locals;

  const rawCommentsWithAuthors = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.postSlug, postSlug))
    .leftJoin(users, eq(users.id, commentsTable.authorId));

  return rawCommentsWithAuthors.map(
    ({ comments, users }): CommentWithAuthor => {
      const { authorId: _, ...comment } = commentSchema.parse(comments);
      const author = userSchema.parse(users);

      return {
        ...comment,
        author,
      };
    },
  );
}
