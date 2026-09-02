'use strict'

import { Application, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'
import { emojify } from 'node-emoji'

/** @private */
export function load(app: Application) {
  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const walker = document.createTreeWalker(document, 0x4)

    while (walker.nextNode()) {
      const node = walker.currentNode

      if (!node.nodeValue) {
        continue
      }

      if (node.parentElement?.closest('code')) {
        continue
      }

      node.nodeValue = emojify(node.nodeValue)
    }

    event.contents = dom.serialize()
  })
}
