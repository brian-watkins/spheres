import { dispatchMessage, ExecMessage } from "./message.js";
import { Command, CommandController, createController, GetState, initializeCommand, initListener, StateEffect, StateListenerType, TokenRegistry } from "./tokenRegistry.js";
import { DefaultCommandController } from "./command/defaultCommandController.js";

export interface CommandInitializer<M> {
  trigger?: (get: GetState) => M
}

export function command<M = never>(initializer: CommandInitializer<M> = {}): Command<M> {
  return new BasicCommand<M>(initializer.trigger)
}

export function exec<M = never>(command: Command<M>, ...message: NoInfer<M> extends never ? [] : [NoInfer<M>]): ExecMessage<M> {
  return {
    type: "exec",
    command,
    message: message.length === 0 ? undefined : message[0] as any
  }
}

export class BasicCommand<M> extends Command<M> {
  constructor(private trigger: ((get: GetState) => M) | undefined) {
    super(undefined)
  }

  [createController](): CommandController<M> {
    return new DefaultCommandController()
  }

  [initializeCommand](registry: TokenRegistry): void {
    if (this.trigger !== undefined) {
      initListener(registry, new DispatchCommandQuery(registry, this, this.trigger))
    }
  }
}

class DispatchCommandQuery<M> implements StateEffect {
  readonly type = StateListenerType.UserEffect

  constructor(public registry: TokenRegistry, private command: Command<M>, private trigger: (get: GetState) => M) { }

  init(get: GetState): void {
    this.run(get)
  }

  run(get: GetState): void {
    dispatchMessage(this.registry, {
      type: "exec",
      command: this.command,
      message: this.trigger!((state) => get(state))
    })
  }
}

