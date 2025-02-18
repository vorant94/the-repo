import { profile } from "@/globals/profile.ts";

export function getFullTitle(title?: string): string {
  return title ? `${title} | ${profile.title}` : profile.title;
}
