import { BasicElementConfigSupport, ElementConfigSupport } from "../../../view/elementSupport.js"
import { ShadowRootConfigSupport } from "../../../view/render/shadowRootConfig.js"
import { BaseElementRenderer } from "./elementRenderer.js"

export class ShadowRootTemplateRenderer extends BaseElementRenderer {
  private configSupport = new ShadowRootConfigSupport(new BasicElementConfigSupport())

  getConfigSupport(): ElementConfigSupport | undefined {
    return this.configSupport
  }
}
