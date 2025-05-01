import type { FC, PropsWithChildren } from "react";
import { BrowserRouter } from "react-router";
import { DefaultLayoutProvider } from "../ui/default.layout.tsx";
import { StoreProvider } from "./store.provider.tsx";

export const StoreTestWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <DefaultLayoutProvider>
        <StoreProvider>{children}</StoreProvider>
      </DefaultLayoutProvider>
    </BrowserRouter>
  );
};
