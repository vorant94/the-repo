import { QueryClientProvider } from "@tanstack/react-query";
import type { FC } from "react";
import type { Language } from "../globals/i18n.ts";
import { queryClient } from "../globals/query";
import type { User } from "../schema/users";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import { LocaleProvider } from "./locale-context.tsx";
import { UserProvider } from "./user-context";

interface CommentsClientWrapperProps {
  user?: User | null;
  postSlug: string;
  locale?: Language | (string & {}) | null;
}

export const CommentsClientWrapper: FC<CommentsClientWrapperProps> = ({
  user,
  postSlug,
  locale,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={locale}>
        <UserProvider user={user}>
          <CommentList postSlug={postSlug} />
          <CommentForm postSlug={postSlug} />
        </UserProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
};
