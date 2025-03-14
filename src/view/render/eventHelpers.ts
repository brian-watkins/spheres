export function setEventAttribute(element: Element, eventType: string, elementId: string) {
  element.setAttribute(`data-spheres-${eventType}`, elementId)
}

export function getEventAttribute(element: Element, eventType: string): string {
  return element.getAttribute(`data-spheres-${eventType}`)!
}

export function getNearestElementHandlingEvent(target: Element, eventType: string): Element | null {
  return target.closest(`[data-spheres-${eventType}]`)
}
