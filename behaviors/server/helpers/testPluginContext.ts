import { FileReader, transformFile } from "@server/plugin";
import { Context } from "best-behavior";
import { TransformResult, UserConfig } from "vite";

export const testablePluginContext: Context<TestablePlugin> = {
  init: () => new TestablePlugin()
}

const defaultTestConfig = {
  root: "/project/root/",
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
  private resolvedConfig: Record<string, any> = { ...defaultTestConfig }
  private _transformResults: TransformResult | undefined
  private fileReader = new TestFileReader()

  withConfig(config: UserConfig): TestablePlugin {
    this.resolvedConfig = Object.assign(this.resolvedConfig, config)
    return this
  }

  withFile(path: string, contents: string): TestablePlugin {
    this.fileReader.addFile(path, contents)
    return this
  }

  async transformFile(path: string) {
    this._transformResults = await transformFile(this.fileReader, this.resolvedConfig as any, path)
  }

  get transformResults(): TransformResult | undefined {
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