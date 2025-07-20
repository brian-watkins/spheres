import { Stateful } from "../../../store/index.js";
import { ElementConfig, ElementConfigSupport } from "../../../view/elementSupport.js";
import { getTransformedResource, shouldTransformImport, ViteContext } from "../viteContext.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class LinkElementRenderer extends BaseElementRenderer {
  private configSupport: LinkConfigSupport

  constructor(viteContext: ViteContext | undefined) {
    super()
    this.configSupport = new LinkConfigSupport(viteContext)
  }

  getConfigSupport(): ElementConfigSupport | undefined {
    return this.configSupport
  }
}

class LinkConfigSupport implements ElementConfigSupport {
  scriptSrc: string | Stateful<string> | undefined = undefined

  constructor(private viteContext: ViteContext | undefined) { }

  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "href" && shouldTransformImport(this.viteContext)) {
      const value = args[0]
      if (typeof value === "function") {
        config.attribute(name, (get) => {
          const src = value(get) ?? ""
          const transformedResource = getTransformedResource(this.viteContext!, "stylesheet", src)
          return transformedResource.src
        })
      } else {
        const transformedResource = getTransformedResource(this.viteContext, "stylesheet", value)
        config.attribute(name, transformedResource.src)
      }
    }

    config.attribute(name, args[0])
  }
}
