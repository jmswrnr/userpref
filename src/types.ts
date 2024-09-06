export type Preference<T extends string = string> = {
  user: T | "system";
  system: T;
  resolved: T;
};

export type PreferenceChangeEvent =
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
