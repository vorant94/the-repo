import { actions } from "astro:actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { query, queryClient } from "../globals/query";
import { type AddCommentInput, addCommentInputSchema } from "../lib/api";
import { createTranslate } from "../lib/i18n.ts";
import { useLocale } from "./locale-context.tsx";
import { Button } from "./ui/button.tsx";
import { ButtonLink } from "./ui/button-link.tsx";
import { Icon } from "./ui/icon.tsx";
import { useUser } from "./user-context";

interface CommentFormProps {
  postSlug: string;
}

export const CommentForm: FC<CommentFormProps> = ({ postSlug }) => {
  const user = useUser();
  const locale = useLocale();
  const t = createTranslate(locale ?? "en");
  const loginUrl = new URL("/api/login/github", window.location.origin);
  loginUrl.searchParams.set("redirect_uri", window.location.href);

  const defaultValues = { postSlug, text: "" } satisfies AddCommentInput;

  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(addCommentInputSchema),
    defaultValues,
  });

  const onSubmit = async (data: AddCommentInput) => {
    await actions.addComment(data);
    reset(defaultValues);
    await queryClient.invalidateQueries({
      queryKey: [query.comments, postSlug],
    });
  };

  const avatarUrl = user
    ? `https://avatars.githubusercontent.com/u/${user.githubId}`
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3">
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

        {/* Input side */}
        <div className="min-w-0 flex-1">
          <textarea
            id="text"
            required
            rows={3}
            disabled={!user}
            placeholder={
              user
                ? t("comments.write-placeholder")
                : t("comments.signin-placeholder")
            }
            className="w-full resize-y rounded-2xl border not-active:border-transparent p-3 text-slate-600 text-sm outline-cyan-500 active:border-cyan-500 active:outline-solid disabled:cursor-not-allowed dark:bg-stone-800 dark:text-slate-300"
            {...register("text")}
          />

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <div className="text-slate-500 text-sm">
              {user && (
                <span>
                  {t("comments.commenting-as")}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {user.username}
                  </span>
                </span>
              )}
            </div>

            {user ? (
              <Button
                variant="outlined"
                disabled={!formState.isValid || formState.isSubmitting}
                type="submit"
                className="flex items-center justify-center gap-2 p-2 not-disabled:text-slate-800 disabled:text-slate-500 not-disabled:dark:text-slate-100"
              >
                {t("comments.comment-button")}
              </Button>
            ) : (
              <ButtonLink
                variant="outlined"
                href={loginUrl.toString()}
                data-astro-prefetch="false"
                className="flex items-center justify-center gap-2 p-2 not-disabled:text-slate-800 hover:not-disabled:text-cyan-500 disabled:text-slate-500 not-disabled:dark:text-slate-100"
              >
                <Icon glyph={"github"} />
                {t("comments.signin-github")}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
