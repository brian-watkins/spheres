import { State } from "../../store/index.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { getStateHandler, StateReader, Token, TokenRegistry } from "../../store/tokenRegistry.js";
import { UseData, ViewDefinition, ViewRenderer } from "./viewRenderer.js";
import { Container } from "../../store/state/container.js"

export class ListItemTemplateContext<T> {
  readonly itemToken: State<T> = stateReference()
  readonly indexToken: State<number> = stateReference()
  readonly viewTokens = new Set<Token>()

  constructor(viewRenderer: ViewRenderer, generator: (stateful: UseData<T>) => ViewDefinition) {
    const tokens = recordTokens(() => {
      generator((useItem) => (get) => {
        return useItem(get(this.itemToken), get, this.indexToken)
      })(viewRenderer)
    })

    for (const token of tokens) {
      this.viewTokens.add(token)
      if (token instanceof Container) {
        this.viewTokens.add(token.meta)
      }
    }
  }
}

function stateReference<T>(): State<T> {
  return {
    [getStateHandler](registry: TokenRegistry): StateReader<T> {
      return registry.getState(this)
    }
  } as State<T>
}
