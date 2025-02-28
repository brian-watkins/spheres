import type { PluginOption, UserConfig } from "vite"

export interface SpheresPluginOptions {
  serverEntries?: Record<string, string>
  clientEntries?: Record<string, string>
}

export function spheresBuildPlugin(options: SpheresPluginOptions = {}): PluginOption {
  return {
    name: 'spheres-build',
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
    }
  }
}