import { Command, CommandController, createController, createPublisher, State, StatePublisher, Token, TokenRegistry } from "../tokenRegistry.js";

export interface SerializableTokenRegistryOptions {
  id?: string
  initialState?: Map<string, any>
}

export class SerializableTokenRegistry implements TokenRegistry {
  protected registry: WeakMap<Token, any> = new WeakMap();
  protected tokenIdMap: Map<string, Token> = new Map();

  constructor(private options: SerializableTokenRegistryOptions = {}) { }

  registerState<T>(token: State<any>, initialState?: T): StatePublisher<T> {
    const controller = token[createPublisher](this, initialState)
    this.registry.set(token, controller)
    return controller
  }

  registerCommand(token: Command<any>): CommandController<any> {
    const controller = token[createController](this)
    this.registry.set(token, controller)
    return controller
  }

  get<C>(token: Token): C {
    let controller = this.registry.get(token)
    if (controller === undefined) {
      if (token instanceof State) {
        // NOTE: This conditional should be removed when we figure out a
        // better serialization api!!!!!
        if (token.id) {
          this.tokenIdMap.set(token.id, token)
          controller = this.registerState(token, this.options.initialState?.get(token.id))
        } else {
          controller = this.registerState(token)
        }
      } else if (token instanceof Command) {
        controller = this.registerCommand(token)
      }
    }
    return controller
  }

  set(token: Token, controller: any) {
    this.registry.set(token, controller)
  }

  serialize(): string {
    const map_data = Array.from(this.tokenIdMap.entries())
      .map(([key, token]) => {
        const value = this.get<StatePublisher<any>>(token).getValue()
        return `["${key}",${JSON.stringify(value)}]`
      })
      .join(",")

    return `globalThis[Symbol.for("${this.options.id}")] = new Map([${map_data}]);`
  }
}
