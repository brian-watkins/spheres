import type { PluginOption } from "vite"

export function spheresInjectPlugin(): PluginOption {
  const virtualModuleId = 'virtual:spheres/server'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: "spheres-inject",
    resolveId(source) {
      return source === virtualModuleId ? resolvedVirtualModuleId : undefined
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
import { createStringRenderer as internalCreateStringRenderer } from "spheres/server"
import { context } from "virtual:spheres/vite"

export function createStringRenderer(view) {
  return internalCreateStringRenderer(view, context)
}
`
      }
      return undefined
    },
    transform(code, id) {
      if (!code.includes(`"spheres/server"`) || id === resolvedVirtualModuleId) {
        return undefined
      }

      return {
        code: code.replaceAll("spheres/server", "virtual:spheres/server"),
        map: null
      }
    }
  }
}
