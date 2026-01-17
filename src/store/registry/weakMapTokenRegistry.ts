import { Container } from "../state/container.js";
import { Command, CommandController, createController, createStateHandler, State, StateReader, StateHandler, Token } from "../tokenRegistry.js";
import { RootTokenRegistry } from "./rootTokenRegistry.js";

export class WeakMapTokenRegistry implements RootTokenRegistry {
  protected registry: WeakMap<Token, any> = new WeakMap();
  private registerHook: ((container: Container<any>) => void) | undefined

  constructor() { }

  onRegister(handler: (container: Container<any>) => void): void {
    this.registerHook = handler
  }

  registerState(token: State<unknown>): StateReader<unknown> {
    const controller = token[createStateHandler](this)
    this.registry.set(token, controller)
    if (this.registerHook !== undefined && token instanceof Container) {
      this.registerHook(token)
      return this.registry.get(token)
    } else {
      return controller
    }
  }

  registerCommand(token: Command<any>): CommandController<any> {
    const controller = token[createController](this)
    this.registry.set(token, controller)
    return controller
  }

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
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

  setState<T>(state: State<T>, publisher: StateReader<T>): void {
    this.registry.set(state, publisher)
  }
}
