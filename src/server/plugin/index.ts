import type { BuildEnvironmentOptions, PluginOption } from "vite";
import { spheresBuildPlugin } from "./buildPlugin.js";
import { spheresInjectPlugin } from "./injectPlugin.js";
import { spheresViteContextPlugin } from "./viteContextPlugin.js";

export interface SpheresPluginOptions {
  server?: {
    entries?: Record<string, string>
    build?: BuildEnvironmentOptions
  },
  client?: {
    entries?: Record<string, string>
    build?: BuildEnvironmentOptions
  }
}

export function spheres(options: SpheresPluginOptions = {}): PluginOption {
  return [
    spheresInjectPlugin(),
    spheresViteContextPlugin(),
    spheresBuildPlugin(options)
  ]
}
