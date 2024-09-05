import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  delete window.jmspref;
  for (const dataKey in document.documentElement.dataset) {
    delete document.documentElement.dataset[dataKey];
  }
  vi.restoreAllMocks();
  vi.resetModules();
  window.localStorage.clear();
});

describe("Media Queries", () => {
  it("System values default to media query", async () => {
    const mediaQueryList = {
      matches: true,
      addEventListener: () => vi.fn(),
    } as any;

    vi.spyOn(window, "matchMedia").mockImplementation(() => mediaQueryList);
    mediaQueryList.matches = true;
    await import("./preferences");
    expect(window.jmspref.theme.system).toBe("dark");
    expect(window.jmspref.motion.system).toBe("reduced");
    vi.resetModules();
    mediaQueryList.matches = false;
    await import("./preferences");
    expect(window.jmspref.theme.system).toBe("light");
    expect(window.jmspref.motion.system).toBe("full");
  });

  it("System values use media query event", async () => {
    const listeners = [];
    const addEventListener = vi
      .fn()
      .mockImplementation((_, listener) => listeners.push(listener));
    const mediaQueryList = {
      matches: true,
      addEventListener,
    } as any;

    vi.spyOn(window, "matchMedia").mockImplementation(() => mediaQueryList);
    await import("./preferences");
    expect(window.jmspref.theme.system).toBe("dark");
    expect(window.jmspref.motion.system).toBe("reduced");
    listeners.forEach((listener) => listener({ matches: false }));
    expect(window.jmspref.theme.system).toBe("light");
    expect(window.jmspref.motion.system).toBe("full");
  });
});

describe("Preference resolver", () => {
  it("System value does not override user preference", async () => {
    await import("./preferences");
    window.jmspref.theme.user = "light";
    window.jmspref.theme.system = "dark";
    expect(window.jmspref.theme.resolved).toBe("light");
  });

  it("Sets resolved state on document element attributes", async () => {
    await import("./preferences");
    expect(document.documentElement.dataset.theme).toBe("light");
    window.jmspref.theme.user = "dark";
    expect(document.documentElement.dataset.theme).toBe("dark");

    expect(document.documentElement.dataset.motion).toBe("full");
    window.jmspref.motion.user = "reduced";
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });
});

describe("Local Storage", () => {
  it("Default state without stored preferences", async () => {
    await import("./preferences");
    expect(window.jmspref).toMatchInlineSnapshot(`
      {
        "motion": {
          "resolved": "full",
          "system": "full",
          "user": "system",
        },
        "theme": {
          "resolved": "light",
          "system": "light",
          "user": "system",
        },
      }
    `);
  });

  it("Loads stored preferences", async () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(
      (key) => `${key}-mocked`
    );
    await import("./preferences");
    expect(window.jmspref).toMatchInlineSnapshot(`
      {
        "motion": {
          "resolved": "jmspref-motion-mocked",
          "system": "full",
          "user": "jmspref-motion-mocked",
        },
        "theme": {
          "resolved": "jmspref-theme-mocked",
          "system": "light",
          "user": "jmspref-theme-mocked",
        },
      }
    `);
  });

  it("Saves preferences", async () => {
    vi.spyOn(localStorage, "setItem");
    await import("./preferences");
    window.jmspref.theme.user = "light";
    expect(localStorage.setItem).toBeCalledWith("jmspref-theme", "light");
    vi.clearAllMocks();
    window.jmspref.theme.user = "dark";
    expect(localStorage.setItem).toBeCalledWith("jmspref-theme", "dark");
    vi.clearAllMocks();
    window.jmspref.theme.user = "system";
    expect(localStorage.setItem).toBeCalledWith("jmspref-theme", "system");
  });

  it("Handles storage event", async () => {
    await import("./preferences");
    expect(window.jmspref.theme.user).toBe("system");
    const event = new StorageEvent("storage", {
      key: "jmspref-theme",
      oldValue: window.jmspref.theme.user,
      newValue: "storage-event-value",
    });
    window.dispatchEvent(event);
    vi.waitFor(() => {
      expect(window.jmspref.theme.user).toBe("storage-event-value");
    });
  });
});

describe("Events", () => {
  it("Event is triggered when user value is set", async () => {
    await import("./preferences");
    const eventHandler = vi.fn();
    window.addEventListener("jmspref-change", eventHandler);
    window.jmspref.motion.user = "reduced";
    expect(eventHandler).toBeCalled();
    const eventCallDetail = vi.mocked(eventHandler).mock.calls[0][0] as Extract<
      WindowEventMap["jmspref-change"],
      { detail: { key: "motion" } }
    >;
    expect(eventCallDetail.detail.key).toBe("motion");
    expect(eventCallDetail.detail.preference.user).toBe("reduced");
    window.removeEventListener("jmspref-change", eventHandler);
  });

  it("Event is triggered when system value is set", async () => {
    await import("./preferences");
    const eventHandler = vi.fn();
    window.addEventListener("jmspref-change", eventHandler);
    window.jmspref.motion.system = "reduced";
    expect(eventHandler).toBeCalled();
    const eventCallDetail = vi.mocked(eventHandler).mock.calls[0][0] as Extract<
      WindowEventMap["jmspref-change"],
      { detail: { key: "motion" } }
    >;
    expect(eventCallDetail.detail.key).toBe("motion");
    expect(eventCallDetail.detail.preference.system).toBe("reduced");
    window.removeEventListener("jmspref-change", eventHandler);
  });
});

describe("HTML Attributes", () => {
  it("Correct theme attributes are set", async () => {
    await import("./preferences");
    expect(document.documentElement.dataset["theme"]).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    window.jmspref.theme.user = "dark";
    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("Correct motion attributes are set", async () => {
    console.log(window.jmspref);
    await import("./preferences");
    expect(document.documentElement.dataset["motion"]).toBe("full");
    window.jmspref.motion.user = "reduced";
    expect(document.documentElement.dataset["motion"]).toBe("reduced");
  });
});

describe("Custom Preferences", () => {
  it("Reads dataset from script tag", async () => {
    const mockScriptTag = document.createElement("script");
    mockScriptTag.dataset["test"] = "test-value";
    Object.defineProperty(document, "currentScript", {
      value: mockScriptTag,
      configurable: true,
    });
    await import("./preferences");
    expect(document.documentElement.dataset["test"]).toBe("test-value");
    expect(window.jmspref.test).toMatchInlineSnapshot(`
      {
        "resolved": "test-value",
        "system": "test-value",
        "user": "system",
      }
    `);
    window.jmspref.test.system = "first-system-value";
    expect(window.jmspref.test).toMatchInlineSnapshot(`
      {
        "resolved": "first-system-value",
        "system": "first-system-value",
        "user": "system",
      }
    `);
    window.jmspref.test.user = "user-override-value";
    expect(window.jmspref.test).toMatchInlineSnapshot(`
      {
        "resolved": "user-override-value",
        "system": "first-system-value",
        "user": "user-override-value",
      }
    `);
    window.jmspref.test.system = "second-system-value";
    expect(window.jmspref.test).toMatchInlineSnapshot(`
      {
        "resolved": "user-override-value",
        "system": "second-system-value",
        "user": "user-override-value",
      }
    `);
    window.jmspref.test.user = "system";
    expect(window.jmspref.test).toMatchInlineSnapshot(`
      {
        "resolved": "second-system-value",
        "system": "second-system-value",
        "user": "system",
      }
    `);

    // @ts-ignore
    delete document.currentScript;
  });

  it("Test does not leak", async () => {
    // await import('./preferences')
    expect(document.documentElement.dataset["test"]).not.toBe("test-value");
  });
});
