import type { Preference, PreferenceChangeEvent } from "./types";

declare global {
  interface WindowEventMap {
    "userpref-change": PreferenceChangeEvent;
  }

  interface Window {
    userpref: Record<string, Preference> & {
      theme: Preference<"dark" | "light">;
      motion: Preference<"reduced" | "full">;
    };
  }
}
