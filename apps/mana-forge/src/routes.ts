import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("./routes/index.ts"),
  route("home", "./routes/home.tsx"),
  route("split", "./routes/split.tsx"),
  route("merge", "./routes/merge.tsx"),
  route("compare", "./routes/compare.tsx"),
  route("pick", "./routes/pick.tsx"),
  route("api/scryfall/*", "./routes/api/scryfall.ts"),
] satisfies RouteConfig;
