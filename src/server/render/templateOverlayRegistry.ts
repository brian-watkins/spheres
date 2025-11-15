import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js"
import { Writer } from "../../store/state/publisher/writer.js"
import { generateStateManager, State, StatePublisher, StateReader, StateHandler, Token, TokenRegistry } from "../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../../view/render/templateContext.js"

export function createOverlayRegistry(context: ListItemTemplateContext<any>, rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
  const registry = new ListItemOverlayTokenRegistry(rootRegistry, context.itemToken, new Writer(itemData), context.viewTokens)
  if (context.usesIndex) {
    registry.setIndexState(context.indexToken, index)
  }

  return registry
}

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private index: State<number> | undefined
  private indexPublisher: StatePublisher<number> | undefined
  private registry: Map<Token, StateReader<unknown>> = new Map()

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<unknown>,
    private itemPublisher: StatePublisher<unknown>,
    private viewTokens: Set<Token>
  ) {
    super(rootRegistry)
  }

  setIndexState(token: State<number>, value: number) {
    this.index = token
    this.indexPublisher = new Writer(value)
  }

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    if (token === this.item) {
      return this.itemPublisher as StateHandler<S>
    }

    if (token === this.index) {
      return this.indexPublisher! as StateHandler<S>
    }

    if (this.viewTokens.has(token)) {
      let publisher = this.registry.get(token)
      if (publisher === undefined) {
        publisher = generateStateManager(this, token)
        this.registry.set(token, publisher)
      }
      return publisher as StateHandler<S>
    }

    return super.getState(token)
  }
}
