'use strict'

import { resolve, dirname } from 'node:path'

import { Application, ParameterType, ReflectionKind, Converter } from 'typedoc'

/** @private */
export function load(app: Application) {
  app.options.addDeclaration({
    name: 'renameDocuments',
    help: 'A Record<string, string> of document files to be renamed and their new names',
    type: ParameterType.Object,
    defaultValue: {},
  })

  const renameDocuments: Record<string, string> = {}

  app.converter.on(Converter.EVENT_BEGIN, () => {
    const optionsPath = app.options.getValue('options')

    const baseDir =
      typeof optionsPath === 'string' && optionsPath
        ? dirname(resolve(optionsPath))
        : process.cwd()

    for (const [file, name] of Object.entries(
      (app.options.getValue('renameDocuments') ?? {}) as Record<string, string>
    )) {
      if (typeof file !== 'string' || typeof name !== 'string') {
        continue
      }

      const resolvedFile = resolve(baseDir, file).replace(/\\/g, '/')

      renameDocuments[resolvedFile] = name
    }
  })

  app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) => {
    if (reflection.kind !== ReflectionKind.Document) {
      return
    }

    const reflectionPath = context.project.files.getReflectionPath(reflection)

    if (!reflectionPath || !renameDocuments[reflectionPath]) {
      return
    }

    reflection.name = renameDocuments[reflectionPath]
  })
}
