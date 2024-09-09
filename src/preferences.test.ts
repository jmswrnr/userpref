import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  delete window.userpref;
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
    expect(window.userpref.theme.system).toBe("dark");
    expect(window.userpref.motion.system).toBe("reduced");
    vi.resetModules();
    mediaQueryList.matches = false;
    await import("./preferences");
    expect(window.userpref.theme.system).toBe("light");
    expect(window.userpref.motion.system).toBe("full");
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
    expect(window.userpref.theme.system).toBe("dark");
    expect(window.userpref.motion.system).toBe("reduced");
    listeners.forEach((listener) => listener({ matches: false }));
    expect(window.userpref.theme.system).toBe("light");
    expect(window.userpref.motion.system).toBe("full");
  });
});

describe("Preference resolver", () => {
  it("System value does not override user preference", async () => {
    await import("./preferences");
    window.userpref.theme.user = "light";
    window.userpref.theme.system = "dark";
    expect(window.userpref.theme.resolved).toBe("light");
  });

  it("Sets resolved state on document element attributes", async () => {
    await import("./preferences");
    expect(document.documentElement.dataset.theme).toBe("light");
    window.userpref.theme.user = "dark";
    expect(document.documentElement.dataset.theme).toBe("dark");

    expect(document.documentElement.dataset.motion).toBe("full");
    window.userpref.motion.user = "reduced";
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });
});

describe("Local Storage", () => {
  it("Default state without stored preferences", async () => {
    await import("./preferences");
    expect(window.userpref).toMatchInlineSnapshot(`
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
    expect(window.userpref).toMatchInlineSnapshot(`
      {
        "motion": {
          "resolved": "userpref-motion-mocked",
          "system": "full",
          "user": "userpref-motion-mocked",
        },
        "theme": {
          "resolved": "userpref-theme-mocked",
          "system": "light",
          "user": "userpref-theme-mocked",
        },
      }
    `);
  });

  it("Saves preferences", async () => {
    vi.spyOn(localStorage, "setItem");
    await import("./preferences");
    window.userpref.theme.user = "light";
    expect(localStorage.setItem).toBeCalledWith("userpref-theme", "light");
    vi.clearAllMocks();
    window.userpref.theme.user = "dark";
    expect(localStorage.setItem).toBeCalledWith("userpref-theme", "dark");
    vi.clearAllMocks();
    window.userpref.theme.user = "system";
    expect(localStorage.setItem).toBeCalledWith("userpref-theme", "system");
  });

  it("Handles storage event", async () => {
    await import("./preferences");
    expect(window.userpref.theme.user).toBe("system");
    const event = new StorageEvent("storage", {
      key: "userpref-theme",
      oldValue: window.userpref.theme.user,
      newValue: "storage-event-value",
    });
    window.dispatchEvent(event);
    vi.waitFor(() => {
      expect(window.userpref.theme.user).toBe("storage-event-value");
    });
  });
});

describe("Events", () => {
  it("Event is triggered when user value is set", async () => {
    await import("./preferences");
    const eventHandler = vi.fn();
    window.addEventListener("userpref-change", eventHandler);
    window.userpref.motion.user = "reduced";
    expect(eventHandler).toBeCalled();
    const eventCallDetail = vi.mocked(eventHandler).mock.calls[0][0] as Extract<
      WindowEventMap["userpref-change"],
      { detail: { key: "motion" } }
    >;
    expect(eventCallDetail.detail.key).toBe("motion");
    expect(eventCallDetail.detail.preference.user).toBe("reduced");
    window.removeEventListener("userpref-change", eventHandler);
  });

  it("Event is triggered when system value is set", async () => {
    await import("./preferences");
    const eventHandler = vi.fn();
    window.addEventListener("userpref-change", eventHandler);
    window.userpref.motion.system = "reduced";
    expect(eventHandler).toBeCalled();
    const eventCallDetail = vi.mocked(eventHandler).mock.calls[0][0] as Extract<
      WindowEventMap["userpref-change"],
      { detail: { key: "motion" } }
    >;
    expect(eventCallDetail.detail.key).toBe("motion");
    expect(eventCallDetail.detail.preference.system).toBe("reduced");
    window.removeEventListener("userpref-change", eventHandler);
  });
});

describe("HTML Attributes", () => {
  it("Correct theme attributes are set", async () => {
    await import("./preferences");
    expect(document.documentElement.dataset["theme"]).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    window.userpref.theme.user = "dark";
    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("Correct motion attributes are set", async () => {
    console.log(window.userpref);
    await import("./preferences");
    expect(document.documentElement.dataset["motion"]).toBe("full");
    window.userpref.motion.user = "reduced";
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
    expect(window.userpref.test).toMatchInlineSnapshot(`
      {
        "resolved": "test-value",
        "system": "test-value",
        "user": "system",
      }
    `);
    window.userpref.test.system = "first-system-value";
    expect(window.userpref.test).toMatchInlineSnapshot(`
      {
        "resolved": "first-system-value",
        "system": "first-system-value",
        "user": "system",
      }
    `);
    window.userpref.test.user = "user-override-value";
    expect(window.userpref.test).toMatchInlineSnapshot(`
      {
        "resolved": "user-override-value",
        "system": "first-system-value",
        "user": "user-override-value",
      }
    `);
    window.userpref.test.system = "second-system-value";
    expect(window.userpref.test).toMatchInlineSnapshot(`
      {
        "resolved": "user-override-value",
        "system": "second-system-value",
        "user": "user-override-value",
      }
    `);
    window.userpref.test.user = "system";
    expect(window.userpref.test).toMatchInlineSnapshot(`
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
