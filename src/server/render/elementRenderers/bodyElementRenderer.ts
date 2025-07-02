import { StateMap } from "../../../view/index.js";
import { HTMLTemplate } from "../template.js";
import { ViteContext } from "../viteContext.js";
import { getActivationTemplate } from "./activationElements.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class BodyElementRenderer extends BaseElementRenderer {
  constructor(
    private viteContext: ViteContext | undefined,
    private stateMap?: StateMap,
    private activationScripts?: Array<string>
  ) {
    super()
  }

  postChildrenTemplate(): HTMLTemplate {
    return getActivationTemplate({
      viteContext: this.viteContext,
      stateMap: this.stateMap,
      activationScripts: this.activationScripts
    })
  }
}