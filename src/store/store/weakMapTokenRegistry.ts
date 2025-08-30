import { Command, CommandController, createController, createPublisher, State, StatePublisher, Token, TokenRegistry } from "../tokenRegistry.js";

export class WeakMapTokenRegistry implements TokenRegistry {
  protected registry: WeakMap<Token, any> = new WeakMap();
  private onRegisterHook: ((token: Token) => void) | undefined

  constructor() { }

  onRegister(handler: (token: Token) => void): void {
    this.onRegisterHook = handler
  }

  registerState<T>(token: State<any>, initialState?: T): StatePublisher<T> {
    const controller = token[createPublisher](this, initialState)
    this.registry.set(token, controller)
    this.onRegisterHook?.(token)
    return controller
  }

  registerCommand(token: Command<any>): CommandController<any> {
    const controller = token[createController](this)
    this.registry.set(token, controller)
    return controller
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    let publisher = this.registry.get(token)
    if (publisher === undefined) {
      publisher = this.registerState(token)
    }
    return publisher
  }

  getCommand(token: Command<any>): CommandController<any> {
    let controller = this.registry.get(token)
    if (controller === undefined) {
      controller = this.registerCommand(token)
    }
    return controller
  }

  setCommand(token: Command<any>, controller: CommandController<any>): void {
    this.registry.set(token, controller)
  }

  setState(state: State<any>, publisher: StatePublisher<any>): void {
    this.registry.set(state, publisher)
  }
}
