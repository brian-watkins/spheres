import { GetState, listenerStore, listenerVersion, reactiveState, StateListener, TokenRegistry } from "./tokenRegistry.js"

export interface ReactiveEffectHandle {
  unsubscribe: () => void
}

export interface ReactiveEffect extends StateListener {
  init?: (get: GetState) => void
}

export function registerEffect(registry: TokenRegistry, effect: ReactiveEffect): ReactiveEffectHandle {
  effect[listenerVersion] = 0
  effect[listenerStore] = registry

  if (effect.init !== undefined) {
    effect.init(reactiveState(registry, effect))
  } else {
    effect.run(reactiveState(registry, effect))
  }

  return {
    unsubscribe: () => {
      effect[listenerVersion] = effect[listenerVersion]! + 1
    }
  }
}
