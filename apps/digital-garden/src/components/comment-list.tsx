import { actions } from "astro:actions";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { query } from "../globals/query";
import type { CommentWithAuthor } from "../lib/comments";
import { CommentListItem } from "./comment-list-item";
import { Title } from "./ui/title";

export interface CommentListProps {
  postSlug: string;
}

export const CommentList: FC<CommentListProps> = ({ postSlug }) => {
  const comments = useQuery({
    queryKey: [query.comments, postSlug],
    queryFn: () => unwrapAction(postSlug),
  });

  return (
    <div className="flex flex-col gap-4">
      <Title as="h3">Comments</Title>

      {comments.data && (
        <div className="flex flex-col gap-2">
          {comments.data.map((comment) => (
            <CommentListItem
              key={comment.id}
              comment={comment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

async function unwrapAction(
  postSlug: string,
): Promise<Array<CommentWithAuthor>> {
  const { data, error } = await actions.fetchComments({ postSlug });
  if (error) {
    throw error;
  }

  return data;
}
