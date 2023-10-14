import { GetState, Rule, StoreMessage } from "./store.js";

export function rule<Q = undefined>(definition: (get: GetState, inputValue: Q) => StoreMessage<any>): Rule<Q> {
  return {
    definition
  }
}

