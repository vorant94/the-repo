import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import type { FC } from "react";
import type { CommentWithAuthor } from "../lib/comments";

interface CommentListItemProps {
  comment: CommentWithAuthor;
}

export const CommentListItem: FC<CommentListItemProps> = ({ comment }) => {
  const avatarUrl = new URL(
    comment.author
      ? `https://avatars.githubusercontent.com/u/${comment.author.githubId}`
      : "https://placehold.co/460x460",
  );

  const username = comment.author?.username ?? "Anonymous";
  const date = new Date(comment.createdAt);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        "dark:border-gray-700 dark:bg-gray-800",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <img
          className="h-5 w-5 rounded-full"
          src={avatarUrl.toString()}
          alt={`${username} avatar`}
        />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {username}
        </span>
        <span className="flex-1" />
        <time
          className="text-gray-500 text-xs dark:text-gray-400"
          dateTime={comment.createdAt}
        >
          {formattedDate}
        </time>
      </div>
      <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed dark:text-gray-300">
        {comment.text}
      </p>
    </div>
  );
};
