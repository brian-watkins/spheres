import { stringifyVirtualNode } from "@server/render/renderToString";
import { SSRBuilder } from "@server/render/ssrBuilder";
import { createStore, getTokenRegistry } from "@store/store";
import { HTMLView } from "@view/index";
import { IdSequence } from "@view/render/idSequence";
import { Context } from "best-behavior";
import { Manifest } from "vite";

export const testableSSRBuilderContext: Context<TestableSSRBuilder> = {
  init: () => new TestableSSRBuilder()
}

class TestableSSRBuilder {
  private manifest: Manifest | undefined = undefined
  private html: string = ""

  useManifest(manifest: Manifest) {
    this.manifest = manifest
  }

  renderView(view: HTMLView) {
    const tokenRegistry = getTokenRegistry(createStore())
    const builder = new SSRBuilder(tokenRegistry, this.manifest)
    builder.subview(view)
    this.html = stringifyVirtualNode(tokenRegistry, new IdSequence(), builder.toVirtualNode())
  }

  getHTML(): string {
    return this.html
  }
}