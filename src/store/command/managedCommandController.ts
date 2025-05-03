import { StateWriter } from "../state/publisher/stateWriter.js"
import { error, pending } from "../state/meta.js"
import { CommandController, State, TokenRegistry } from "../tokenRegistry.js"
import { Container } from "../state/container.js"

export interface CommandActions {
  get<T>(state: State<T>): T
  supply<T, M, E>(state: Container<T, M, E>, value: NoInfer<T>): void
  pending<T, M, E>(state: Container<T, M, E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
  error<T, M, E>(state: Container<T, M, E>, reason: NoInfer<E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
}

export interface CommandManager<M> {
  exec(message: M, actions: CommandActions): void
}

export class ManagedCommandController<T> implements CommandController<T> {
  constructor(private registry: TokenRegistry, private manager: CommandManager<T>) { }

  run(message: T) {
    this.manager.exec(message, {
      get: (state) => {
        return this.registry.getState(state).getValue()
      },
      supply: (token, value) => {
        this.registry.getState<StateWriter<any>>(token).publish(value)
      },
      pending: (token, ...message) => {
        if (message.length === 0) {
          this.registry.getState<StateWriter<any>>(token.meta).write(pending(undefined))
        } else {
          this.registry.getState<StateWriter<any>>(token.meta).write(pending(message[0]))
        }
      },
      error: (token, reason, ...message) => {
        if (message.length === 0) {
          this.registry.getState<StateWriter<any>>(token.meta).write(error(reason, undefined))
        } else {
          this.registry.getState<StateWriter<any>>(token.meta).write(error(reason, message[0]))
        }
      }
    })
  }
}
