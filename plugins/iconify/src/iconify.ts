'use strict'

import { readFileSync } from 'node:fs'

import { Application, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'
import { getIconsCSS } from '@iconify/utils'
import { locate } from '@iconify/json'

/** @private */
export function load(app: Application) {
  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const loadedIcons: Record<string, string[]> = {}

    let style: HTMLStyleElement | undefined

    const loadIcon = (prefix: string, suffix: string) => {
      if (loadedIcons[prefix]?.includes(suffix)) {
        return
      }

      try {
        const prefixJsonPath = locate(prefix)

        if (!prefixJsonPath) {
          throw new Error(`Could not locate: ${prefix}`)
        }

        const iconSet = JSON.parse(readFileSync(prefixJsonPath, 'utf8'))

        const css = getIconsCSS(iconSet, [suffix], {
          iconSelector: '.iconify--{prefix}--{name}',
          commonSelector: '',
        })

        if (!style) {
          style = document.createElement('style')
          document.querySelector('head')?.appendChild(style)
        }

        style.textContent += `\n${css}`

        if (!loadedIcons[prefix]) {
          loadedIcons[prefix] = []
        }

        loadedIcons[prefix].push(suffix)
      } catch (err) {
        app.logger.error(`[iconify] Failed to generate Iconify CSS: ${err}`)
      }
    }

    const iconify = (
      text: string
    ): { nodes: Node[]; style?: HTMLStyleElement } => {
      const regex = /:([a-z0-9-_]+):([a-z0-9-_]+):/gi
      const nodes: Node[] = []

      let lastIndex = 0
      let match

      while ((match = regex.exec(text)) !== null) {
        const matchIndex = match.index
        const [, prefix, suffix] = match

        loadIcon(prefix, suffix)

        if (matchIndex > lastIndex) {
          nodes.push(
            document.createTextNode(text.substring(lastIndex, matchIndex))
          )
        }

        const icon = document.createElement('i')
        icon.className = `iconify--${prefix}--${suffix}`
        nodes.push(icon)

        lastIndex = regex.lastIndex
      }

      if (lastIndex < text.length) {
        nodes.push(document.createTextNode(text.substring(lastIndex)))
      }

      return { nodes, style }
    }

    const walker = document.createTreeWalker(document, 0x4)
    const textNodes: Set<SVGTextContentElement | Text> = new Set()

    while (walker.nextNode()) {
      const node = walker.currentNode as Text

      if (
        !node.nodeValue ||
        !/:[a-z0-9-_]+:[a-z0-9-_]+:/i.test(node.nodeValue)
      ) {
        continue
      }

      if (node.parentElement?.closest('code')) {
        continue
      }

      textNodes.add(node)
    }

    for (const node of textNodes) {
      const { nodes: newNodes, style: newStyle } = iconify(node.nodeValue!)

      if (newNodes.length > 0) {
        const fragment = document.createDocumentFragment()
        newNodes.forEach((newNode) => fragment.appendChild(newNode))
        node.replaceWith(fragment)
      }

      if (newStyle) {
        style = newStyle
      }
    }

    if (style) {
      style.textContent = `@layer iconify {${style.textContent}}`
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    }

    event.contents = dom.serialize()
  })
}
