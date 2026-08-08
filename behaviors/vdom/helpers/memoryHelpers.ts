import { usePage } from "best-behavior/page"

declare global {
  interface Window {
    __element_ref: WeakRef<any>
  }
}

export function requestGC(): Promise<void> {
  return usePage(async (page) => {
    // If an earlier example clicked an element, the mouse remains parked over
    // the page, and whatever element later renders under it becomes the
    // browser's hover/event target. Blink keeps a native reference to that
    // element even after it is removed from the DOM, which makes garbage
    // collection expectations fail depending on example ordering. Moving the
    // mouse forces the browser to recompute its event targets so removed
    // elements can actually be collected.
    await page.mouse.move(0, 0)
    await page.requestGC()
    await new Promise(resolve => setTimeout(resolve, 50))
  })
}