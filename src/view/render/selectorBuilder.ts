import { GetState, State } from "../../store/index.js";
import { ViewDefinition, ViewCaseSelector, ViewSelector, ViewConditionSelector } from "./viewRenderer.js";

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

  withUnion<T>(state: State<T>): ViewCaseSelector<T> {
    const index = this.templateSelectors.length
    const self = this

    return {
      when(typePredicate, viewGenerator) {
        self.templateSelectors.push({
          select: get => typePredicate(get(state)),
          template: () => self.createTemplate(viewGenerator(state as State<any>), index)
        })
        return this
      },
      default(viewGenerator) {
        self.defaultSelector = {
          select: () => true,
          template: () => self.createTemplate(viewGenerator(state), self.templateSelectors.length)
        }
      }
    }
  }

  withConditions(): ViewConditionSelector {
    const self = this
    
    return {
      when(predicate: (get: GetState) => boolean, view: ViewDefinition) {
        const index = self.templateSelectors.length
        self.templateSelectors.push({
          select: predicate,
          template: () => self.createTemplate(view, index)
        })
    
        return this
      },
      default(view: ViewDefinition): void {
        self.defaultSelector = {
          select: () => true,
          template: () => self.createTemplate(view, self.templateSelectors.length)
        }
      }
    }
  }

  protected abstract createTemplate(view: ViewDefinition, selectorId: number): T
  
}