export type Preference<T extends string = string> = {
  user: T | "system";
  system: T;
  resolved: T;
};

((_document, _window, storage) => {
  // This isn't super clean, but it's to manually achieve minimal build size
  const module_name = "jmspref";
  const storage_prefix = `${module_name}-`;
  const html = _document.documentElement;
  const str_resolved = "resolved";
  const str_system = "system";
  const str_matches = "matches";
  const str_change = "change";
  const str_addEventListener = "addEventListener";
  const matchMedia = _window.matchMedia;

  // @ts-ignore
  _window[module_name] = {};

  // Preference
  const updateDocument = (key: string, value: string) => {
    html.dataset[key] = value;
    if (key === "theme") {
      html.style["colorScheme"] = value;
    }
  };

  const handlePreferenceChange = <T extends string = string>(
    key: string,
    preference: Preference<T>
  ) => {
    updateDocument(key, preference[str_resolved]);

    const event = new CustomEvent(storage_prefix + str_change, {
      detail: { key, preference },
    });
    _window.dispatchEvent(event);
  };

  const createPreference = <T extends string = string>(
    key: string,
    initialSystemValue: T
  ): Preference<T> => {
    let user: T | "system" = str_system;

    const storedValue = storage?.getItem(storage_prefix + key);
    if (storedValue) {
      user = storedValue as T;
    }

    let system: T = initialSystemValue;
    const obj = {
      set user(val: T | "system") {
        if (user === val) {
          return;
        }
        user = val;
        handlePreferenceChange<T>(key, obj);
        storage?.setItem(storage_prefix + key, val);
      },
      get user() {
        return user;
      },
      set [str_system](val: T) {
        system = val;
        handlePreferenceChange<T>(key, obj);
      },
      get [str_system]() {
        return system;
      },
      get [str_resolved]() {
        return user === str_system ? system : user;
      },
    };

    _window[module_name][key] = obj;
    updateDocument(key, obj[str_resolved]);

    return obj;
  };

  // Theme

  const resolveTheme = (query: MediaQueryList | MediaQueryListEvent) =>
    query[str_matches] ? "dark" : "light";
  const darkThemeQuery = matchMedia("(prefers-color-scheme: dark)");
  const theme = createPreference<"dark" | "light">(
    "theme",
    resolveTheme(darkThemeQuery)
  );
  darkThemeQuery[str_addEventListener](
    str_change,
    (e) => (theme[str_system] = resolveTheme(e))
  );

  // Motion

  const resolveReducedMotion = (
    query: MediaQueryList | MediaQueryListEvent
  ) => (query[str_matches] ? "reduced" : "full");
  const reducedMotionQuery = matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const motion = createPreference<"reduced" | "full">(
    "motion",
    resolveReducedMotion(reducedMotionQuery)
  );
  reducedMotionQuery[str_addEventListener](
    str_change,
    (e) => (motion[str_system] = resolveReducedMotion(e))
  );

  // Local Storage Sync
  window[str_addEventListener]("storage", (e) => {
    if (e.newValue && e.key.startsWith(storage_prefix)) {
      const pref = _window[module_name][
        e.key.substring(storage_prefix.length)
      ] as Preference;
      if (pref) {
        pref.user = e.newValue;
      }
    }
  });

  // Custom
  const scriptDataSet = _document.currentScript?.dataset;
  for (const preferenceKey in scriptDataSet) {
    createPreference(preferenceKey, scriptDataSet[preferenceKey]);
  }
})(document, window, localStorage);

export {};
