import { ViewConfigDelegate } from "./viewConfig"

export interface DomRendererDelegate {
  createElement(tag: string): Element
  useDelegate(tag: string): DomRendererDelegate
  getConfigDelegate(tag: string): ViewConfigDelegate
}