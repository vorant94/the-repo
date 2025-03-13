import type { FC } from "react";

export type PropsWithFcChildren<ParentProps, ChildrenProps> = ParentProps & {
  children?: FC<ChildrenProps> | undefined;
};
