import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js"
import { StateWriter } from "../../store/state/publisher/stateWriter.js"
import { ValueWriter } from "../../store/state/publisher/valueWriter.js"
import { createStatePublisher, State, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../../view/render/templateContext.js"

export function createOverlayRegistry(context: ListItemTemplateContext<any>, rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
  const registry = new ListItemOverlayTokenRegistry(rootRegistry, context.itemToken, new ValueWriter(itemData), context.viewTokens)
  if (context.usesIndex) {
    registry.setIndexState(context.indexToken, index)
  }

  return registry
}

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private index: State<number> | undefined
  private indexPublisher: StateWriter<number> | undefined
  private registry: Map<Token, StatePublisher<any>> = new Map()

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<any>,
    private itemPublisher: StateWriter<any>,
    private viewTokens: Set<Token>
  ) {
    super(rootRegistry)
  }

  setIndexState(token: State<number>, value: number) {
    this.index = token
    this.indexPublisher = new ValueWriter(value)
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    if (token === this.item) {
      return this.itemPublisher as any
    }

    if (token === this.index) {
      return this.indexPublisher as any
    }

    if (this.viewTokens.has(token)) {
      let publisher = this.registry.get(token)
      if (publisher === undefined) {
        publisher = createStatePublisher(this, token)
        this.registry.set(token, publisher)
      }
      return publisher as C
    }

    return super.getState(token)
  }
}
