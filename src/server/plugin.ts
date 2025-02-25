import { Plugin, ResolvedConfig, TransformResult, UserConfig } from "vite"
import path from "node:path"
import fs from "node:fs/promises"

export interface SpheresPluginOptions {
  serverEntries: Record<string, string>
  clientEntries: Record<string, string>
}

export function spheres(options: SpheresPluginOptions): Plugin {
  const fileReader = new NodeFileReader()
  let resolvedConfig: ResolvedConfig

  return {
    name: 'spheres',
    config(): UserConfig {
      return {
        appType: "custom",
        environments: {
          server: {
            build: {
              emptyOutDir: false,
              rollupOptions: {
                input: options.serverEntries
              }
            }
          },
          client: {
            build: {
              manifest: true,
              rollupOptions: {
                input: options.clientEntries
              }
            }
          }
        },
        builder: {
          async buildApp(builder) {
            await builder.build(builder.environments.client)
            await builder.build(builder.environments.server)
          },
        }
      }
    },
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config
    },
    async transform(_, id) {
      return transformFile(fileReader, resolvedConfig, id)
    },
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

export async function transformFile(fileReader: FileReader, config: ResolvedConfig, id: string): Promise<TransformResult | undefined> {
  if (!assetManifestModuleRegex.test(id)) {
    return undefined
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

  return {
    code: `export const manifest = ${manifestContents};`,
    map: null
  }
}

const assetManifestModuleRegex = /\/server\/assetManifest\.(ts|js)$/

function buildManifestPath(config: ResolvedConfig, ...pathParts: Array<string>): string {
  return path.join(config.root, config.environments.client.build.outDir, ...pathParts)
}