import { Store } from "./store.js";

interface SpheresDecoratedWindow extends Window {
  _spheres_store_data?: () => Map<string, any>
}

declare let window: SpheresDecoratedWindow

export function activateStore(): Store {
  return new Store(window._spheres_store_data?.())
}