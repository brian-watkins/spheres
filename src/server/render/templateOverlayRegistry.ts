import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js"
import { clone, Container } from "../../store/state/container.js"
import {
  generateStateManager,
  StateReader,
  StateHandler,
  TokenRegistry,
  StateToken,
  State,
} from "../../store/tokenRegistry.js"
import { ListItemReader } from "../../view/render/effects/list/itemReader.js"
import { ListItemTemplateContext } from "../../view/render/templateContext.js"

export function createListItemOverlayRegistry(
  context: ListItemTemplateContext<any>,
  rootRegistry: TokenRegistry,
  itemData: any,
  index: number,
): ListItemOverlayTokenRegistry {
  return new ListItemOverlayTokenRegistry(
    rootRegistry,
    context.listItemDataToken,
    new ListItemReader(itemData, index),
    context.viewTokens,
  )
}

export class ViewOverlayTokenRegistry extends OverlayTokenRegistry {
  private registry: Map<StateToken<unknown>, StateReader<unknown>> = new Map()

  constructor(
    parentRegistry: TokenRegistry,
    private viewTokens: Set<StateToken<unknown>>,
  ) {
    super(parentRegistry)
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    if (this.viewTokens.has(token)) {
      let publisher = this.registry.get(token)
      if (publisher === undefined) {
        publisher = generateStateManager(this, token)
        if (token instanceof Container) {
          // Allow the onRegister store hook to fire for this container (if defined)
          const rootToken = token[clone]()
          this.parentRegistry.setState(rootToken, publisher)
        }
        this.registry.set(token, publisher)
      }
      return publisher as StateHandler<S>
    }

    return super.getState(token)
  }
}

export class ListItemOverlayTokenRegistry extends ViewOverlayTokenRegistry {
  constructor(
    rootRegistry: TokenRegistry,
    private listItemDataToken: State<unknown>,
    private listItemDataReader: ListItemReader<any>,
    viewTokens: Set<StateToken<unknown>>,
  ) {
    super(rootRegistry, viewTokens)
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    if (token === this.listItemDataToken) {
      return this.listItemDataReader as StateHandler<S>
    }

    return super.getState(token)
  }
}
