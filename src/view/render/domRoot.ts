import { DOMEvent, DOMEventType, RenderResult, spheresTemplateData, StoreEventHandler, Zone } from "./index.js"
import { dispatchMessage } from "../../store/message.js"
import { TokenRegistry } from "../../store/tokenRegistry.js"
import { getEventAttribute, getNearestElementHandlingEvent } from "./eventHelpers.js"

export class DOMRoot implements Zone, RenderResult {
  private activeDocumentEvents = new Set<string>()
  private eventController = new AbortController()
  private events: Map<string, DOMEvent> = new Map()

  constructor(readonly registry: TokenRegistry, readonly root: Element) { }

  addEvent(location: DOMEventType, elementId: string, eventType: string, handler: StoreEventHandler<any>) {
    this.setupEventHandler(eventType)
    this.events.set(`${eventType}-${elementId}`, { type: location, handler })
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
        switch (domEvent?.type) {
          case DOMEventType.Element:
            dispatchMessage(this.registry, domEvent.handler(evt))
            break
          case DOMEventType.Template:
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
    clearRoot(this)
  }
}

export function clearRoot(domRoot: DOMRoot) {
  while (domRoot.root.hasChildNodes()) {
    domRoot.root.removeChild(domRoot.root.lastChild!)
  }
}

export function cleanRoot(domRoot: DOMRoot) {
  for (let i = 0; i < domRoot.root.childNodes.length; i++) {
    const node = domRoot.root.childNodes[i]
    if (node.nodeType === 3 && node.nodeValue?.trim() === "") {
      domRoot.root.removeChild(node)
    } else {
      break
    }
  }
}