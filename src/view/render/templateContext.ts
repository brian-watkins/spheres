import { State } from "../../store/index.js"
import { withTokenOrigin } from "../../store/state/tokenOrigin.js"
import {
  getStateHandler,
  StateReader,
  StateToken,
  TokenRegistry,
} from "../../store/tokenRegistry.js"
import { ListItem, UseItem, ViewDefinition, ViewRenderer } from "./viewRenderer.js"
import { ListItemReader } from "./effects/list/itemReader.js"

export class ListItemTemplateContext<T> {
  readonly listItemDataToken: State<ListItem<T>> = stateReference()

  constructor(viewRenderer: ViewRenderer, generator: (stateful: UseItem<T>) => ViewDefinition) {
    withTokenOrigin(this, () => {
      generator((useItem) => (get) => {
        const itemReader = get(this.listItemDataToken) as ListItemReader<T>
        itemReader.getState = get
        const val = useItem(itemReader, get)
        itemReader.getState = undefined
        return val
      })(viewRenderer)
    })
  }
}

function stateReference<T>(): State<T> {
  return {
    [getStateHandler](registry: TokenRegistry): StateReader<T> {
      return registry.getState(this as StateToken<T>)
    },
  }
}
