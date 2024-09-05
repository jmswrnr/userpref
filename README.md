[![GitHub package.json version](https://img.shields.io/npm/v/jmspref)](https://www.npmjs.com/package/jmspref)
[![jmspref minzip package size](https://img.shields.io/bundlephobia/minzip/jmspref)](https://bundlephobia.com/package/jmspref)
[![Static Badge](https://img.shields.io/badge/Made_by_James_Warner-000000?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjZThlYWVkIj48cGF0aCBkPSJNNDgwLTQ4MHEtNjAgMC0xMDItNDJ0LTQyLTEwMnEwLTYwIDQyLTEwMnQxMDItNDJxNjAgMCAxMDIgNDJ0NDIgMTAycTAgNjAtNDIgMTAydC0xMDIgNDJaTTE5Mi0xOTJ2LTk2cTAtMjMgMTIuNS00My41VDIzOS0zNjZxNTUtMzIgMTE2LjUtNDlUNDgwLTQzMnE2MyAwIDEyNC41IDE3VDcyMS0zNjZxMjIgMTMgMzQuNSAzNHQxMi41IDQ0djk2SDE5MloiLz48L3N2Zz4%3D)](https://jmswrnr.com/)
[![Static Badge](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?logo=buymeacoffee&logoColor=000)](https://buymeacoffee.com/jmswrnr)

# jmspref

User Preferences for Web Applications; originally built for [jmswrnr.com](https://jmswrnr.com) and now open source!

```
npm install jmspref --save-dev
```

- 🪶 `< 1 KB` bundle.
- 🏗️ Framework agnostic.
- 🧱 Extendible with custom preferences.
- 💻 Defaults to system preferences for theme & motion.
- 🫙 Saves preferences (local storage).
- 🎨 Themes browser for light/dark UI.
- 🌓 Supports [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS function.
- 🔗 Syncs between open tabs and windows.
- 💥 No flash while loading theme.

## React Usage

### Include Script
Inline the script as the first thing inside body
```tsx
import { jmspref } from 'jmspref';

<body>
  <script
    dangerouslySetInnerHTML={{
      __html: jmspref,
    }}
  />
</body>
```

### Set User Preference

When you want to apply the user preference:

```ts
// Theme
window.jmspref.theme.user = 'dark';
window.jmspref.theme.user = 'light';
window.jmspref.theme.user = 'system';

// Motion
window.jmspref.motion.user = 'full';
window.jmspref.motion.user = 'reduced';
window.jmspref.motion.user = 'system';
```

### Get Resolved Value

The resolved value used on the website
```ts
// Theme
window.jmspref.theme.resolved; // 'light'

// Motion
window.jmspref.motion.resolved; // 'reduced'
```

### Get System Value

To see what the system/default value is, even if it's not being used:

```ts
// Theme
window.jmspref.theme.system; // 'dark'

// Motion
window.jmspref.motion.system; // 'full'
```
### Handle Changes

Changes are dispatched as events:

```ts
window.addEventListener('jmspref-change', (event) => {
  const { 
    key, // 'theme' | 'motion' | ...
    preference  // { user, system, resolved }
  } = event.detail;
});
```

### CSS

All preferences are set as data attributes on the `<html>` element:
```html
<html data-theme="dark" data-motion="reduced">
  ```

This can be used in CSS queries:

```css
[data-theme="light"] body {
  background: white;
}

[data-theme="dark"] body {
  background: black;
}
```

Or you could use the new [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) CSS function:

```css
body {
  background: light-dark(white, black);
}
```

## Custom Preferences

Register custom preferences using data attributes on the script tag:

```jsx
  <script
    dangerouslySetInnerHTML={{
      __html: jmspref,
    }}
    data-audio="muted"
  />
```

The example above registers an `audio` preference, and sets the system value to `"muted"`.

The default user value will be `"system"` which resolves to `"muted"`.

```ts
// Set user value
window.jmspref.audio.user = 'enabled';
window.jmspref.audio.user = 'muted';
window.jmspref.audio.user = 'system';

// Get resolved value
window.jmspref.audio.resolved; // 'enabled' | 'muted'

// You can also set what the system value at runtime:
// Set system value
window.jmspref.audio.system = 'enabled';
window.jmspref.audio.system = 'muted';
```