import type { FC } from "react";
import { staticFile } from "remotion";

export const ThoughtsOnModernFrameworkFeatures: FC = () => {
  return (
    <div className="relative">
      <img
        src={staticFile("spider-man-triple.jpg")}
        alt=""
      />

      <img
        className="absolute top-[160px] left-[70px] h-24 w-24"
        src={staticFile("vue-logo.png")}
        alt=""
      />

      <img
        className="absolute top-[110px] left-[250px] h-24 w-24"
        src={staticFile("react-logo.svg")}
        alt=""
      />

      <img
        className="absolute top-[165px] left-[400px] h-24 w-24"
        src={staticFile("angular-logo.png")}
        alt=""
      />
    </div>
  );
};
