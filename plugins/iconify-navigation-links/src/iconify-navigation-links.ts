'use strict'

import { readFileSync } from 'node:fs'

import { Application, ParameterType, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'
import { getIconsCSS } from '@iconify/utils'
import { locate } from '@iconify/json'

/** @private */
export function load(app: Application) {
  const defaultFontSize = `1.25em`

  app.options.addDeclaration({
    name: 'iconifyNavigationLinks',
    help: 'The navigation links to have their text be replaced with iconify icons',
    type: ParameterType.Object,
    defaultValue: {},
  })

  app.options.addDeclaration({
    name: 'iconifyNavigationLinksFontSize',
    help: `The font size of the icons in the navigation links`,
    type: ParameterType.String,
    defaultValue: defaultFontSize,
  })

  app.options.addDeclaration({
    name: 'iconifyNavigationLinksTooltips',
    help: `Whether or not to show tooltips when hovering over the icons in the navigation links`,
    type: ParameterType.Boolean,
    defaultValue: false,
  })

  const linkIcons: Record<string, string[]> = {}
  const iconsToLoad: Record<string, string[]> = {}
  const iconsLoaded: Record<string, boolean> = {}

  let compiledIconStyles = ''

  let addTooltip = false

  app.on(Application.EVENT_BOOTSTRAP_END, (app) => {
    const fontSize =
      (app.options.getValue('iconifyNavigationLinksFontSize') as string) ||
      defaultFontSize

    addTooltip = !!(app.options.getValue(
      'iconifyNavigationLinksTooltips'
    ) as boolean)

    for (const [linkTitle, iconSlug] of Object.entries(
      (app.options.getValue('iconifyNavigationLinks') ?? {}) as Record<
        string,
        string
      >
    )) {
      if (
        typeof linkTitle !== 'string' ||
        typeof iconSlug !== 'string' ||
        iconSlug.indexOf(':') === -1
      ) {
        continue
      }

      const [prefix, suffix] = iconSlug.split(':')

      linkIcons[linkTitle] = [prefix, suffix]

      if (!iconsToLoad[prefix]) {
        iconsToLoad[prefix] = []
      }

      if (!iconsToLoad[prefix].includes(suffix)) {
        iconsToLoad[prefix].push(suffix)
      }
    }

    for (const prefix in iconsToLoad) {
      try {
        const prefixJsonPath = locate(prefix)

        if (!prefixJsonPath) {
          throw new Error(`Could not locate: ${prefix}`)
        }

        const iconSet = JSON.parse(readFileSync(prefixJsonPath, 'utf8'))

        const css = getIconsCSS(iconSet, iconsToLoad[prefix], {
          iconSelector: '.iconify-navigation-links--{prefix}--{name}',
          commonSelector: '',
        })

        compiledIconStyles += css + '\n'

        iconsLoaded[prefix] = true
      } catch (err) {
        app.logger.error(
          `[iconify-navigation-links] Failed to generate Iconify CSS: ${err}`
        )
      }
    }

    compiledIconStyles = `
@layer iconify-navigation-links {
  .iconify-navigation-links-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  [class^="iconify-navigation-links--"] {
    font-size: ${fontSize};
    display: inline-block;
    vertical-align: middle;
  }

  a:has(> [class^="iconify-navigation-links--"]) {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
  }

  ${compiledIconStyles}
}`
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
  })

  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const style = document.createElement('style')
    style.textContent = compiledIconStyles
    document.querySelector('head')?.appendChild(style)

    const navigationLinks = document.querySelectorAll('div#tsd-toolbar-links a')

    for (const navigationLink of navigationLinks) {
      const linkTitle = navigationLink.textContent

      if (!linkIcons[linkTitle]) {
        continue
      }

      const [prefix, suffix] = linkIcons[linkTitle]

      if (!iconsLoaded[prefix]) {
        continue
      }

      const icon = document.createElement('span')
      icon.className = `iconify-navigation-links--${prefix}--${suffix}`
      icon.setAttribute('aria-hidden', 'true')

      const text = document.createElement('span')
      text.className = 'iconify-navigation-links-sr-only'
      text.textContent = linkTitle

      navigationLink.replaceChildren(icon, text)

      if (addTooltip) {
        navigationLink.setAttribute('title', linkTitle)
      }
    }

    event.contents = dom.serialize()
  })
}
