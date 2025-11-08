import { usePage } from "best-behavior/page"

declare global {
  interface Window {
    __element_ref: WeakRef<any>
  }
}

export function requestGC(): Promise<void> {
  return usePage(async (page) => {
    await page.requestGC()
    await new Promise(resolve => setTimeout(resolve, 50))
  })
}