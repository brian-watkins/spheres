import { buildStringRenderer } from "@server/render/stringRenderer";
import { createStore } from "@store/store";
import { HTMLView } from "@view/index";
import { Context } from "best-behavior";
import { Manifest } from "vite";

export const testableStringRendererContext: Context<TestableStringRenderer> = {
  init: () => new TestableStringRenderer()
}

class TestableStringRenderer {
  private manifest: Manifest | undefined = undefined
  private html: string = ""

  useManifest(manifest: Manifest) {
    this.manifest = manifest
  }

  renderView(view: HTMLView) {
    const renderer = buildStringRenderer(view, { viteContext: { command: "build", base: "/", manifest: this.manifest } })
    this.html = renderer(createStore())
  }

  getHTML(): string {
    return this.html
  }
}