import clsx from "clsx";
import type { FC } from "react";
import dark from "../../assets/dark.png";
import light from "../../assets/light.png";
import styles from "./digital-garden.module.css";

export const DigitalGarden: FC = () => {
  return (
    <>
      <img
        src={dark}
        alt=""
        className="absolute top-0 left-0 h-full w-full"
      />
      <img
        src={light}
        alt=""
        className={clsx(
          styles.light,
          "light absolute top-0 left-0 h-full w-full",
        )}
      />
    </>
  );
};
