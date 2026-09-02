'use strict'

import { Application, PageKind, ReflectionKind, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'

/** @private */
export function load(app: Application) {
  app.on(Application.EVENT_BOOTSTRAP_END, (app) => {
    app.options.setValue('headings', {
      ...app.options.getValue('headings'),
      document: true,
    })
  })

  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents || event.pageKind !== PageKind.Document) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const title = document.querySelector('div.tsd-page-title')

    if (!title) {
      return
    }

    const heading = title.querySelector(':scope > h1')

    if (!heading) {
      return
    }

    const breadcrumbs = title.querySelector(':scope > ul.tsd-breadcrumb')

    if (!breadcrumbs) {
      return
    }

    const anchors = breadcrumbs.querySelectorAll('a')

    if (!anchors || !anchors.length) {
      return
    }

    const anchor = anchors[anchors.length - 1]

    if (!anchor.textContent) {
      return
    }

    heading.textContent = `${ReflectionKind.singularString(ReflectionKind.Document)} ${anchor.textContent}`

    event.contents = dom.serialize()
  })
}
