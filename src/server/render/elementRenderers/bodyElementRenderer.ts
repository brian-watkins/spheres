import { StateManifest } from "../../../store/serialize.js";
import { HTMLTemplate } from "../template.js";
import { ViteContext } from "../viteContext.js";
import { getActivationTemplate } from "./activationElements.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class BodyElementRenderer extends BaseElementRenderer {
  constructor(
    private viteContext: ViteContext | undefined,
    private stateManifest?: StateManifest,
    private activationScripts?: Array<string>
  ) {
    super()
  }

  postChildrenTemplate(): HTMLTemplate {
    return getActivationTemplate({
      viteContext: this.viteContext,
      stateManifest: this.stateManifest,
      activationScripts: this.activationScripts
    })
  }
}