export function setEventAttribute(element: Element, eventType: string, elementId: string) {
  element.setAttribute(`data-spheres-${eventType}`, elementId)
}

export function getEventAttribute(element: Element, eventType: string): string | null {
  return element.getAttribute(`data-spheres-${eventType}`)
}

interface WrappedEvent extends Event {
  propagationStopped: boolean
  setCurrentTarget(target: EventTarget): void
}

export function wrapEvent(event: Event): WrappedEvent {
  let hasStoppedPropagation: boolean = false
  let currentTarget: EventTarget | null = null

  return new Proxy(event, {
    get(target, property) {
      if (property === "setCurrentTarget") {
        return (target: EventTarget) => {
          currentTarget = target
        }
      }
      if (property === "propagationStopped") {
        return hasStoppedPropagation
      }
      if (property === "stopPropagation") {
        return () => {
          hasStoppedPropagation = true
          target.stopPropagation()
        }
      }
      if (property === "currentTarget") {
        return currentTarget
      }
      if (property === "stopImmediatePropagation") {
        return () => {
          hasStoppedPropagation = true
          target.stopImmediatePropagation()
        }
      }
      return Reflect.get(target, property)
    },
  }) as WrappedEvent
}