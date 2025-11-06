import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js"
import { StateWriter } from "../../store/state/publisher/stateWriter.js"
import { ValueWriter } from "../../store/state/publisher/valueWriter.js"
import { State, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry.js"
import { ListItemTemplateContext, StatePublisherCollection } from "../../view/render/templateContext.js"

export function createOverlayRegistry(context: ListItemTemplateContext<any>, rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
  const registry = new ListItemOverlayTokenRegistry(rootRegistry, context.itemToken, new ValueWriter(itemData))
  if (context.usesIndex) {
    registry.setIndexState(context.indexToken, index)
  }

  registry.setUserTokens(context.getStateMap())

  return registry
}

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private tokenMap: Map<Token, StatePublisherCollection> | undefined
  private index: State<number> | undefined
  private indexPublisher: StateWriter<number> | undefined

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<any>,
    private itemPublisher: StateWriter<any>
  ) {
    super(rootRegistry)
  }

  setIndexState(token: State<number>, value: number) {
    this.index = token
    this.indexPublisher = new ValueWriter(value)
  }

  setUserTokens(tokens: Map<Token, StatePublisherCollection>) {
    this.tokenMap = tokens
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    if (token === this.item) {
      return this.itemPublisher as any
    }

    if (token === this.index) {
      return this.indexPublisher as any
    }

    return (this.tokenMap?.get(token)?.getStatePublisher(this) ??
      super.getState(token)) as any
  }
}
