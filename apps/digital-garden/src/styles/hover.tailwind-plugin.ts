import plugin from "tailwindcss/plugin";

export default plugin(({ addVariant }) => {
  addVariant("hover", [
    "@media (hover: hover) { &:hover }",
    "@media (hover: none) { &:active }",
  ]);
  addVariant("group-hover", [
    "@media (hover: hover) { .group:hover & }",
    "@media (hover: none) { .group:active & }",
  ]);
});
