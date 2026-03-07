import { actions } from "astro:actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { query, queryClient } from "../globals/query";
import { type EditCommentInput, editCommentInputSchema } from "../lib/api";
import type { CommentWithAuthor } from "../lib/comments";
import { useUser } from "./user-context";

interface CommentListItemProps {
  comment: CommentWithAuthor;
}

export const CommentListItem: FC<CommentListItemProps> = ({ comment }) => {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const defaultValues = {
    commentId: comment.id,
    text: comment.text,
  } satisfies EditCommentInput;

  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(editCommentInputSchema),
    defaultValues,
  });

  const avatarUrl = new URL(
    comment.author
      ? `https://avatars.githubusercontent.com/u/${comment.author.githubId}`
      : "https://placehold.co/460x460",
  );

  const username = comment.author?.username ?? "Anonymous";
  const date = new Date(comment.createdAt);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });

  const isOwner = comment.author && user?.id === comment.author.id;

  const onSubmit = async (data: EditCommentInput) => {
    await actions.editComment(data);
    setIsEditing(false);
    await queryClient.invalidateQueries({
      queryKey: [query.comments, comment.postSlug],
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    await actions.deleteComment({ commentId: comment.id });
    await queryClient.invalidateQueries({
      queryKey: [query.comments, comment.postSlug],
    });
  };

  const handleCancel = () => {
    reset(defaultValues);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
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
        {comment.updatedAt && (
          <span className="text-gray-500 text-xs italic dark:text-gray-400">
            (edited)
          </span>
        )}
        <span className="flex-1" />
        {isOwner && !isEditing && (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={formState.isSubmitting}
              className={cn(
                "text-blue-600 text-xs opacity-0 transition-opacity hover:underline group-hover:opacity-100 dark:text-blue-400",
                "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={formState.isSubmitting}
              className={cn(
                "text-red-600 text-xs opacity-0 transition-opacity hover:underline group-hover:opacity-100 dark:text-red-400",
                "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Delete
            </button>
          </>
        )}
        <time
          className="text-gray-500 text-xs dark:text-gray-400"
          dateTime={comment.createdAt}
        >
          {formattedDate}
        </time>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <textarea
            rows={4}
            className={cn(
              "min-h-[100px] w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
              "dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100",
              "dark:focus:border-blue-400 dark:focus:ring-blue-400",
            )}
            {...register("text")}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className={cn(
                "rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors",
                "hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
                "dark:bg-blue-500 dark:focus:ring-blue-800 dark:hover:bg-blue-600",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={formState.isSubmitting}
              className={cn(
                "rounded-lg bg-gray-200 px-4 py-2 text-gray-900 text-sm transition-colors",
                "hover:bg-gray-300 focus:ring-4 focus:ring-gray-300",
                "dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-600 dark:hover:bg-gray-600",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed dark:text-gray-300">
          {comment.text}
        </p>
      )}
    </div>
  );
};
