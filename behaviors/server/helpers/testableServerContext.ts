import { Context } from "best-behavior";
import { createBuilder } from "vite";
import { spheres } from "../../../src/server/plugin"
import tsconfigPaths from "vite-tsconfig-paths";

export const testableServerContext: Context<TestServerContext> = {
  init: () => new TestServerContext()
}

class TestServerContext {
  private html: string = ""

  // should provide filenames here for special cases
  // like if the path is relative and starts with `./`
  // or etc or not loading an entry point etc.
  // or the client entry contains css or other imports or dynamic imports
  async buildServerRenderer(): Promise<void> {
    const builder = await createBuilder({
      configFile: false,
      appType: "custom",
      root: "./behaviors/server/fixtures/ssrApp/plugin",
      plugins: [
        tsconfigPaths(),
        spheres({
          serverEntries: {
            renderer: "./behaviors/server/fixtures/ssrApp/plugin/renderer.ts"
          },
          clientEntries: {
            activate: "./behaviors/server/fixtures/ssrApp/plugin/activate.ts",
            styles: "./behaviors/server/fixtures/ssrApp/plugin/styles.css"
          }
        })
      ]
    })
    
    await builder.buildApp()
  }

  async render(): Promise<void> {
    //@ts-ignore
    const { renderHTML } = await import("../fixtures/ssrApp/plugin/dist/renderer.js")
    this.html = renderHTML()
  }

  getRenderedHTML(): string {
    return this.html
  }

}