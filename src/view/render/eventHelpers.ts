import { spheresTemplateData } from "./index.js"

export function setEventAttribute(element: Element, eventType: string, elementId: string) {
  element.setAttribute(`data-spheres-${eventType}`, elementId)
}

export function getEventAttribute(element: Element, eventType: string): string {
  return element.getAttribute(`data-spheres-${eventType}`)!
}

export function getNearestElementHandlingEvent(target: Element, eventType: string): Element | null {
  return target.closest(`[data-spheres-${eventType}]`)
}

export function setNearestTemplateArgs(target: Element) {
  const root = target.closest(`[data-spheres-template]`)!
  // @ts-ignore
  root[spheresTemplateData]?.()
}
