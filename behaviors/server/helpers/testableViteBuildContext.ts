import { spheres, SpheresPluginOptions } from "@server/index";
import { Context } from "best-behavior";
import { createBuilder } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const testableViteBuildContext: Context<TestViteBuildContext> = {
  init: () => new TestViteBuildContext()
}

class TestViteBuildContext {
  private html: string = ""

  async buildWithPlugin(root: string, pluginOptions: SpheresPluginOptions): Promise<void> {
    const builder = await createBuilder({
      configFile: false,
      appType: "custom",
      root: root,
      environments: {
        client: {
          build: {
            target: "esnext"
          }
        },
        server: {
          build: {
            target: "esnext"
          }
        }
      },
      plugins: [
        tsconfigPaths(),
        spheres(pluginOptions)
      ],
      logLevel: "warn"
    })
    
    await builder.buildApp()
  }

  async render(generator: () => Promise<string>): Promise<void> {
    this.html = await generator()
  }

  getRenderedHTML(): string {
    return this.html
  }
}