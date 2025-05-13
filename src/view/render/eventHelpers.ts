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
  const oldStopPropagation = event.stopPropagation.bind(event)
  const oldStopImmediate = event.stopImmediatePropagation.bind(event)
  
  let hasStoppedPropagation = false
  
  event.stopPropagation = () => {
    hasStoppedPropagation = true
    oldStopPropagation()
  }

  event.stopImmediatePropagation = () => {
    hasStoppedPropagation = true
    oldStopImmediate()
  }

  let currentTarget: EventTarget | null = null
  let wrapped = Object.defineProperty(event, "currentTarget", {
    get: () => currentTarget
  })

  wrapped = Object.defineProperty(wrapped, "setCurrentTarget", {
    value: (target: EventTarget) => {
      currentTarget = target
    }
  })

  wrapped = Object.defineProperty(wrapped, "propagationStopped", {
    get: () => hasStoppedPropagation,
  })

  return wrapped as WrappedEvent
}