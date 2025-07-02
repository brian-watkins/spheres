import { Stateful } from "../../../store/index.js";
import { runQuery } from "../../../store/tokenRegistry.js";
import { BooleanAttributesDelegate } from "../../../view/render/htmlDelegate.js";
import { ViewConfig, ViewConfigDelegate } from "../../../view/render/viewConfig.js";
import { addTemplate, emptyTemplate, HTMLTemplate, stringForTemplate, templateFromStateful } from "../template.js";
import { getExtraResources, getTransformedResource, shouldTransformImport, ViteContext } from "../viteContext.js";
import { templateForResource } from "./activationElements.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class ScriptElementRenderer extends BaseElementRenderer {
  private configDelegate: ScriptConfigDelegate

  constructor(private viteContext: ViteContext | undefined) {
    super()
    this.configDelegate = new ScriptConfigDelegate(viteContext)
  }

  getConfigDelegate(): ViewConfigDelegate | undefined {
    return this.configDelegate
  }

  postTagTemplate(): HTMLTemplate {
    if (this.configDelegate.scriptSrc !== undefined && shouldTransformImport(this.viteContext)) {
      const scriptSrc = this.configDelegate.scriptSrc
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

class ScriptConfigDelegate extends BooleanAttributesDelegate {
  scriptSrc: string | Stateful<string> | undefined = undefined

  constructor(private viteContext: ViteContext | undefined) {
    super()
  }

  defineAttribute(config: ViewConfig, name: string, value: string | Stateful<string>): ViewConfig {
    if (name === "src" && shouldTransformImport(this.viteContext)) {
      this.scriptSrc = value
      if (typeof value === "function") {
        return config.attribute(name, (get) => {
          const src = value(get) ?? ""
          const transformedResource = getTransformedResource(this.viteContext!, "script", src)
          return transformedResource.src
        })
      } else {
        const transformedResource = getTransformedResource(this.viteContext, "script", value)
        return config.attribute(name, transformedResource.src)
      }
    }

    return super.defineAttribute(config, name, value)
  }
}
