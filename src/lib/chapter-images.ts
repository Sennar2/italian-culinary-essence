import rome from "@/assets/chapter-rome.jpg";
import milan from "@/assets/chapter-milan.jpg";
import london from "@/assets/chapter-london.jpg";
import newYork from "@/assets/chapter-new-york.jpg";
import toronto from "@/assets/chapter-toronto.jpg";
import saoPaulo from "@/assets/chapter-saopaulo.jpg";
import dubai from "@/assets/chapter-dubai.jpg";
import singapore from "@/assets/chapter-singapore.jpg";
import sydney from "@/assets/chapter-sydney.jpg";

export const chapterImages: Record<string, string> = {
  "chapter-rome": rome,
  "chapter-milan": milan,
  "chapter-london": london,
  "chapter-new-york": newYork,
  "chapter-toronto": toronto,
  "chapter-saopaulo": saoPaulo,
  "chapter-dubai": dubai,
  "chapter-singapore": singapore,
  "chapter-sydney": sydney,
};

export function resolveImage(key?: string | null): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("http") || key.startsWith("/")) return key;
  return chapterImages[key];
}