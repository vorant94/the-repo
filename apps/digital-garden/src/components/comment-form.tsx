import { actions, type SafeResult } from "astro:actions";
import { withState } from "@astrojs/react/actions";
import { cn } from "cn";
import { type FC, useActionState, useEffect } from "react";
import type { AddCommentInput, AddCommentOutput } from "../actions/add-comment";
import { query, queryClient } from "../globals/query";
import type { User } from "../schema/users";

interface CommentFormProps {
  postSlug: string;
  user?: User | null;
}

export const CommentForm: FC<CommentFormProps> = ({ postSlug, user }) => {
  const loginUrl = new URL("/api/login/github", window.location.origin);
  loginUrl.searchParams.set("redirect_uri", window.location.href);

  const [state, action, pending] = useActionState<
    SafeResult<AddCommentInput, AddCommentOutput>,
    FormData
  >(
    (prev, formData) => {
      formData.append("postSlug", postSlug);

      return withState(actions.addComment)(prev, formData);
    },
    { data: null, error: undefined },
  );

  useEffect(() => {
    if (!state.data) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: [query.comments, postSlug] });
  }, [state, postSlug]);

  return (
    <form
      action={action}
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        "dark:border-gray-700 dark:bg-gray-800",
      )}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="text"
          className="font-medium text-gray-700 text-sm dark:text-gray-300"
        >
          Add a comment
        </label>
        <textarea
          name="text"
          id="text"
          required
          rows={4}
          placeholder="Share your thoughts..."
          className={cn(
            "min-h-[100px] w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
            "dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100",
            "dark:focus:border-blue-400 dark:focus:ring-blue-400",
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        {user && (
          <span className="text-gray-600 text-sm dark:text-gray-400">
            Commenting as{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user.username}
            </span>
          </span>
        )}
        {!user && (
          <span className="text-gray-600 text-sm dark:text-gray-400">
            Sign in to comment
          </span>
        )}

        {!user && (
          <a
            href={loginUrl.toString()}
            data-astro-prefetch="false"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-sm text-white transition-colors",
              "hover:bg-gray-800 focus:ring-4 focus:ring-gray-300",
              "dark:bg-gray-100 dark:text-gray-900 dark:focus:ring-gray-700 dark:hover:bg-gray-200",
            )}
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Sign in with GitHub
          </a>
        )}
        {user && (
          <button
            disabled={pending}
            type="submit"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors",
              "hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
              "dark:bg-blue-500 dark:focus:ring-blue-800 dark:hover:bg-blue-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Post Comment
          </button>
        )}
      </div>
    </form>
  );
};
