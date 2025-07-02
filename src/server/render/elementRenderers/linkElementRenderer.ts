import { Stateful } from "../../../store/index.js";
import { ViewConfig, ViewConfigDelegate } from "../../../view/render/viewConfig.js";
import { getTransformedResource, shouldTransformImport, ViteContext } from "../viteContext.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class LinkElementRenderer extends BaseElementRenderer {
  private configDelegate: LinkConfigDelegate
  
  constructor(viteContext: ViteContext | undefined) {
    super()
    this.configDelegate = new LinkConfigDelegate(viteContext)
  }

  getConfigDelegate(): ViewConfigDelegate | undefined {
    return this.configDelegate
  }
}

class LinkConfigDelegate implements ViewConfigDelegate {
  scriptSrc: string | Stateful<string> | undefined = undefined

  constructor(private viteContext: ViteContext | undefined) { }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "href" && shouldTransformImport(this.viteContext)) {
      if (typeof value === "function") {
        return config.attribute(name, (get) => {
          const src = value(get) ?? ""
          const transformedResource = getTransformedResource(this.viteContext!, "stylesheet", src)
          return transformedResource.src
        })
      } else {
        const transformedResource = getTransformedResource(this.viteContext, "stylesheet", value)
        return config.attribute(name, transformedResource.src)
      }
    }

    return config.attribute(name, value)
  }
}
