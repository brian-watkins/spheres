import { meta, State } from "../../store/index.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { getStateHandler, StateReader, StateToken, TokenRegistry } from "../../store/tokenRegistry.js";
import { ListItem, UseItem, ViewDefinition, ViewRenderer } from "./viewRenderer.js";
import { Container } from "../../store/state/container.js"
import { ListItemReader } from "./effects/list/itemReader.js";

export class ListItemTemplateContext<T> {
  readonly listItemDataToken: State<ListItem<T>> = stateReference()
  readonly viewTokens: Set<StateToken<any>> 

  constructor(viewRenderer: ViewRenderer, generator: (stateful: UseItem<T>) => ViewDefinition) {
    this.viewTokens = recordTokens(() => {
      generator((useItem) => (get) => {
        const itemReader = get(this.listItemDataToken) as ListItemReader<T>
        itemReader.getState = get
        const val = useItem(itemReader, get)
        itemReader.getState = undefined
        return val
      })(viewRenderer)
    })

    for (const token of this.viewTokens.values()) {
      if (token instanceof Container) {
        this.viewTokens.add(meta(token))
      }
    }
  }
}

function stateReference<T>(): State<T> {
  return {
    [getStateHandler](registry: TokenRegistry): StateReader<T> {
      return registry.getState(this as StateToken<T>)
    }
  }
}
