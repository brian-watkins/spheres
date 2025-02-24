import { Context } from "best-behavior";
import { createBuilder } from "vite";
import { spheres, SpheresPluginOptions } from "../../../src/server/plugin"
import tsconfigPaths from "vite-tsconfig-paths";

export const testableServerContext: Context<TestServerContext> = {
  init: () => new TestServerContext()
}

class TestServerContext {
  private html: string = ""

  async buildServerRenderer(pluginOptions: SpheresPluginOptions): Promise<void> {
    const builder = await createBuilder({
      configFile: false,
      appType: "custom",
      root: "./behaviors/server/fixtures/ssrApp/plugin",
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