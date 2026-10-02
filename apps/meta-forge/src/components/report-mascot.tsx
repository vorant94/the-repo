import { css } from "hono/css";
import mascotUrl from "../assets/hedgehog-mascot.png?inline";

export const ReportMascot = () => (
  <img
    alt=""
    class={mascotStyle}
    height="128"
    src={mascotUrl}
    width="128"
  />
);

const mascotStyle = css`
  display: block;
  flex: none;
  object-fit: contain;
`;
