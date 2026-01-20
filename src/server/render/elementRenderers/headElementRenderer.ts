import { prepareForStreaming } from "../../../view/activate.js";
import { emptyTemplate, HTMLTemplate, templateFromString } from "../template.js";
import { shouldServeImport, ViteContext } from "../viteContext.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class HeadElementRenderer extends BaseElementRenderer {
  constructor(private viteContext: ViteContext | undefined, private isStreaming: boolean) {
    super()
  }

  preChildrenTemplate(): HTMLTemplate {
    if (shouldServeImport(this.viteContext)) {
      return templateFromString(`<script type="module" src="/@vite/client"></script>`)
    } else {
      return emptyTemplate()
    }
  }

  postChildrenTemplate(): HTMLTemplate {
    if (this.isStreaming) {
      return templateFromString(`<script>(${prepareForStreaming.toString()})();</script>`)
    } else {
      return emptyTemplate()
    }
  }
}