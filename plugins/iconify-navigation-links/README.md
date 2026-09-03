# typedoc-plugin-iconify-navigation-links

[![NPM License](https://img.shields.io/npm/l/typedoc-plugin-iconify-navigation-links)](https://www.npmjs.com/package/typedoc-plugin-iconify-navigation-links) [![NPM Version](https://img.shields.io/npm/v/typedoc-plugin-iconify-navigation-links)](https://www.npmjs.com/package/typedoc-plugin-iconify-navigation-links) [![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/typedoc-plugin-iconify-navigation-links/peer/typedoc)](https://www.npmjs.com/package/typedoc) [![GitHub Issues by label](https://img.shields.io/github/issues/mrfigg/typedoc-plugins/iconify-navigation-links)](https://github.com/mrfigg/typedoc-plugins/issues)

A plugin for TypeDoc that replaces navigation links in the default theme with iconify icons.

## Installation

```sh
npm install -D typedoc-plugin-iconify-navigation-links
```

## Example

A basic example is available at [https://mrfigg.github.io/typedoc-plugins/iconify-navigation-links](https://mrfigg.github.io/typedoc-plugins/iconify-navigation-links).

## Options

The following options are added to TypeDoc when the plugin is installed:

| Option                             | Type                   | Default  | Description                                                                                                                                                        |
| ---------------------------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **iconifyNavigationLinks**         | Record<string, string> | `{}`     | The navigation links to have their text be replaced with iconify icons. The key is the link text as set in `navigationLinks` and the value is the icon to be used. |
| **iconifyNavigationLinksFontSize** | string                 | `1.25em` | The font size of the icons in the navigation links.                                                                                                                |
| **iconifyNavigationLinksTooltips** | boolean                | `false`  | Whether or not to show tooltips when hovering over the icons in the navigation links.                                                                              |

## Other Plugins

Check out my other plugins available at [https://github.com/mrfigg/typedoc-plugins](https://github.com/mrfigg/typedoc-plugins).
