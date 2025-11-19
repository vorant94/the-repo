import { cn } from "cn";
import type { FC } from "react";
import { staticFile } from "remotion";
import styles from "./digital-garden.module.css";

export const DigitalGarden: FC = () => {
  return (
    <>
      <img
        src={staticFile("dark.png")}
        alt=""
        className="absolute top-0 left-0 h-full w-full"
      />
      <img
        src={staticFile("light.png")}
        alt=""
        className={cn(
          styles.light,
          "light absolute top-0 left-0 h-full w-full",
        )}
      />
    </>
  );
};
