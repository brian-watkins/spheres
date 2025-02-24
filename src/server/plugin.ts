import { Plugin, ResolvedConfig, UserConfig } from "vite"
import path from "node:path"
import fs from "node:fs/promises"

export interface SpheresPluginOptions {
  serverEntries: Record<string, string>
  clientEntries: Record<string, string>
}

export function spheres(options: SpheresPluginOptions): Plugin {
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
      if (id.includes("server/assetManifest")) {
        // need to handle other manifest paths
        const manifestPath = path.join(resolvedConfig.root, resolvedConfig.environments.client.build.outDir, ".vite", "manifest.json")
        const manifestJSON = await fs.readFile(manifestPath)
        
        return {
          code: `export const manifest = ${manifestJSON};`,
          map: null
        }
      }
      return undefined
    },
  }
}