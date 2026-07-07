import { OverlayTokenRegistry } from "../../../../store/registry/overlayTokenRegistry.js"
import { clone, Container } from "../../../../store/state/container.js"
import { OverlayStateHandler } from "../../../../store/state/handler/overlayStateHandler.js"
import { generateStateManager, State, StateHandler, StateReader, StateToken, StateWriter, TokenRegistry } from "../../../../store/tokenRegistry.js"
import { ListItemTemplateContext } from "../../templateContext.js"
import { ListItem } from "../../viewRenderer.js"
import { ListItemReader } from "./itemReader.js"

class ExternalStateHandler extends OverlayStateHandler {
  next: ExternalStateHandler | undefined = undefined

  constructor(registry: TokenRegistry, parent: StateWriter<any, any>, readonly token: StateToken<unknown>) {
    super(registry, parent)
  }
}

export class ItemState extends OverlayTokenRegistry {
  private itemRegistry: Map<StateToken<unknown>, StateReader<unknown>> | undefined = undefined
  private externalStateHead: ExternalStateHandler | undefined = undefined

  static newInstance(data: any, index: number, parentRegistry: TokenRegistry, context: ListItemTemplateContext<any>): ItemState {
    return new ItemState(
      parentRegistry,
      context.listItemDataToken,
      new ListItemReader(data, index),
      context.viewTokens
    )
  }

  private constructor(
    parentRegistry: TokenRegistry,
    private listItemDataToken: State<ListItem<any>>,
    private listItemDataReader: ListItemReader<any>,
    private viewTokens: Set<StateToken<unknown>>
  ) {
    super(parentRegistry)
  }

  getRegistry(): Map<StateToken<unknown>, StateReader<unknown>> {
    if (this.itemRegistry === undefined) {
      this.itemRegistry = new Map()
    }
    return this.itemRegistry
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    if (token === this.listItemDataToken) {
      return this.listItemDataReader as StateHandler<S>
    }

    if (this.viewTokens.has(token)) {
      const registry = this.getRegistry()
      let publisher = registry.get(token)
      if (publisher === undefined) {
        publisher = generateStateManager(this, token)
        if (token instanceof Container) {
          // Allow the onRegister store hook to fire for this container (if defined)
          const rootToken = token[clone]()
          this.parentRegistry.setState(rootToken, publisher)
        }
        registry.set(token, publisher)
      }
      return publisher as StateHandler<S>
    }

    for (let handler = this.externalStateHead; handler !== undefined; handler = handler.next) {
      if (handler.token === token) {
        return handler as StateHandler<S>
      }
    }

    const actualPublisher = this.parentRegistry.getState(token) as StateWriter<any, any>
    const overlayHandler = new ExternalStateHandler(this.parentRegistry, actualPublisher, token)
    overlayHandler.next = this.externalStateHead
    this.externalStateHead = overlayHandler

    return overlayHandler as StateHandler<S>
  }

  unsubscribeFromExternalState() {
    for (let handler = this.externalStateHead; handler !== undefined; handler = handler.next) {
      handler.detach()
    }
  }

  updateIndex(index: number) {
    this.listItemDataReader.updateIndex(index)
  }
}
