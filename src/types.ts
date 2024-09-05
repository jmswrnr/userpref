export type Preference<T extends string = string> = {
  user: T | "system";
  system: T;
  resolved: T;
};