import { emptyTemplate, HTMLTemplate, templateFromString } from "../template.js";
import { shouldServeImport, ViteContext } from "../viteContext.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class HeadElementRenderer extends BaseElementRenderer {
  constructor(private viteContext: ViteContext | undefined) {
    super()
  }

  preChildrenTemplate(): HTMLTemplate {
    if (shouldServeImport(this.viteContext)) {
      return templateFromString(`<script type="module" src="/@vite/client"></script>`)
    } else {
      return emptyTemplate()
    }
  }
}