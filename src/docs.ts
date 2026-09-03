'use strict'

import { tmpdir } from 'node:os'
import {
  existsSync,
  rmSync,
  readdirSync,
  readFileSync,
  mkdtempSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'

import { Application, Renderer, TypeDocOptions } from 'typedoc'
import { load as loadReplaceTextPlugin } from 'typedoc-plugin-replace-text'

import { JSDOM } from 'jsdom'

interface TypeDocConfig {
  options: string
  out: string
  readme?: string
  githubPages?: boolean
  plugin: ((app: Application) => void)[]
  replaceText?: {
    replacements: {
      pattern: string
      flags?: string
      replace: string
    }[]
  }
}

function loadRemoveEmptyModulesPlugin(app: Application) {
  app.renderer.on(Renderer.EVENT_END_PAGE, (event) => {
    if (
      !event.contents ||
      event.project.children?.length ||
      event.project.documents?.length
    ) {
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
    if (event.project.children?.length || event.project.documents?.length) {
      return
    }

    rmSync(resolve(event.outputDirectory, 'modules.html'))
  })
}

;(async () => {
  try {
    const tempDir = mkdtempSync(resolve(tmpdir(), 'typedoc-plugins-'))

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

    const tempReadmePath = resolve(tempDir, 'README.md')

    let tempReadme = `# MrFigg's TypeDoc Plugins\n\n`

    const configs: TypeDocConfig[] = [
      {
        options: resolve('./typedoc.json').replace(/\\/g, '/'),
        out: resolve('./docs').replace(/\\/g, '/'),
        readme: tempReadmePath.replace(/\\/g, '/'),
        plugin: [loadRemoveEmptyModulesPlugin],
      },
    ]

    const pluginsDir = resolve('./plugins')
    const plugins = readdirSync(pluginsDir)

    for (const plugin of plugins) {
      const pluginPath = resolve(pluginsDir, plugin)

      const packageJsonPath = resolve(pluginPath, 'package.json')

      const title = plugin
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      const description = packageJson.description as string

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

      const examplePath = resolve(pluginPath, 'EXAMPLE.md')

      const exampleContent = !existsSync(examplePath)
        ? undefined
        : readFileSync(examplePath, 'utf8')

      const optionsPath = resolve(pluginPath, 'typedoc.json')

      const options = JSON.parse(readFileSync(optionsPath, 'utf8'))

      const replaceText = options.replaceText || {}
      replaceText.replacements = replaceText.replacements || []

      if (exampleContent) {
        replaceText.replacements = replaceText.replacements.filter(
          (replacement: { pattern: string; replace: string }) => {
            return (
              replacement.pattern !== '#+ Example(?:(?!^#).)*' &&
              replacement.replace !== ''
            )
          }
        )

        replaceText.replacements.push({
          pattern: '(?<=^\\s*#+\\s+Example\\n)(?:(?!^#).)*',
          flags: 'gmis',
          replace: `\n${exampleContent}\n`,
        })
      }

      replaceText.replacements.push({
        pattern:
          'available at \\[https?:\\/\\/(www\\.)?github\\.com\\/mrfigg\\/typedoc-plugins\\/?[^\\]]*\\]\\(https?:\\/\\/(www\\.)?github\\.com\\/mrfigg\\/typedoc-plugins\\/?[^)]*\\)',
        flags: 'gmis',
        replace: '[here](../)',
      })

      configs.push({
        options: optionsPath.replace(/\\/g, '/'),
        out: resolve('./docs', plugin).replace(/\\/g, '/'),
        githubPages: false,
        plugin: [
          ...(options.plugin?.includes('typedoc-plugin-replace-text')
            ? []
            : [loadReplaceTextPlugin]),
        ],
        replaceText: replaceText,
      })
    }

    writeFileSync(tempReadmePath, tempReadme, 'utf8')

    for (const config of configs) {
      console.log('Processing:', config.options)

      const bootstrapConfig: Partial<TypeDocConfig> = { ...config }
      delete bootstrapConfig.plugin

      const app = await Application.bootstrapWithPlugins(
        // replaceText types seem to be broken, use workaround
        bootstrapConfig as unknown as TypeDocOptions
      )

      for (const loadPlugin of config.plugin) {
        loadPlugin(app)
      }

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
