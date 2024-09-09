[![NPM Version](https://img.shields.io/npm/v/userpref?logo=npm&label=%20&labelColor=%23cb0000&color=%23cb0000)](https://www.npmjs.com/package/userpref)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/userpref?labelColor=%2322212C&color=%238aff80)](https://bundlephobia.com/package/userpref)
[![Static Badge](https://img.shields.io/badge/Made_by_James_Warner-000000?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjZThlYWVkIj48cGF0aCBkPSJNNDgwLTQ4MHEtNjAgMC0xMDItNDJ0LTQyLTEwMnEwLTYwIDQyLTEwMnQxMDItNDJxNjAgMCAxMDIgNDJ0NDIgMTAycTAgNjAtNDIgMTAydC0xMDIgNDJaTTE5Mi0xOTJ2LTk2cTAtMjMgMTIuNS00My41VDIzOS0zNjZxNTUtMzIgMTE2LjUtNDlUNDgwLTQzMnE2MyAwIDEyNC41IDE3VDcyMS0zNjZxMjIgMTMgMzQuNSAzNHQxMi41IDQ0djk2SDE5MloiLz48L3N2Zz4%3D)](https://jmswrnr.com/)
[![Static Badge](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?logo=buymeacoffee&logoColor=000)](https://buymeacoffee.com/jmswrnr)

# userpref

Simple User Preferences for Web Apps.

- 🪶 `< 1 KB` size and `0` dependencies.
- 🏗️ Framework agnostic.
- 🫙 Saves user preference.
- 💻 Defaults to system preference.
- 🔗 Changes are updated on all tabs.
- 🧱 Supports custom preference definitions.
- 🎨 Styles browser UI for light / dark theme.
- 🌓 Supports [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS function.
- 💥 No flash while loading theme.

## Install

Add the userpref `<script>` tag as the first element inside `<body>`, this is important to avoid a flash of the incorrect theme.

### ES Module (Recommended)

```bash
npm install userpref
```

With React or similar, you can use the `source` named export:

```tsx
import { source } from "userpref";

export default function ReactRootLayout() {
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: source,
          }}
        />
      </body>
    </html>
  );
}
```

### Manual

You could also grab the `dist/userpref.js` build from [npm](https://www.npmjs.com/package/userpref?activeTab=code) and copy that inside a `<script>` tag.

> [!WARNING]
> You will not get updates to this module if you manually copy the script.

## API

Using the script tag will expose a `userpref` object on `window`.

### `window.userpref`

All preferences are available in this object. The built-in preferences are:

- `window.userpref.theme`: Theme Preference
- `window.userpref.motion`: Motion Preference

### Preference

Each preference is represented as an object, you can use this to get and set preferences:

- `user`: The user preference
- `system`: The system preference
- `resolved`: The resolved preference value that is currently used (readonly)

## Examples

### Common Usage:

```tsx
// Setting User Preference:
userpref.theme.user = "dark"; // set user preference to dark theme
userpref.theme.user = "light"; // set user preference to light theme
userpref.theme.user = "system"; // set user preference to system theme

// Getting User Preference:
userpref.theme.user; // 'dark' | 'light' | 'system'

// Getting Resolved Preference:
userpref.theme.resolved; // 'dark' | 'light'

// Handle Preference Change:
window.addEventListener("userpref-change", (event) => {
  const {
    key, // 'theme' | 'motion' | ...
    preference, // { user, system, resolved }
  } = event.detail;
});
```

### CSS

All preferences are set as data attributes on the `<html>` element:

```html
<html data-theme="dark" data-motion="reduced"></html>
```

This can be used in CSS queries:

```css
:root {
  --background: white;
}

[data-theme="dark"] {
  --background: black;
}

[data-motion="reduced"],
[data-motion="reduced"] *,
[data-motion="reduced"] *::after,
[data-motion="reduced"] *::before {
  transition-duration: 1ms !important;
  animation-play-state: paused !important;
}
```

You can also use the new [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS function:

```css
:root {
  --background: light-dark(white, black);
}
```

## Custom Preferences

Register custom preferences and their initial system preference using data attributes on the script tag:

```jsx
<script
  dangerouslySetInnerHTML={{
    __html: source,
  }}
  data-audio="muted" // Register "audio" preference with default system preference of "muted"
/>
```



The default user preference will be `"system"` which resolves to `"muted"`.

```ts
// Setting Custom User Preference:
userpref.audio.user = "enabled";
userpref.audio.user = "muted";
userpref.audio.user = "system";

// Getting Custom Resolved Preference:
userpref.audio.resolved; // 'enabled' | 'muted'

// Setting Custom System Preference:
userpref.audio.system = "enabled";
userpref.audio.system = "muted";
```
> [!NOTE]
> System preferences are automatically updated on `theme` and `motion`.
> But you can set them for custom preferences.

## React + TypeScript Example

If you need to access the preference using React, you can use a hook like this:

```ts
"use client";

import type { Preference, PreferenceChangeEvent } from "userpref";
import { useEffect, useState } from "react";

export const useReadPreference = (type: string) => {
  const [preference, setPreference] = useState<Preference | null>(
    typeof window === 'undefined'
      ? null
      : Object.freeze({ ...window.userpref[type] }),
  );

  useEffect(() => {
    const handleChange = (event: PreferenceChangeEvent) => {
      if (event.detail.key === type) {
        setPreference(Object.freeze({ ...event.detail.preference }));
      }
    };

    window.addEventListener('userpref-change', handleChange);
    return () => {
      window.removeEventListener('userpref-change', handleChange);
    };
  }, [type]);

  return preference;
};
```

> [!NOTE]
> This example hook is only intended for reading the preferences.
> This is because we create a new object to easily re-render in React on change.

#### Example usage:

```tsx
export function ToggleTheme() {
  const theme = useReadPreference("theme");

  return (
    <>
      <div>Current theme: {theme.resolved}</div>
      <button onClick={() => (window.userpref.theme.user = "dark")}>
        Use Dark Theme
      </button>
      <button onClick={() => (window.userpref.theme.user = "light")}>
        Use Light Theme
      </button>
      <button onClick={() => (window.userpref.theme.user = "system")}>
        Use System Theme
      </button>
    </>
  );
}
```
