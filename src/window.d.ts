import type { Preference } from "./preferences";

declare global {
  interface WindowEventMap {
    "jmspref-change":
      | CustomEvent<{
          key: string;
          preference: Preference;
        }>
      | CustomEvent<{
          key: "theme";
          preference: Preference<"dark" | "light">;
        }>
      | CustomEvent<{
          key: "motion";
          preference: Preference<"reduced" | "full">;
        }>;
  }

  interface Window {
    jmspref: Record<string, Preference> & {
      theme: Preference<"dark" | "light">;
      motion: Preference<"reduced" | "full">;
    };
  }
}
