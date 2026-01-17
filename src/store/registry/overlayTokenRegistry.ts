import { Command, CommandController, State, StateReader, StateHandler, TokenRegistry } from "../tokenRegistry.js"

export class OverlayTokenRegistry implements TokenRegistry {
  constructor(protected parentRegistry: TokenRegistry) { }

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    return this.parentRegistry.getState(token)
  }

  setState<T>(state: State<T>, publisher: StateReader<T>): void {
    return this.parentRegistry.setState(state, publisher)
  }

  getCommand(token: Command<any>): CommandController<any> {
    return this.parentRegistry.getCommand(token)
  }

  setCommand(token: Command<any>, controller: CommandController<any>): void {
    return this.parentRegistry.setCommand(token, controller)
  }
}