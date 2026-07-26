import { dispatchMessage, StoreMessage } from "../message.js"
import { CommandController, getStateHandler, PublishableState, TokenRegistry, State } from "../tokenRegistry.js"

export interface CommandActions {
  get<T>(state: State<T>): T
  supply<T>(state: PublishableState<T>, value: NoInfer<T>): void
  dispatch(message: StoreMessage): void
}

export interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}

export class ManagedCommandController<T> implements CommandController<T> {
  constructor(private manager: CommandManager<T>) { }

  run(registry: TokenRegistry, message: T) {
    this.manager.exec(message, {
      get: (state) => {
        return state[getStateHandler](registry).getValue()
      },
      supply: (token, value) => {
        token[getStateHandler](registry).publish(value)
      },
      dispatch: (message) => {
        dispatchMessage(registry, message)
      }
    })
  }
}
