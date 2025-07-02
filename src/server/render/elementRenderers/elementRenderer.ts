import { ViewConfigDelegate } from "../../../view/render/viewConfig.js"
import { emptyTemplate, HTMLTemplate } from "../template.js"

export interface ElementRenderer {
  getConfigDelegate(): ViewConfigDelegate | undefined
  preTagTemplate(): HTMLTemplate
  preChildrenTemplate(): HTMLTemplate
  postChildrenTemplate(): HTMLTemplate
  postTagTemplate(): HTMLTemplate
}

export class BaseElementRenderer implements ElementRenderer {
  getConfigDelegate(): ViewConfigDelegate | undefined {
    return undefined
  }

  preTagTemplate(): HTMLTemplate {
    return emptyTemplate()
  }

  preChildrenTemplate(): HTMLTemplate {
    return emptyTemplate()
  }

  postChildrenTemplate(): HTMLTemplate {
    return emptyTemplate()
  }

  postTagTemplate(): HTMLTemplate {
    return emptyTemplate()
  }
}

