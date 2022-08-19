import { normalizePath, Plugin } from 'vite'
import getEtag from 'etag'
import cors from 'cors'
import { scanDir, FileStats, ScanDirOptions } from 'svg-sprite-scan'

const IdHtml = 'virtual:svg-icons-ssr-html'
const IdNames = 'virtual:svg-icons-ssr-names'

export interface ViteSvgIconsPlugin extends ScanDirOptions {
  scanDir: string
}

export function createSvgIconsSsrPlugin(options: ViteSvgIconsPlugin): Plugin {
  const cache = new Map<string, FileStats>()

  // let isBuild = false

  return {
    name: 'vite:svg-icons-ssr',

    configResolved(resolvedConfig) {
      // isBuild = resolvedConfig.command === 'build'
    },

    resolveId(id) {
      if ([IdHtml, IdNames].includes(id)) {
        return id
      }
      return null
    },

    async load(id) {
      const { html, names } = await createModuleCode(cache, options)
      if (id.endsWith(IdHtml)) {
        return html
      }
      if (id.endsWith(IdNames)) {
        return names
      }
    },

    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)
        const htmlId = `/@id/${IdHtml}`
        const clientId = `/@id/${IdNames}`
        if ([clientId, htmlId].some(item => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { html, names } = await createModuleCode(cache, options)
          const content = url.endsWith(htmlId) ? html : names
          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        } else {
          next()
        }
      })
    }
  }
}

export const createModuleCode = async (cache: Map<string, FileStats>, options: ViteSvgIconsPlugin) => {
  const { svgHtml, idSet } = await scanDir(options.scanDir, cache, options)
  return {
    html: `export default ${JSON.stringify(svgHtml)}`,
    names: `export default ${JSON.stringify(Array.from(idSet))}`
  }
}
