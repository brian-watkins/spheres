import { State } from "../../store/index.js";
import { Constant } from "../../store/state/constant.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { Value } from "../../store/state/value.js";
import { getStateHandler, StateReader, StateReference, Token, TokenRegistry } from "../../store/tokenRegistry.js";
import { UseData, ViewDefinition, ViewRenderer } from "./viewRenderer.js";

export class ListItemTemplateContext<T> {
  readonly itemToken: State<Value<T>> = stateReference()
  readonly indexToken: State<StateReference<number>> = stateReference()
  readonly viewTokens = new Set<Token>()

  constructor(viewRenderer: ViewRenderer, generator: (stateful: UseData<T>) => ViewDefinition) {
    recordTokens(() => {
      generator(createStatefulGenerator(this.itemToken, this.indexToken))(viewRenderer)
    })
      .forEach(token => this.viewTokens.add(token))
  }
}

const fakeIndex = new Constant(-1)

function createStatefulGenerator<T>(itemToken: State<Value<T>>, indexToken: State<StateReference<number>>): UseData<T> {
  return function (useItem) {
    if (useItem.length === 3) {
      return function (get) {
        return useItem(get, get(itemToken), get(indexToken))
      }
    } else {
      return function (get) {
        return useItem(get, get(itemToken), fakeIndex)
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
