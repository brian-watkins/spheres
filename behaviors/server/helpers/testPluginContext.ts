import { FileReader, loadViteContext } from "@server/plugin/buildPlugin";
import { Context } from "best-behavior";
import { ResolvedConfig, UserConfig } from "vite";

export const testablePluginContext: Context<TestablePlugin> = {
  init: () => new TestablePlugin()
}

export type TestableResolvedConfig = UserConfig & { command: "serve" | "build" }

const defaultTestConfig: TestableResolvedConfig = {
  root: "/project/root/",
  command: "build",
  environments: {
    client: {
      build: {
        outDir: "dist",
        manifest: true
      }
    }
  }
}

class TestablePlugin {
  private resolvedConfig: TestableResolvedConfig = { ...defaultTestConfig }
  private _transformResults: string | undefined
  private fileReader = new TestFileReader()

  withConfig(config: TestableResolvedConfig): TestablePlugin {
    this.resolvedConfig = Object.assign(this.resolvedConfig, config)
    return this
  }

  withFile(path: string, contents: string): TestablePlugin {
    this.fileReader.addFile(path, contents)
    return this
  }

  async loadViteContext() {
    this._transformResults = await loadViteContext(
      this.fileReader,
      this.resolvedConfig as unknown as ResolvedConfig,
    )
  }

  get viteContext(): string | undefined {
    return this._transformResults
  }
}

class TestFileReader implements FileReader {
  private files: Map<string, string> = new Map()

  addFile(path: string, contents: string) {
    this.files.set(path, contents)
  }

  async readFile(path: string): Promise<string | undefined> {
    return this.files.get(path)
  }
}