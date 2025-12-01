import "./style.css";
import type { FC } from "react";
import { Still } from "remotion";
import { DigitalGarden } from "./images/digital-garden/digital-garden";
import { ThoughtsOnModernFrameworkFeatures } from "./images/thoughts-on-modern-framework-features/thoughts-on-modern-framework.features";
import {
  TypescriptMonoreposAreAMess,
  typescriptMonoreposAreAMessPropsSchema,
} from "./images/typescript-monorepos-are-a-mess/typescript-monorepos-are-a-mess";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Still
        id="typescript-monorepos-are-a-mess"
        component={TypescriptMonoreposAreAMess}
        // @ts-expect-error - in runtime it works, so i don't care about ts error in tools in this case
        schema={typescriptMonoreposAreAMessPropsSchema}
        defaultProps={{ mode: "dark" }}
        width={1064}
        height={808}
      />

      <Still
        id="thoughts-on-modern-framework-features"
        component={ThoughtsOnModernFrameworkFeatures}
        width={544}
        height={500}
      />

      <Still
        id="digital-garden"
        component={DigitalGarden}
        width={1792}
        height={920}
      />
    </>
  );
};
