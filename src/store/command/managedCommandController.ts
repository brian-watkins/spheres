import { StateWriter } from "../state/publisher/stateWriter.js"
import { error, pending } from "../state/meta.js"
import { SuppliedState } from "../state/supplied.js"
import { CommandController, State, StatePublisher, TokenRegistry } from "../tokenRegistry.js"

export interface CommandActions {
  get<T>(state: State<T>): T
  supply<T, M, E>(state: SuppliedState<T, M, E>, value: T): void
  pending<T, M, E>(state: SuppliedState<T, M, E>, message: M): void
  error<T, M, E>(state: SuppliedState<T, M, E>, message: M, reason: E): void
}

export interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}

export class ManagedCommandController<T> implements CommandController<T> {
  constructor(private registry: TokenRegistry, private manager: CommandManager<T>) { }

  run(message: T) {
    this.manager.exec(message, {
      get: (state) => {
        return this.registry.get<StatePublisher<any>>(state).getValue()
      },
      supply: (token, value) => {
        this.registry.get<StateWriter<any>>(token).publish(value)
      },
      pending: (token, message) => {
        this.registry.get<StateWriter<any>>(token.meta).write(pending(message))
      },
      error: (token, message, reason) => {
        this.registry.get<StateWriter<any>>(token.meta).write(error(message, reason))
      }
    })
  }
}
