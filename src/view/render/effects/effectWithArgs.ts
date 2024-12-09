import { ArgsController } from "..";
import { GetState, ReactiveEffect } from "../../../store";
import { notifyListeners } from "../../../store/store";

export abstract class EffectWithArgs implements ReactiveEffect {
  constructor(protected argsController: ArgsController | undefined, protected args: any) { }
  
  abstract run(get: GetState): void

  [notifyListeners]() {
    this.setArgs()
  }

  protected setArgs() {
    this.argsController?.setArgs(this.args)
  }
}