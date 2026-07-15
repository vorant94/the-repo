import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const query = { comments: "comments" } as const;
