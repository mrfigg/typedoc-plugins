'use strict'

import { Application, ParameterType, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'
import { parse as parseSemver } from 'semver'

/** @private */
export function load(app: Application) {
  app.options.addDeclaration({
    name: 'versionHeaderFormat',
    help: 'The format of the version number in the header',
    type: ParameterType.String,
    defaultValue: `v{{version}}`,
  })

  app.on(Application.EVENT_BOOTSTRAP_END, (app) => {
    app.options.setValue('includeVersion', true)
  })

  let header: string

  app.renderer.on(Renderer.EVENT_BEGIN, (event) => {
    if (!event.project.packageVersion) {
      return
    }

    const replacements: Record<string, string> = {
      name: event.project.name,
    }

    try {
      const data = parseSemver(event.project.packageVersion)

      if (!data) {
        throw 'abort'
      }

      for (const [key, value] of Object.entries(data)) {
        if (
          key === 'raw' ||
          (typeof value !== 'string' && typeof value !== 'number')
        ) {
          continue
        }

        replacements[key] = `${value}`
      }
    } catch {
      replacements['version'] = event.project.packageVersion
    }

    header = <string>app.options.getValue('versionHeaderFormat')

    if (!/{{name}}/.test(header)) {
      header = `{{name}} - ${header}`
    }

    for (const [key, value] of Object.entries(replacements)) {
      header = header.replace(new RegExp(`{{${key}}}`, 'gi'), value)
    }
  })

  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents || !header) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const toolbarTitle = document.querySelector(
      'header.tsd-page-toolbar a.title'
    )

    if (toolbarTitle) {
      toolbarTitle.textContent = header
    }

    const navigationAnchors = document.querySelectorAll('nav.tsd-navigation a')

    for (const navigationAnchor of navigationAnchors) {
      if (
        navigationAnchor &&
        navigationAnchor.textContent?.includes(event.project.name) &&
        navigationAnchor.textContent?.includes(event.project.packageVersion!)
      ) {
        navigationAnchor.textContent = event.project.name
      }
    }

    const pageTitleHeading = document.querySelector(
      'div.tsd-page-title h1, div.tsd-page-title h2, div.tsd-page-title h3, div.tsd-page-title h4, div.tsd-page-title h5, div.tsd-page-title h6'
    )

    if (
      pageTitleHeading &&
      pageTitleHeading.textContent?.includes(event.project.name) &&
      pageTitleHeading.textContent?.includes(event.project.packageVersion!)
    ) {
      pageTitleHeading.textContent = event.project.name
    }

    event.contents = dom.serialize()
  })
}
