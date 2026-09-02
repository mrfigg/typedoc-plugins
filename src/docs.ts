'use strict'

import { tmpdir } from 'node:os'
import {
  existsSync,
  rmSync,
  readdirSync,
  readFileSync,
  realpathSync,
  mkdtempSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Application, Renderer } from 'typedoc'

import { JSDOM } from 'jsdom'

/** @private */
export function load(app: Application) {
  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (!event.contents) {
      return
    }

    const dom = new JSDOM(event.contents)
    const window = dom.window
    const document = window.document

    const siteMenuNav = document.querySelector(
      'div.site-menu nav.tsd-navigation:last-child'
    )

    if (siteMenuNav) {
      siteMenuNav.replaceChildren()
    }

    event.contents = dom.serialize()
  })

  app.renderer.on(Renderer.EVENT_END, (event) => {
    rmSync(resolve(event.outputDirectory, 'modules.html'))
  })
}

const currentFilePath = realpathSync(fileURLToPath(import.meta.url))
const executingFilePath = realpathSync(resolve(process.argv[1]))

if (executingFilePath === currentFilePath) {
  ;(async () => {
    try {
      const pluginsDir = resolve('./plugins')
      const plugins = readdirSync(pluginsDir)

      const pluginsData: Record<
        string,
        {
          title: string
          description: string
          docsPath: string
          optionsPath: string
        }
      > = {}

      for (const plugin of plugins) {
        const pluginPath = resolve(pluginsDir, plugin)

        const packageJsonPath = resolve(pluginPath, 'package.json')

        const title = plugin
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

        const description = packageJson.description as string

        const docsPath = resolve('./docs', plugin)

        const optionsPath = resolve(pluginPath, 'typedoc.json')

        pluginsData[plugin] = {
          title,
          description,
          docsPath,
          optionsPath,
        }
      }

      const tempDir = mkdtempSync(resolve(tmpdir(), 'typedoc-plugins-'))

      let tempReadme = `# MrFigg's TypeDoc Plugins\n\n`
      // tempReadme += `\n\n---\n\n`

      for (const [plugin, { title, description }] of Object.entries(
        pluginsData
      )) {
        tempReadme += `### [${title}](./${plugin})\n\n`
        tempReadme += `[![NPM License](https://img.shields.io/npm/l/typedoc-plugin-${plugin})](https://www.npmjs.com/package/typedoc-plugin-${plugin}) `
        tempReadme += `[![NPM Version](https://img.shields.io/npm/v/typedoc-plugin-${plugin})](https://www.npmjs.com/package/typedoc-plugin-${plugin}) `
        tempReadme += `[![NPM dev or peer Dependency Version](https://img.shields.io/npm/dependency-version/typedoc-plugin-${plugin}/peer/typedoc)](https://www.npmjs.com/package/typedoc) `
        tempReadme += `[![GitHub Issues by label](https://img.shields.io/github/issues/mrfigg/typedoc-plugins/${plugin})](https://github.com/mrfigg/typedoc-plugins/issues) `
        tempReadme += `\n\n`
        tempReadme += `${description.replace(
          /A plugin for TypeDoc that ([a-z])/gi,
          (_, letter) => letter.toUpperCase()
        )}.\n\n`
        tempReadme += `\`\`\`sh\nnpm i -D typedoc-plugin-${plugin}\n\`\`\`\n`
        // tempReadme += `\n\n---\n\n`
      }

      const tempReadmePath = resolve(tempDir, 'README.md')

      writeFileSync(tempReadmePath, tempReadme, 'utf8')

      process.on('exit', () => {
        try {
          if (existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true })
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          // ignore error
        }
      })

      const configs: {
        options: string
        out: string
        readme?: string
      }[] = [
        {
          options: resolve('./typedoc.json').replace(/\\/g, '/'),
          out: resolve('./docs').replace(/\\/g, '/'),
          readme: tempReadmePath.replace(/\\/g, '/'),
        },
      ]

      for (const [, { docsPath, optionsPath }] of Object.entries(pluginsData)) {
        configs.push({
          options: optionsPath.replace(/\\/g, '/'),
          out: docsPath.replace(/\\/g, '/'),
        })
      }

      for (const config of configs) {
        console.log('Processing:', config.options)

        const app = await Application.bootstrapWithPlugins(config)

        const project = await app.convert()

        if (!project) {
          throw new Error(`Failed to convert ${config}`)
        }

        await app.generateDocs(project, app.options.getValue('out'))
      }
    } catch (err) {
      console.error(err)

      process.exit(1)
    }
  })()
}
