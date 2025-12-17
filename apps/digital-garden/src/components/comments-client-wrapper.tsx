import { QueryClientProvider } from "@tanstack/react-query";
import type { FC } from "react";
import { queryClient } from "../globals/query";
import type { User } from "../schema/users";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

interface CommentsClientWrapperProps {
  user?: User | null;
  postSlug: string;
}

export const CommentsClientWrapper: FC<CommentsClientWrapperProps> = ({
  user,
  postSlug,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CommentList postSlug={postSlug} />
      <CommentForm
        postSlug={postSlug}
        user={user}
      />
    </QueryClientProvider>
  );
};
