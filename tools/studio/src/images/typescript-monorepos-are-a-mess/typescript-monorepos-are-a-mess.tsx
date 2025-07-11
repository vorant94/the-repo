import { cn } from "cn";
import type { FC } from "react";
import { z } from "zod";
import gitLogo from "../../assets/git-logo.svg";
import gitDarkLogo from "../../assets/git-logo-dark.svg";
import tsLogo from "../../assets/ts-logo.svg";
import tsDarkLogo from "../../assets/ts-logo-dark.svg";
import yarnLogo from "../../assets/yarn-logo.svg";
import yarnDarkLogo from "../../assets/yarn-logo-dark.svg";

// biome-ignore lint/style/useNamingConvention: AMess is two word
export const typescriptMonoreposAreAMessPropsSchema = z.object({
  mode: z.enum(["dark", "light"]).optional(),
});

// biome-ignore lint/style/useNamingConvention: AMess is two word
export type TypescriptMonoreposAreAMessProps = z.infer<
  typeof typescriptMonoreposAreAMessPropsSchema
>;

// biome-ignore lint/style/useNamingConvention: AMess is two word
export const TypescriptMonoreposAreAMess: FC<
  TypescriptMonoreposAreAMessProps
> = ({ mode = "light" }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-6 grid-rows-4 gap-6 p-40",
        mode === "light" ? "bg-zinc-100" : "bg-zinc-900",
      )}
    >
      <div
        className={cn(
          "border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        className={cn(
          "border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        style={{
          "--bg-image-url": `url(${yarnLogo})`,
          "--bg-image-dark-url": `url(${yarnDarkLogo})`,
        }}
        className={cn(
          "col-span-2 row-span-2 bg-[#2C8EBB] bg-[length:65%_65%] bg-center bg-no-repeat p-12",
          mode === "light"
            ? "bg-[image:var(--bg-image-url)]"
            : "bg-[image:var(--bg-image-dark-url)]",
        )}
      />
      <div
        className={cn(
          "row-span-2 border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        className={cn(
          "row-span-4 border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        className={cn(
          "col-span-2 border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        style={{
          "--bg-image-url": `url(${gitLogo})`,
          "--bg-image-dark-url": `url(${gitDarkLogo})`,
        }}
        className={cn(
          "col-span-2 row-span-2 bg-[#f03c2e] bg-[length:65%_65%] bg-center bg-no-repeat p-12",
          mode === "light"
            ? "bg-[image:var(--bg-image-url)]"
            : "bg-[image:var(--bg-image-dark-url)]",
        )}
      />
      <div
        style={{
          "--bg-image-url": `url(${tsLogo})`,
          "--bg-image-dark-url": `url(${tsDarkLogo})`,
        }}
        className={cn(
          "col-span-2 row-span-2 bg-[#3178C6] bg-cover p-12",
          mode === "light"
            ? "bg-[image:var(--bg-image-url)]"
            : "bg-[image:var(--bg-image-dark-url)]",
        )}
      />
      <div
        className={cn(
          "border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
      <div
        className={cn(
          "border-4 p-12",
          mode === "light" ? "border-slate-900" : "border-slate-100",
        )}
      />
    </div>
  );
};

// bg-zinc-100 -> #f4f4f5
// bg-zinc-900 -> #18181b
// size 1064 x 808
