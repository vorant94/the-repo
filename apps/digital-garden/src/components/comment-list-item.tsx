import { actions } from "astro:actions";
import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import type { FC } from "react";
import { query, queryClient } from "../globals/query";
import type { CommentWithAuthor } from "../lib/comments";
import { createTranslate } from "../lib/i18n.ts";
import { useLocale } from "./locale-context.tsx";
import { Button } from "./ui/button.tsx";
import { Icon } from "./ui/icon.tsx";
import { Text } from "./ui/text.tsx";
import { useUser } from "./user-context";

interface CommentListItemProps {
  comment: CommentWithAuthor;
}

export const CommentListItem: FC<CommentListItemProps> = ({ comment }) => {
  const user = useUser();
  const locale = useLocale();
  const t = createTranslate(locale ?? "en");

  const avatarUrl = comment.author
    ? `https://avatars.githubusercontent.com/u/${comment.author.githubId}`
    : null;

  const username = comment.author?.username ?? "Anonymous";
  const date = new Date(comment.createdAt);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });

  const isOwner = comment.author && user?.id === comment.author.id;

  const handleDelete = async () => {
    if (!window.confirm(t("comments.delete-confirm"))) {
      return;
    }

    await actions.deleteComment({ commentId: comment.id });
    await queryClient.invalidateQueries({
      queryKey: [query.comments, comment.postSlug],
    });
  };

  return (
    <div className="group flex gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
          <Icon
            glyph={"user"}
            className={cn("text-slate-300 dark:text-slate-600")}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-sm dark:text-slate-300">
            {username}
          </span>
          <span className="text-slate-500 text-xs">{formattedDate}</span>

          {isOwner && (
            <span className="invisible ml-auto inline-flex gap-1 group-hover:visible">
              <Button
                type="button"
                onClick={handleDelete}
                className={cn(
                  "text-red-300 text-xs not-disabled:hover:text-red-500",
                )}
              >
                <Icon glyph={"trash"} />
              </Button>
            </span>
          )}
        </div>

        <Text
          as={"span"}
          className={cn("text-sm")}
        >
          {comment.text}
        </Text>
      </div>
    </div>
  );
};
