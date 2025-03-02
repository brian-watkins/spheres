import { spheres, SpheresPluginOptions } from "@server/index";
import { Context } from "best-behavior";
import { createBuilder } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const testableViteBuildContext: Context<TestViteBuildContext> = {
  init: () => new TestViteBuildContext()
}

class TestViteBuildContext {
  private html: string = ""
  private base: string | undefined

  setBase(base: string): TestViteBuildContext {
    this.base = base
    return this
  }

  async buildWithPlugin(root: string, pluginOptions: SpheresPluginOptions): Promise<void> {
    const builder = await createBuilder({
      configFile: false,
      root: root,
      base: this.base,
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