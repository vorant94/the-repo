import "@fortawesome/fontawesome-free/css/brands.css";
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "flag-icons/css/flag-icons.css";
import { cn } from "cn";
import type { FC, HTMLAttributes } from "react";

const iconGlyphs = [
  "linked-in",
  "github",
  "medium",
  "stack-overflow",
  "telegram",
  "twitter",
  "rss",
  "menu",
  "close",
  "globe",
  "bluesky",
  "en",
  "ru",
] as const;
type IconGlyph = (typeof iconGlyphs)[number];

interface IconProps extends HTMLAttributes<HTMLElement> {
  glyph: IconGlyph;
}

export const Icon: FC<IconProps> = ({ glyph, className, ...rest }) => {
  return (
    <i
      className={cn(iconGlyphToFaIcon[glyph], className)}
      {...rest}
    />
  );
};

const iconGlyphToFaIcon = {
  "linked-in": "fa-brands fa-linkedin",
  github: "fa-brands fa-github",
  medium: "fa-brands fa-medium",
  "stack-overflow": "fa-brands fa-stack-overflow",
  telegram: "fa-brands fa-telegram",
  twitter: "fa-brands fa-x-twitter",
  rss: "fa-solid fa-rss",
  menu: "fa-solid fa-bars",
  close: "fa-solid fa-xmark",
  globe: "fa-solid fa-globe",
  bluesky: "fa-brands fa-bluesky",
  en: "fi fi-us",
  ru: "fi fi-ru",
} as const satisfies Record<IconGlyph, string>;
