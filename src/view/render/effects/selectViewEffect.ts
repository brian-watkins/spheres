import { GetState } from "../../../store/index.js";
import { activate, DOMTemplate, render } from "../domTemplate.js";
import { State, StateEffect, StateListenerType, StateReader, StateWriter, StateHandler, Token, TokenRegistry } from "../../../store/tokenRegistry.js";
import { TemplateCollection, TemplateSelection } from "../selectorBuilder.js";
import { OverlayTokenRegistry } from "../../../store/registry/overlayTokenRegistry.js";
import { OverlayStateHandler } from "../../../store/state/handler/overlayStateHandler.js";

export class SelectViewEffect implements StateEffect {
  readonly type = StateListenerType.SystemEffect
  private currentSelection: TemplateSelection<DOMTemplate> | undefined
  private registry: ConditionalViewOverlayRegistry

  constructor(
    parentRegistry: TokenRegistry,
    public templateCollection: TemplateCollection<DOMTemplate>,
    public startNode: Node,
    public endNode: Node,
  ) {
    this.registry = new ConditionalViewOverlayRegistry(parentRegistry)
  }

  setCurrentSelection(selection: TemplateSelection<DOMTemplate>) {
    this.currentSelection = selection
  }

  init(get: GetState): void {
    this.switchView(get)
  }

  run(get: GetState): void {
    if (!this.startNode?.isConnected) {
      return
    }

    this.switchView(get)
  }

  private switchView(get: GetState): void {
    const selection = this.templateCollection.select(get)

    if (selection === this.currentSelection) {
      return
    }

    this.currentSelection = selection

    this.clearView()
    this.registry.reset()

    let node: Node
    switch (selection.type) {
      case "empty": {
        node = document.createTextNode("")
        break
      }
      case "view": {
        const templateContext = selection.templateContext()
        node = render(templateContext.template, templateContext.overlayRegistry(this.registry))
        break
      }
    }

    this.startNode.parentNode?.insertBefore(node, this.endNode!)
  }

  private clearView() {
    const range = new Range()
    range.setStartAfter(this.startNode!)
    range.setEndBefore(this.endNode!)
    range.deleteContents()
  }
}

export function activateSelect(registry: TokenRegistry, templateCollection: TemplateCollection<DOMTemplate>, startNode: Node, get: GetState): TemplateSelection<DOMTemplate> {
  const selection = templateCollection.select(get)

  if (selection.type === "view") {
    const templateContext = selection.templateContext()
    activate(templateContext.template, templateContext.overlayRegistry(registry), startNode.nextSibling!)
  }

  return selection
}

class ConditionalViewOverlayRegistry extends OverlayTokenRegistry {
  private registry: Map<Token, StateReader<any>> = new Map()

  getState<S extends State<unknown>>(token: S): StateHandler<S> {
    let publisher = this.registry.get(token)
    if (publisher === undefined) {
      publisher = this.createPublisher(token)
      this.registry.set(token, publisher)
    }

    return publisher as StateHandler<S>
  }

  private createPublisher<S extends State<unknown>>(token: S): StateHandler<S> {
    const actualPublisher = this.parentRegistry.getState(token) as StateWriter<any, any>
    const overlayPublisher = new OverlayStateHandler(this.parentRegistry, actualPublisher)
    overlayPublisher.init()

    return overlayPublisher as StateHandler<S>
  }

  reset() {
    this.registry.forEach(publisher => {
      if (publisher instanceof OverlayStateHandler) {
        publisher.detach()
      }
    })
    this.registry.clear()
  }
}