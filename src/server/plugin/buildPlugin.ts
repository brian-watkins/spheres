import type { PluginOption, UserConfig } from "vite"

export interface BuildPluginOptions {
  server?: {
    entries?: Record<string, string>
  },
  client?: {
    entries?: Record<string, string>
  }
}

export function spheresBuildPlugin(options: BuildPluginOptions): PluginOption {
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
                input: options.server?.entries
              }
            }
          },
          client: {
            build: {
              manifest: true,
              rollupOptions: {
                input: options.client?.entries
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