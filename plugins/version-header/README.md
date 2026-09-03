# typedoc-plugin-version-header

[![NPM License](https://img.shields.io/npm/l/typedoc-plugin-version-header)](https://www.npmjs.com/package/typedoc-plugin-version-header) [![NPM Version](https://img.shields.io/npm/v/typedoc-plugin-version-header)](https://www.npmjs.com/package/typedoc-plugin-version-header) [![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/typedoc-plugin-version-header/peer/typedoc)](https://www.npmjs.com/package/typedoc) [![GitHub Issues by label](https://img.shields.io/github/issues/mrfigg/typedoc-plugins/version-header)](https://github.com/mrfigg/typedoc-plugins/issues)

A plugin for TypeDoc that makes the project's version appear only in the page header in the default theme.

## Installation

```sh
npm install -D typedoc-plugin-version-header
```

## Example

A basic example is available at [https://mrfigg.github.io/typedoc-plugins/version-header](https://mrfigg.github.io/typedoc-plugins/version-header).

## Options

The following options are added to TypeDoc when the plugin is installed:

| Option                  | Type   | Default          | Description                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **versionHeaderFormat** | string | `"v{{version}}"` | The format of the version number in the header. Use `{{version}}` to insert the full version number, or `{{major}}`/`{{minor}}`/`{{patch}}` to insert individual parts of the version number. If `{{name}}` is used, it will be replaced with the project's name and the `versionHeaderFormat` will be applied to the entire header link. |

## Other Plugins

Check out my other plugins available at [https://github.com/mrfigg/typedoc-plugins](https://github.com/mrfigg/typedoc-plugins).
