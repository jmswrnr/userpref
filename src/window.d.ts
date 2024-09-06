import type { Preference, PreferenceChangeEvent } from "./types";

declare global {
  interface WindowEventMap {
    "jmspref-change": PreferenceChangeEvent;
  }

  interface Window {
    jmspref: Record<string, Preference> & {
      theme: Preference<"dark" | "light">;
      motion: Preference<"reduced" | "full">;
    };
  }
}
