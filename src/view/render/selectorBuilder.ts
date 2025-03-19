import { GetState } from "../../store/index.js";
import { ViewDefinition, ViewSelector } from "./viewRenderer.js";

export interface TemplateSelector<T> {
  select: (get: GetState) => boolean
  template: () => T
}

export abstract class AbstractSelectorBuilder<T> implements ViewSelector {
  private templateSelectors: Array<TemplateSelector<T>> = []
  private defaultSelector: TemplateSelector<T> | undefined = undefined

  get selectors(): Array<TemplateSelector<T>> {
    const selectors = [ ...this.templateSelectors ]

    if (this.defaultSelector) {
      selectors.push(this.defaultSelector)
    }

    return selectors
  }

  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this {
    const index = this.templateSelectors.length
    this.templateSelectors.push({
      select: predicate,
      template: () => this.createTemplate(view, index)
    })

    return this
  }
  
  default(view: ViewDefinition): void {
    this.defaultSelector = {
      select: () => true,
      template: () => this.createTemplate(view, this.templateSelectors.length)
    }
  }

  protected abstract createTemplate(view: ViewDefinition, selectorId: number): T
  
}
