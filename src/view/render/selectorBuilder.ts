import { derived, GetState, State } from "../../store/index.js";
import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { generateStateManager, runQuery, Subscriber, Subscribable, TokenRegistry, StateHandler } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewCaseSelector, ViewSelector, ViewConditionSelector } from "./viewRenderer.js";

export interface TemplateCollection<T> {
  select(get: GetState): TemplateSelection<T>
}

export interface TemplateContext<T> {
  template: T
  overlayRegistry: (registry: TokenRegistry) => TokenRegistry
}

export interface TemplateView<T> {
  type: "view"
  templateContext: () => TemplateContext<T>
}

export interface EmptyTemplate {
  type: "empty"
}

export type TemplateSelection<T> = EmptyTemplate | TemplateView<T>

interface SelectorCollectionBuilder<T> {
  getCollection(): TemplateCollection<T>
}

export class SelectorBuilder<T> implements ViewSelector {
  private builder: SelectorCollectionBuilder<T> | undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T) { }

  get collection(): TemplateCollection<T> {
    return this.builder?.getCollection() ?? new EmptyCollection()
  }

  withUnion<T>(valueQuery: (get: GetState) => T): ViewCaseSelector<T> {
    const unionValue = derived(valueQuery)

    const builder = new CaseCollectionBuilder(this.createTemplate, unionValue)
    this.builder = builder
    return builder
  }

  withConditions(): ViewConditionSelector {
    const builder = new ConditionCollectionBuilder(this.createTemplate)
    this.builder = builder
    return builder
  }
}

interface CaseSelector<T, S, X extends S> extends TemplateView<T> {
  predicate: (val: S) => val is X
}

class CaseCollectionBuilder<T, S> implements ViewCaseSelector<S>, SelectorCollectionBuilder<T> {
  private caseSelectors: Array<CaseSelector<T, S, any>> = []
  private defaultSelector: TemplateSelection<T> | undefined = undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T, private state: State<S>) { }

  when<X extends S>(typePredicate: (val: S) => val is X, viewGenerator: (state: State<X>) => ViewDefinition): ViewCaseSelector<S> {
    const index = this.caseSelectors.length

    this.caseSelectors.push({
      type: "view",
      predicate: typePredicate,
      templateContext: memoize(() => {
        let template!: any
        const tokens = recordTokens(() => {
          template = this.createTemplate(viewGenerator(this.state as State<any>), index)
        })

        return {
          template,
          overlayRegistry: (registry) => {
            return new CaseViewOverlayTokenRegistry(registry, (get) => typePredicate(get(this.state)), tokens)
          },
        }
      })
    })

    return this
  }

  default(viewGenerator: (state: State<S>) => ViewDefinition): void {
    this.defaultSelector = {
      type: "view",
      templateContext: memoize(() => {
        return {
          template: this.createTemplate(viewGenerator(this.state), this.caseSelectors.length),
          // Note: No need for an overlay registry here as the default view does not get
          // a particular discrimiant as its state argument -- the guard provided by
          // the registry is not needed
          overlayRegistry: (registry) => registry
        }
      })
    }
  }

  getCollection(): TemplateCollection<T> {
    return {
      select: (get) => {
        const val = get(this.state)
        const selector = this.caseSelectors.find(sel => sel.predicate(val))
        if (selector === undefined) {
          return this.defaultSelector ?? { type: "empty" }
        } else {
          return selector
        }
      },
    }
  }
}

interface ConditionSelector<T> extends TemplateView<T> {
  predicate: (get: GetState) => boolean
}

class ConditionCollectionBuilder<T> implements ViewConditionSelector, SelectorCollectionBuilder<T> {
  private conditionSelectors: Array<ConditionSelector<T>> = []
  private defaultSelector: TemplateSelection<T> | undefined = undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T) { }

  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this {
    const index = this.conditionSelectors.length
    this.conditionSelectors.push({
      type: "view",
      predicate,
      templateContext: memoize(() => {
        return {
          template: this.createTemplate(view, index),
          overlayRegistry: (registry) => registry
        }
      })
    })

    return this
  }

  default(view: ViewDefinition): void {
    this.defaultSelector = {
      type: "view",
      templateContext: memoize(() => {
        return {
          template: this.createTemplate(view, this.conditionSelectors.length),
          overlayRegistry: (registry) => registry
        }
      })
    }
  }

  getCollection(): TemplateCollection<T> {
    return {
      select: (get) => {
        const selector = this.conditionSelectors.find(sel => sel.predicate(get))
        if (selector === undefined) {
          return this.defaultSelector ?? { type: "empty" }
        }
        return selector
      },
    }
  }
}

class EmptyCollection implements TemplateCollection<any> {
  select(): TemplateSelection<any> {
    return { type: "empty" }
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

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    let publisher = this.tokenMap.get(token)
    if (publisher === undefined) {
      if (this.tokens.includes(token)) {
        publisher = this.createGuardingStateHandler(generateStateManager(this, token))
      } else {
        publisher = this.createGuardingStateHandler(this.parentRegistry.getState(token))
      }
      this.tokenMap.set(token, publisher)
    }

    return publisher
  }

  private createGuardingStateHandler(subscribable: Subscribable): StateHandler<any> {
    return guardSubscriberStateHandler(
      subscribable,
      () => runQuery(this, this.selector)
    )
  }
}

function guardSubscriberStateHandler(subscribable: Subscribable, guard: () => boolean) {
  const subscriberCache = new WeakSet<Subscriber>()

  return new Proxy(subscribable, {
    get<P extends keyof Subscribable>(target: Subscribable, prop: P, receiver: any) {
      if (prop === "addSubscriber") {
        return (subscriber: Subscriber) => {
          if (subscriberCache.has(subscriber)) {
            target.addSubscriber(subscriber)
          } else {
            const subscriberWithProxiedListener = guardedSubscriber(guard, subscriber)
            subscriberCache.add(subscriberWithProxiedListener)
            target.addSubscriber(subscriberWithProxiedListener)
          }
        }
      } else {
        return Reflect.get(target, prop, receiver)
      }
    }
  })
}

function guardedSubscriber(guard: () => boolean, subscriber: Subscriber): Subscriber {
  subscriber.listener = new Proxy(subscriber.listener, {
    get(target, prop, receiver) {
      if (prop === "run") {
        return guard() ? Reflect.get(target, prop, receiver) : () => { }
      } else {
        return Reflect.get(target, prop, receiver)
      }
    },
  })

  return subscriber
}