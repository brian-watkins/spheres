import { GetState } from "../../../store/index.js";
import { activate, DOMTemplate, render } from "../domTemplate.js";
import { generateStateManager, StateEffect, StateListenerType, StateReader, StateWriter, StateHandler, TokenRegistry, StateToken } from "../../../store/tokenRegistry.js";
import { clone, Container } from "../../../store/state/container.js";
import { TemplateCollection, TemplateMatch } from "../viewMatcherBuilder.js";
import { OverlayTokenRegistry } from "../../../store/registry/overlayTokenRegistry.js";
import { OverlayStateHandler } from "../../../store/state/handler/overlayStateHandler.js";

export class MatchViewEffect implements StateEffect {
  readonly type = StateListenerType.ViewEffect
  private currentMatch: TemplateMatch<DOMTemplate> | undefined
  private registry: ConditionalViewOverlayRegistry

  constructor(
    parentRegistry: TokenRegistry,
    public templateCollection: TemplateCollection<DOMTemplate>,
    public startNode: Node,
    public endNode: Node,
  ) {
    this.registry = new ConditionalViewOverlayRegistry(parentRegistry)
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
    const match = this.templateCollection.match(get)

    if (match === this.currentMatch) {
      return
    }

    this.currentMatch = match

    this.clearView()
    this.registry.reset()

    let node: Node
    switch (match.type) {
      case "empty": {
        node = document.createTextNode("")
        break
      }
      case "view": {
        const templateContext = match.templateContext()
        this.registry.setViewTokens(templateContext.tokens)
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

  activateMatch(templateCollection: TemplateCollection<DOMTemplate>, startNode: Node, get: GetState) {
    const match = templateCollection.match(get)

    this.currentMatch = match

    if (match.type === "view") {
      const templateContext = match.templateContext()
      this.registry.setViewTokens(templateContext.tokens)
      activate(templateContext.template, templateContext.overlayRegistry(this.registry), startNode.nextSibling!)
    }
  }
}

class ConditionalViewOverlayRegistry extends OverlayTokenRegistry {
  private registry: Map<StateToken<unknown>, StateReader<unknown>> = new Map()
  private viewTokens: Set<StateToken<any>> = new Set()

  setViewTokens(tokens: Set<StateToken<any>>) {
    this.viewTokens = tokens
  }

  getState<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    let publisher = this.registry.get(token)
    if (publisher === undefined) {
      if (this.viewTokens.has(token)) {
        publisher = generateStateManager(this, token)
        if (token instanceof Container) {
          const rootToken = token[clone]()
          this.parentRegistry.setState(rootToken, publisher)
        }
      } else {
        publisher = this.createPublisher(token)
      }

      this.registry.set(token, publisher)
    }

    return publisher as StateHandler<S>
  }

  private createPublisher<S extends StateToken<unknown>>(token: S): StateHandler<S> {
    const actualPublisher = this.parentRegistry.getState(token) as StateWriter<any, any>
    const overlayPublisher = new OverlayStateHandler(this.parentRegistry, actualPublisher)
    overlayPublisher.init()

    return overlayPublisher as StateHandler<S>
  }

  reset() {
    this.registry.forEach((publisher, key) => {
      if (publisher instanceof OverlayStateHandler) {
        publisher.detach()
        this.registry.delete(key)
      }
    })
  }
}