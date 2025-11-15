import { error, Meta, pending } from "../state/meta.js"
import { CommandController, getStateHandler, State, TokenRegistry } from "../tokenRegistry.js"
import { WritableState } from "../message.js"

export interface CommandActions {
  get<T>(state: State<T>): T
  supply<T>(state: WritableState<T, unknown>, value: NoInfer<T>): void
  pending<T, M, E>(state: WritableState<T, M, E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
  error<T, M, E>(state: WritableState<T, M, E>, reason: NoInfer<E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): void
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
        token[getStateHandler](this.registry).publish(value)
      },
      pending: <T, M, E>(token: WritableState<T, M, E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
        if (message.length === 0) {
          token.meta[getStateHandler](this.registry).publish(pending(undefined) as Meta<never, E>)
        } else {
          token.meta[getStateHandler](this.registry).publish(pending(message[0]))
        }
      },
      error: <T, M, E>(token: WritableState<T, M, E>, reason: NoInfer<E>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]) => {
        if (message.length === 0) {
          token.meta[getStateHandler](this.registry).publish(error(reason, undefined) as Meta<never, E>)
        } else {
          token.meta[getStateHandler](this.registry).publish(error(reason, message[0]))
        }
      }
    })
  }
}
