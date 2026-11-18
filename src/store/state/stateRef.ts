import {
  GetState,
  getStateHandler,
  resolveState,
  State,
  StateBatch,
  StateHandler,
  TokenRegistry,
} from "../tokenRegistry.js"
import { getInitialValue, ResettableState } from "../message.js"

export type StateValue<S> = S extends State<infer V> ? V : never

export class StateRef<S extends State<any>> implements State<StateValue<S>> {
  constructor(
    private parent: State<any>,
    private locator: (value: any) => S,
  ) {}

  [getStateHandler](registry: TokenRegistry): StateHandler<S> {
    return this.resolve(registry)[getStateHandler](registry) as StateHandler<S>
  }

  [getInitialValue](registry: TokenRegistry, batch?: StateBatch): StateValue<S> {
    return (this.resolve(registry) as unknown as ResettableState<StateValue<S>>)[getInitialValue](
      registry,
      batch,
    )
  }

  private resolve(registry: TokenRegistry): S {
    return this.locator(this.parent[getStateHandler](registry).getValue())
  }

  [resolveState](get: GetState): S {
    return this.locator(get(this.parent))
  }

  at<R extends State<any>>(locator: (value: StateValue<S>) => R): StateRef<R> {
    return new StateRef(this, locator)
  }

  toString() {
    return `StateRef[${this.parent}]`
  }
}
