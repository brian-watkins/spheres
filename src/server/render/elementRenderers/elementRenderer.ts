import { ElementConfigSupport } from "../../../view/elementSupport.js"
import { emptyTemplate, HTMLTemplate } from "../template.js"

export interface ElementRenderer {
  getConfigSupport(): ElementConfigSupport | undefined
  preTagTemplate(): HTMLTemplate
  preChildrenTemplate(): HTMLTemplate
  postChildrenTemplate(): HTMLTemplate
  postTagTemplate(): HTMLTemplate
}

export class BaseElementRenderer implements ElementRenderer {
  getConfigSupport(): ElementConfigSupport | undefined {
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

