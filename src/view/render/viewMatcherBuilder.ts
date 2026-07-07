import { GetState, State } from "../../store/index.js";
import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { generateStateManager, runQuery, Subscriber, Subscribable, TokenRegistry, StateHandler, StateToken } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewCaseMatcher, ViewMatcher, ViewConditionMatcher, UseCase } from "./viewRenderer.js";
import { Container } from "../../store/state/container.js"

export interface TemplateCollection<T> {
  match(get: GetState): TemplateMatch<T>
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

export type TemplateMatch<T> = EmptyTemplate | TemplateView<T>

interface MatcherCollectionBuilder<T> {
  getCollection(): TemplateCollection<T>
}

export class MatcherBuilder<T> implements ViewMatcher {
  private builder: MatcherCollectionBuilder<T> | undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T) { }

  get collection(): TemplateCollection<T> {
    return this.builder?.getCollection() ?? new EmptyCollection()
  }

  withUnion<T>(valueQuery: (get: GetState) => T): ViewCaseMatcher<T> {
    const builder = new CaseCollectionBuilder(this.createTemplate, valueQuery)
    this.builder = builder
    return builder
  }

  withConditions(): ViewConditionMatcher {
    const builder = new ConditionCollectionBuilder(this.createTemplate)
    this.builder = builder
    return builder
  }
}

interface CaseMatcher<T, S, X extends S> extends TemplateView<T> {
  predicate: (val: S) => val is X
}

class CaseCollectionBuilder<T, S> implements ViewCaseMatcher<S>, MatcherCollectionBuilder<T> {
  private caseMatchers: Array<CaseMatcher<T, S, any>> = []
  private defaultMatcher: TemplateMatch<T> | undefined = undefined

  constructor(private createTemplate: (view: ViewDefinition, matcherId: number) => T, private valueQuery: (get: GetState) => S) { }

  when<X extends S>(typePredicate: (val: S) => val is X, viewGenerator: (useCase: UseCase<X>) => ViewDefinition): ViewCaseMatcher<S> {
    const index = this.caseMatchers.length

    this.caseMatchers.push({
      type: "view",
      predicate: typePredicate,
      templateContext: memoize(() => {
        let template!: any
        const tokens = recordTokens(() => {
          const view = viewGenerator((generator) => (get) => {
            return generator(this.valueQuery(get) as X, get)
          })
          template = this.createTemplate(view, index)
        })

        return {
          template,
          overlayRegistry: (registry) => {
            return new CaseViewOverlayTokenRegistry(registry, (get) => typePredicate(this.valueQuery(get)), tokens)
          },
        }
      })
    })

    return this
  }

  default(viewGenerator: (useCase: UseCase<S>) => ViewDefinition): void {
    this.defaultMatcher = {
      type: "view",
      templateContext: memoize(() => {
        const view = viewGenerator((generator) => (get) => {
          return generator(this.valueQuery(get), get)
        })

        return {
          template: this.createTemplate(view, this.caseMatchers.length),
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
      match: (get) => {
        const val = this.valueQuery(get)
        const matcher = this.caseMatchers.find(sel => sel.predicate(val))
        if (matcher === undefined) {
          return this.defaultMatcher ?? { type: "empty" }
        } else {
          return matcher
        }
      },
    }
  }
}

interface ConditionMatcher<T> extends TemplateView<T> {
  predicate: (get: GetState) => boolean
}

class ConditionCollectionBuilder<T> implements ViewConditionMatcher, MatcherCollectionBuilder<T> {
  private conditionMatchers: Array<ConditionMatcher<T>> = []
  private defaultMatcher: TemplateMatch<T> | undefined = undefined

  constructor(private createTemplate: (view: ViewDefinition, selectorId: number) => T) { }

  when(predicate: (get: GetState) => boolean, view: ViewDefinition): this {
    const index = this.conditionMatchers.length
    this.conditionMatchers.push({
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
    this.defaultMatcher = {
      type: "view",
      templateContext: memoize(() => {
        return {
          template: this.createTemplate(view, this.conditionMatchers.length),
          overlayRegistry: (registry) => registry
        }
      })
    }
  }

  getCollection(): TemplateCollection<T> {
    return {
      match: (get) => {
        const selector = this.conditionMatchers.find(sel => sel.predicate(get))
        if (selector === undefined) {
          return this.defaultMatcher ?? { type: "empty" }
        }
        return selector
      },
    }
  }
}

class EmptyCollection implements TemplateCollection<any> {
  match(): TemplateMatch<any> {
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

  constructor(parentRegistry: TokenRegistry, private matcher: (get: GetState) => boolean, private tokens: Array<State<any>>) {
    super(parentRegistry)
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    let publisher = this.tokenMap.get(token)
    if (publisher === undefined) {
      if (this.tokens.includes(token)) {
        if (token instanceof Container) {
          // containers do not need to be guarded and aren't shared across templates
          // this allows internal containers to trigger the onRegister hook
          publisher = this.parentRegistry.getState(token)
        } else {
          publisher = this.createGuardingStateHandler(generateStateManager(this, token))
        }
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
      () => runQuery(this, this.matcher)
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