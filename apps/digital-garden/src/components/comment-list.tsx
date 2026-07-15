import { actions } from "astro:actions";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import type { FC } from "react";
import { query } from "../globals/query";
import type { CommentWithAuthor } from "../lib/comments";
import { createTranslate } from "../lib/i18n.ts";
import { CommentListItem } from "./comment-list-item";
import { useLocale } from "./locale-context.tsx";
import { Divider } from "./ui/divider.tsx";
import { Title } from "./ui/title.tsx";

interface CommentListProps {
  postSlug: string;
}

export const CommentList: FC<CommentListProps> = ({ postSlug }) => {
  const locale = useLocale();
  const t = createTranslate(locale ?? "en");
  const comments = useQuery({
    queryKey: [query.comments, postSlug],
    queryFn: () => unwrapFetchAction(postSlug),
  });

  const count = comments.data?.length ?? 0;
  let countLabel = "";
  if (count === 1) {
    countLabel = t("comments.count-singular");
  } else if ((locale ?? "en") === "ru") {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) {
      countLabel = `${count} ${t("comments.count-singular").split(" ")[1]}`;
    } else if (
      lastDigit >= 2 &&
      lastDigit <= 4 &&
      (lastTwoDigits < 10 || lastTwoDigits >= 20)
    ) {
      countLabel = `${count} ${t("comments.count-plural-2-4")}`;
    } else {
      countLabel = `${count} ${t("comments.count-plural-5")}`;
    }
  } else {
    countLabel = `${count} ${t("comments.count-plural")}`;
  }
  const isEmpty = comments.data && comments.data.length === 0;

  return (
    <div className="flex flex-col gap-5 py-5">
      <Divider className={cn("py-0")}>
        <Title as="h3">{countLabel}</Title>
      </Divider>

      {!isEmpty && (
        <div className="flex flex-col gap-5">
          {comments.data?.map((comment) => (
            <div key={comment.id}>
              <CommentListItem comment={comment} />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="text-center text-slate-500">{t("comments.empty")}</div>
      )}
    </div>
  );
};

async function unwrapFetchAction(
  postSlug: string,
): Promise<Array<CommentWithAuthor>> {
  const { data, error } = await actions.fetchComments({ postSlug });
  if (error) {
    throw error;
  }

  return data;
}
