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

  private getRegistryKey<K extends Token>(token: K): K {
    if (token.id === undefined) return token

    const key = this.tokenIdMap.get(token.id) as K
    if (key === undefined) {
      this.tokenIdMap.set(token.id, token)
      return token
    }

    return key
  }

  get<C>(token: Token): C {
    const key = this.getRegistryKey(token)
    let controller = this.registry.get(key)
    if (controller === undefined) {
      if (token instanceof State) {
        const initialState = token.id ? this.options.initialState?.get(token.id) : undefined
        controller = this.registerState(key as State<any>, initialState)
      } else if (token instanceof Command) {
        controller = this.registerCommand(key as Command<any>)
      }
    }
    return controller
  }

  set(token: Token, controller: any) {
    this.registry.set(this.getRegistryKey(token), controller)
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
