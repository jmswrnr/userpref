[![NPM Version](https://img.shields.io/npm/v/jmspref?logo=npm&label=%20&labelColor=%23cb0000&color=%23cb0000)](https://www.npmjs.com/package/jmspref)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/jmspref?labelColor=%2322212C&color=%238aff80)](https://bundlephobia.com/package/jmspref)
[![Static Badge](https://img.shields.io/badge/Made_by_James_Warner-000000?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjZThlYWVkIj48cGF0aCBkPSJNNDgwLTQ4MHEtNjAgMC0xMDItNDJ0LTQyLTEwMnEwLTYwIDQyLTEwMnQxMDItNDJxNjAgMCAxMDIgNDJ0NDIgMTAycTAgNjAtNDIgMTAydC0xMDIgNDJaTTE5Mi0xOTJ2LTk2cTAtMjMgMTIuNS00My41VDIzOS0zNjZxNTUtMzIgMTE2LjUtNDlUNDgwLTQzMnE2MyAwIDEyNC41IDE3VDcyMS0zNjZxMjIgMTMgMzQuNSAzNHQxMi41IDQ0djk2SDE5MloiLz48L3N2Zz4%3D)](https://jmswrnr.com/)
[![Static Badge](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?logo=buymeacoffee&logoColor=000)](https://buymeacoffee.com/jmswrnr)

# jmspref

User Preferences for Web Applications; originally built for [jmswrnr.com](https://jmswrnr.com) and now open source!

- 🪶 `< 1 KB` bundle.
- 🏗️ Framework agnostic.
- 🧱 Extendible with custom preferences.
- 💻 Defaults to system preferences for theme & motion.
- 🫙 Saves preferences (local storage).
- 🎨 Themes browser for light/dark UI.
- 🌓 Supports [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS function.
- 🔗 Syncs between open tabs and windows.
- 💥 No flash while loading theme.

## Install

To use this script, you must place it in a `<script>` tag as the first element inside `<body>`.

### ES Module (Recommended)

If using React or similar, you can use the `jmspref` module import, this is a string ready to inline with a `<script>` tag:

```bash
npm install jmspref
```

```tsx
import { jmspref } from "jmspref";

export default function ReactRootLayout() {
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: jmspref,
          }}
        />
      </body>
    </html>
  );
}
```

### JS

For an installation without using modules, you could grab the `dist/jmspref.js` build from [npm](https://www.npmjs.com/package/jmspref?activeTab=code) and copy that inside a `<script>` tag as the first element inside `<body>`.

## API

Using the script tag will expose a `jmspref` object on `window`.

### `window.jmspref`

All preferences are available in this object.

- `window.jmspref.theme`: Theme Preference
- `window.jmspref.motion`: Motion Preference

### Preference

Each preference is represented as an object, you can use this to get and set preferences:

- `user`: The user preference
- `system`: The system preference
- `resolved`: The resolved preference value that is currently used (readonly)

## Examples

### Common Usage:

```tsx
// Setting User Preference:
jmspref.theme.user = 'dark' // set user preference to dark theme
jmspref.theme.user = 'light' // set user preference to light theme
jmspref.theme.user = 'system' // set user preference to system theme


// Getting User Preference:
jmspref.theme.user // 'dark' | 'light' | 'system'


// Getting Resolved Preference:
jmspref.theme.resolved // 'dark' | 'light'


// Handle Preference Change:
window.addEventListener("jmspref-change", (event) => {
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

[data-motion='reduced'],
[data-motion='reduced'] *,
[data-motion='reduced'] *::after,
[data-motion='reduced'] *::before {
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
    __html: jmspref,
  }}
  data-audio="muted"
/>
```

The example above registers an `audio` preference, and sets the system preference to `"muted"`.

The default user preference will be `"system"` which resolves to `"muted"`.

```ts
// Setting Custom User Preference:
window.jmspref.audio.user = "enabled";
window.jmspref.audio.user = "muted";
window.jmspref.audio.user = "system";

// Getting Custom Resolved Preference:
window.jmspref.audio.resolved; // 'enabled' | 'muted'

// Setting Custom System Preference:
window.jmspref.audio.system = "enabled";
window.jmspref.audio.system = "muted";
```
> [!NOTE]
> System preferences are automatically updated on `theme` and `motion`. But you can set them for custom preferences.
