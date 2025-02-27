import type { PluginOption, ResolvedConfig, TransformResult } from "vite"

export function spheresServePlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig

  return {
    name: 'spheres-serve',
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config
    },
    async transform(_, id) {
      return transformDecorateHead(resolvedConfig, id)
    },
  }
}

export async function transformDecorateHead(config: ResolvedConfig, id: string): Promise<TransformResult | undefined> {
  if (config.command === "build" || !decorateHeadModuleRegex.test(id)) {
    return undefined
  }
  
  return {
    code: `export function decorateHead(el) { el.children.script(s => { s.config.type("module").src("/@vite/client") } ) };`,
    map: null
  }
}

const decorateHeadModuleRegex = /\/server\/render\/decorateHead\.(ts|js)$/

