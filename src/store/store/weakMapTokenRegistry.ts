import { Command, CommandController, createController, createPublisher, State, StatePublisher, Token, TokenRegistry } from "../tokenRegistry.js";

export class WeakMapTokenRegistry implements TokenRegistry {
  protected registry: WeakMap<Token, any> = new WeakMap();

  constructor() { }

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
        controller = this.registerState(token)
      } else if (token instanceof Command) {
        controller = this.registerCommand(token)
      }
    }
    return controller
  }

  set(token: Token, controller: any) {
    this.registry.set(token, controller)
  }
}
