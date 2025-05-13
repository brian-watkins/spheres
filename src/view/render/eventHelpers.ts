export function setEventAttribute(element: Element, eventType: string, elementId: string) {
  element.setAttribute(`data-spheres-${eventType}`, elementId)
}

export function getEventAttribute(element: Element, eventType: string): string | null {
  return element.getAttribute(`data-spheres-${eventType}`)
}

export class EventWrapper implements Event {
  NONE: 0 = 0
  CAPTURING_PHASE: 1 = 1
  AT_TARGET: 2 = 2
  BUBBLING_PHASE: 3 = 3

  currentTarget: EventTarget | null

  propagationStopped: boolean = false

  constructor(private event: Event) {
    this.currentTarget = event.currentTarget
  }

  get bubbles(): boolean {
    return this.event.bubbles
  }

  // deprecated
  cancelBubble: boolean = false

  get cancelable(): boolean {
    return this.event.cancelable
  }

  get composed(): boolean {
    return this.event.composed
  }

  get defaultPrevented(): boolean {
    return this.event.defaultPrevented
  }

  get eventPhase(): number {
    return this.event.eventPhase
  }

  get isTrusted(): boolean {
    return this.event.isTrusted
  }

  get returnValue(): boolean {
    return this.event.returnValue
  }

  get srcElement(): EventTarget | null {
    return this.event.srcElement
  }

  get target(): EventTarget | null {
    return this.event.target
  }

  get timeStamp(): number {
    return this.event.timeStamp
  }

  get type(): string {
    return this.event.type
  }

  composedPath(): EventTarget[] {
    return this.event.composedPath()
  }

  initEvent(): void {
    // nothing deprecated
  }

  preventDefault(): void {
    this.event.preventDefault()
  }

  stopImmediatePropagation(): void {
    this.propagationStopped = true
    this.event.stopImmediatePropagation()
  }

  stopPropagation(): void {
    this.propagationStopped = true
    this.event.stopPropagation()
  }
}