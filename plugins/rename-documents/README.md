# typedoc-plugin-rename-documents

[![NPM License](https://img.shields.io/npm/l/typedoc-plugin-rename-documents)](https://www.npmjs.com/package/typedoc-plugin-rename-documents) [![NPM Version](https://img.shields.io/npm/v/typedoc-plugin-rename-documents)](https://www.npmjs.com/package/typedoc-plugin-rename-documents) [![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/typedoc-plugin-rename-documents/peer/typedoc)](https://www.npmjs.com/package/typedoc) [![GitHub Issues by label](https://img.shields.io/github/issues/mrfigg/typedoc-plugins/rename-documents)](https://github.com/mrfigg/typedoc-plugins/issues)

A plugin for TypeDoc that renames documents without a yaml frontmatter section.

## Installation

```sh
npm install -D typedoc-plugin-rename-documents
```

## Example

A basic example is available at [https://mrfigg.github.io/typedoc-plugins/rename-documents](https://mrfigg.github.io/typedoc-plugins/rename-documents).

## Options

The following options are added to TypeDoc when the plugin is installed:

| Option              | Type                   | Default | Description                                                                                                        |
| ------------------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| **renameDocuments** | Record<string, string> | `{}`    | A mapping of document files to be renamed. The key is the path to the document file and the value is the new name. |

## Other Plugins

Check out my other plugins available at [https://github.com/mrfigg/typedoc-plugins](https://github.com/mrfigg/typedoc-plugins).
