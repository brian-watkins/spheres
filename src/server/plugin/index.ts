import { PluginOption } from "vite";
import { spheresBuildPlugin, SpheresPluginOptions } from "./buildPlugin.js";
import { spheresInjectPlugin } from "./injectPlugin.js";
import { spheresViteContextPlugin } from "./viteContextPlugin.js";

export function spheres(options: SpheresPluginOptions): PluginOption {
  return [
    spheresInjectPlugin(),
    spheresViteContextPlugin(),
    spheresBuildPlugin(options)
  ]
}
