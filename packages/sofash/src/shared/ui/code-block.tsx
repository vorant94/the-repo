import type { FC, PropsWithChildren } from "hono/jsx";

export const CodeBlock: FC<PropsWithChildren<CodeBlockProps>> = ({
  language,
  children,
}) => {
  return <pre language={language}>{children}</pre>;
};

export interface CodeBlockProps {
  language: string;
}
