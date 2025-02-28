import type { PluginOption, ResolvedConfig } from "vite"
import fs from "node:fs/promises"
import path from "node:path"

export function spheresViteContextPlugin(): PluginOption {
  const virtualModuleId = 'virtual:spheres/vite'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const fileReader = new NodeFileReader()
  let resolvedConfig: ResolvedConfig

  return {
    name: "spheres-vite-context",
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config
    },
    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return undefined
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return loadViteContext(fileReader, resolvedConfig)
      }
      return undefined
    }

  }
}

export interface FileReader {
  readFile(path: string): Promise<string | undefined>
}

class NodeFileReader implements FileReader {
  async readFile(path: string): Promise<string | undefined> {
    try {
      const buffer = await fs.readFile(path)
      return buffer.toString()
    } catch (err) {
      console.log(`Error reading file`, path, err)
      return undefined
    }
  }
}

export async function loadViteContext(fileReader: FileReader, config: ResolvedConfig): Promise<string> {
  if (config.command === "serve") {
    return `export const context = { command: "serve", manifest: undefined };`
  }

  const manifestConfig = config.environments.client.build.manifest

  if (!manifestConfig) {
    throw new Error("Spheres plugin requires environments.client.build.manifest to be true or a string specifying a filename")
  }

  const manifestPath = typeof manifestConfig === "boolean" ?
    buildManifestPath(config, ".vite", "manifest.json") :
    buildManifestPath(config, manifestConfig)

  const manifestContents = await fileReader.readFile(manifestPath)

  if (manifestContents === undefined) {
    throw new Error(`Spheres plugin could not find manifest file at ${manifestPath}`)
  }

  return `export const context = { command: "build", manifest: ${manifestContents} };`
}

function buildManifestPath(config: ResolvedConfig, ...pathParts: Array<string>): string {
  return path.join(config.root, config.environments.client.build.outDir, ...pathParts)
}