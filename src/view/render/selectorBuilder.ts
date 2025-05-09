import { GetState, State } from "../../store/index.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { createStatePublisher, OverlayTokenRegistry, runQuery, StateListener, StatePublisher, TokenRegistry } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewCaseSelector, ViewSelector, ViewConditionSelector } from "./viewRenderer.js";

export interface TemplateConditionSelector<T> {
  type: "condition-selector"
  select: (get: GetState) => boolean
  template: () => T
}

export interface TemplateContext<T> {
  template: T
  overlayRegistry: (registry: TokenRegistry) => TokenRegistry
}

export interface TemplateCaseSelector<T> {
  type: "case-selector"
  select: (get: GetState) => boolean
  templateContext: () => TemplateContext<T>
}

export type TemplateSelector<T> = TemplateCaseSelector<T> | TemplateConditionSelector<T>

export class SelectorBuilder<T> implements ViewSelector {
  private templateSelectors: Array<TemplateSelector<T>> = []
  private defaultSelector: TemplateSelector<T> | undefined = undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T) { }

  get selectors(): Array<TemplateSelector<T>> {
    const selectors = [...this.templateSelectors]

    if (this.defaultSelector) {
      selectors.push(this.defaultSelector)
    }

    return selectors
  }

  withUnion<T>(state: State<T>): ViewCaseSelector<T> {
    const self = this

    return {
      when(typePredicate, viewGenerator) {
        const index = self.templateSelectors.length
        const selector = (get: GetState) => typePredicate(get(state))
        self.templateSelectors.push({
          type: "case-selector",
          select: selector,
          templateContext: memoize(() => {
            let template!: any
            const tokens = recordTokens(() => {
              template = self.createTemplate(viewGenerator(state as State<any>), index)
            })

            return {
              template,
              overlayRegistry: (registry) => {
                return new CaseViewOverlayTokenRegistry(registry, selector, tokens)
              },
            }
          })
        })
        return this
      },
      default(viewGenerator) {
        self.defaultSelector = {
          type: "case-selector",
          select: () => true,
          templateContext: memoize(() => {
            return {
              template: self.createTemplate(viewGenerator(state), self.templateSelectors.length),
              overlayRegistry: (registry) => {
                return new CaseViewOverlayTokenRegistry(registry, () => true, [])
              }
            }
          })
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
          type: "condition-selector",
          select: predicate,
          template: memoize(() => self.createTemplate(view, index))
        })

        return this
      },
      default(view: ViewDefinition): void {
        self.defaultSelector = {
          type: "condition-selector",
          select: () => true,
          template: memoize(() => self.createTemplate(view, self.templateSelectors.length))
        }
      }
    }
  }
}

function memoize<X>(fun: () => X): () => X {
  let value: X | undefined = undefined

  return () => {
    if (value === undefined) {
      value = fun()
    }
    return value
  }
}

class CaseViewOverlayTokenRegistry extends OverlayTokenRegistry {
  private tokenMap: Map<State<any>, any> = new Map()
  constructor(parentRegistry: TokenRegistry, private selector: (get: GetState) => boolean, private tokens: Array<State<any>>) {
    super(parentRegistry)
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    if (this.tokens.includes(token)) {
      let publisher = this.tokenMap.get(token)
      if (publisher === undefined) {
        publisher = createStatePublisher(this, token)
        this.tokenMap.set(token, this.createGuardedPublisher(publisher))
      }
      return publisher
    }

    const publisher = this.parentRegistry.getState(token)
    return this.createGuardedPublisher(publisher) as any
  }

  private createGuardedPublisher(publisher: StatePublisher<any>): StatePublisher<any> {
    return guardListenersStatePublisherProxy(
      publisher,
      () => runQuery(this.parentRegistry, this.selector)
    ) as any
  }
}

function guardListenersStatePublisherProxy(publisher: StatePublisher<any>, guard: () => boolean) {
  return new Proxy(publisher, {
    get(target, prop, receiver) {
      if (prop === "addListener") {
        return (listener: StateListener) => {
          const runner = listener.run.bind(listener)
          listener.run = function (get) {
            if (guard()) {
              runner(get)
            }
          }
          target.addListener(listener)
        }
      } else {
        return Reflect.get(target, prop, receiver)
      }
    }
  })
}