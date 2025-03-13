import type { FC } from "react";
import angularLogo from "../../assets/angular-logo.png";
import reactLogo from "../../assets/react-logo.svg";
import spiderManTriple from "../../assets/spider-man-triple.jpg";
import vueLogo from "../../assets/vue-logo.png";

export const ThoughtsOnModernFrameworkFeatures: FC = () => {
  return (
    <div className="relative">
      <img
        src={spiderManTriple}
        alt=""
      />

      <img
        className="absolute top-[160px] left-[70px] h-24 w-24"
        src={vueLogo}
        alt=""
      />

      <img
        className="absolute top-[110px] left-[250px] h-24 w-24"
        src={reactLogo}
        alt=""
      />

      <img
        className="absolute top-[165px] left-[400px] h-24 w-24"
        src={angularLogo}
        alt=""
      />
    </div>
  );
};
