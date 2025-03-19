import { cn } from "cn";
import { memo } from "react";
import { useBreakpoint } from "./use-breakpoint.tsx";

export const Logo = memo(() => {
  const isMd = useBreakpoint("md");

  return <h1 className={cn("w-[192px]")}>{isMd ? "$ubs $avvy" : "$$"}</h1>;
});
