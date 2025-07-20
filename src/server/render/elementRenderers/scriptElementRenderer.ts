import { Stateful } from "../../../store/index.js";
import { runQuery } from "../../../store/tokenRegistry.js";
import { BasicElementConfigSupport, ElementConfig, ElementConfigSupport } from "../../../view/elementSupport.js";
import { addTemplate, emptyTemplate, HTMLTemplate, stringForTemplate, templateFromStateful } from "../template.js";
import { getExtraResources, getTransformedResource, shouldTransformImport, ViteContext } from "../viteContext.js";
import { templateForResource } from "./activationElements.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class ScriptElementRenderer extends BaseElementRenderer {
  private configSupport: ScriptConfigSupport

  constructor(private viteContext: ViteContext | undefined) {
    super()
    this.configSupport = new ScriptConfigSupport(viteContext, new BasicElementConfigSupport())
  }

  getConfigSupport(): ElementConfigSupport | undefined {
    return this.configSupport
  }

  postTagTemplate(): HTMLTemplate {
    if (this.configSupport.scriptSrc !== undefined && shouldTransformImport(this.viteContext)) {
      const scriptSrc = this.configSupport.scriptSrc
      if (typeof scriptSrc === "function") {
        return templateFromStateful((registry) => {
          const src = runQuery(registry, scriptSrc) ?? ""
          const extraResources = getExtraResources(this.viteContext!, "script", src)
          let template = emptyTemplate()
          for (const resource of extraResources) {
            template = addTemplate(template, templateForResource(resource))
          }
          return stringForTemplate(registry, template)
        })
      } else {
        let template = emptyTemplate()
        const extraResources = getExtraResources(this.viteContext, "script", scriptSrc)
        for (const resource of extraResources) {
          template = addTemplate(template, templateForResource(resource))
        }
        return template
      }
    }

    return emptyTemplate()
  }
}

class ScriptConfigSupport implements ElementConfigSupport {
  scriptSrc: string | Stateful<string> | undefined = undefined

  constructor(private viteContext: ViteContext | undefined, private next: ElementConfigSupport) { }

  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "src" && shouldTransformImport(this.viteContext)) {
      const value = args[0]
      this.scriptSrc = value
      if (typeof value === "function") {
        config.attribute(name, (get) => {
          const src = value(get) ?? ""
          const transformedResource = getTransformedResource(this.viteContext!, "script", src)
          return transformedResource.src
        })
      } else {
        const transformedResource = getTransformedResource(this.viteContext, "script", value)
        config.attribute(name, transformedResource.src)
      }
    } else {
      this.next.configure(config, name, args)
    }
  }
}
