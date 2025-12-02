import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js"
import { ConstantReader } from "../../store/state/handler/constantReader.js"
import { Publisher } from "../../store/state/handler/publisher.js"
import { generateStateManager, State, StatePublisher, StateReader, StateHandler, Token, TokenRegistry } from "../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../../view/render/templateContext.js"

export function createOverlayRegistry(context: ListItemTemplateContext<any>, rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
  return new ListItemOverlayTokenRegistry(
    rootRegistry,
    context.itemToken, new ConstantReader(itemData),
    context.indexToken, new Publisher(index),
    context.viewTokens
  )
}

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private registry: Map<Token, StateReader<unknown>> = new Map()

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<unknown>,
    private itemPublisher: StateReader<StatePublisher<unknown>>,
    private indexToken: State<number>,
    private indexPublisher: StatePublisher<number>,
    private viewTokens: Set<Token>
  ) {
    super(rootRegistry)
  }

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    if (token === this.item) {
      return this.itemPublisher as StateHandler<S>
    }

    if (token === this.indexToken) {
      return this.indexPublisher as StateHandler<S>
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
