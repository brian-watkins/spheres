import type { BuildEnvironmentOptions, PluginOption, UserConfig } from "vite"

export interface BuildPluginOptions {
  server?: {
    entries?: Record<string, string>,
    build?: BuildEnvironmentOptions
  },
  client?: {
    entries?: Record<string, string>,
    build?: BuildEnvironmentOptions
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
            build: serverBuildOptions(options)
          },
          client: {
            build: clientBuildOptions(options)
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

function serverBuildOptions(options: BuildPluginOptions) {
  const defaultBuildOptions = {
    emptyOutDir: false,
    rollupOptions: {
      input: options.server?.entries
    }
  }

  return Object.assign(defaultBuildOptions, options.server?.build)
}

function clientBuildOptions(options: BuildPluginOptions) {
  const defaultBuildOptions = {
    manifest: true,
    rollupOptions: {
      input: options.client?.entries
    }
  }

  return Object.assign(defaultBuildOptions, options.client?.build, { manifest: true })
}