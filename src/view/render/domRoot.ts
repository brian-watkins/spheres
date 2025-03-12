import { DOMEvent, RenderResult, spheresTemplateData, StoreEventHandler, Zone } from "./index.js"
import { dispatchMessage } from "../../store/message.js"
import { TokenRegistry } from "../../store/tokenRegistry.js"
import { HTMLBuilder, HTMLView } from "../htmlElements.js"
import { ActivateDomRenderer } from "./activateDomRenderer.js"
import { DomRenderer } from "./domRenderer.js"
import { getEventAttribute, getNearestElementHandlingEvent } from "./eventHelpers.js"
import { HtmlRendererDelegate } from "./htmlDelegate.js"
import { IdSequence } from "./idSequence.js"

export class DOMRoot implements Zone, RenderResult {
  private activeDocumentEvents = new Set<string>()
  private eventController = new AbortController()
  private events: Map<string, DOMEvent> = new Map()

  constructor(readonly registry: TokenRegistry, readonly root: Element) { }

  mount(view: HTMLView) {
    this.clearRoot()
    const renderer = new DomRenderer(new HtmlRendererDelegate(), this, this.registry, new IdSequence(), this.root)
    view(renderer as unknown as HTMLBuilder)
  }

  activate(view: HTMLView) {
    this.cleanRoot()
    const renderer = new ActivateDomRenderer(new HtmlRendererDelegate(), this, this.registry, this.root.firstChild!)
    view(renderer as unknown as HTMLBuilder)
  }

  addEvent(location: DOMEvent["location"], elementId: string, eventType: string, handler: StoreEventHandler<any>) {
    this.setupEventHandler(eventType)
    this.events.set(`${eventType}-${elementId}`, { location, handler })
  }

  private setupEventHandler(eventType: string) {
    if (this.activeDocumentEvents.has(eventType)) return

    this.root.addEventListener(
      eventType,
      this.createEventListener(eventType),
      { signal: this.eventController.signal }
    )

    this.activeDocumentEvents.add(eventType)
  }

  private createEventListener(eventType: string) {
    return (evt: Event) => {
      const targetElement = evt.target as Element
      const element = getNearestElementHandlingEvent(targetElement, eventType)
      if (element) {
        const elementId = getEventAttribute(element, eventType)
        const domEvent = this.events.get(`${eventType}-${elementId}`)
        switch (domEvent?.location) {
          case "element":
            dispatchMessage(this.registry, domEvent.handler(evt))
            break
          case "template":
            const root = element.closest(`[data-spheres-template]`)!
            //@ts-ignore
            const registry = root[spheresTemplateData]
            dispatchMessage(registry, domEvent.handler(evt))
            break
        }
        evt.stopPropagation()
      }
    }
  }

  unmount() {
    this.eventController.abort()
    this.clearRoot()
  }

  private clearRoot() {
    while (this.root.hasChildNodes()) {
      this.root.removeChild(this.root.lastChild!)
    }
  }

  private cleanRoot() {
    for (let i = 0; i < this.root.childNodes.length; i++) {
      const node = this.root.childNodes[i]
      if (node.nodeType === 3 && node.nodeValue?.trim() === "") {
        this.root.removeChild(node)
      } else {
        break
      }
    }
  }
}
