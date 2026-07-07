import { ItemState } from "./itemState.js"
import { PatchResult } from "./patch.js"

export class VirtualItem {
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  patchResult: PatchResult = PatchResult.Survive

  constructor(
    public state: ItemState,
    public key: any,
    public index: number,
    public node: Node,
    public firstNode: Node | undefined,
    public lastNode: Node | undefined
  ) { }

  updateIndex(index: number) {
    this.index = index
    this.state.updateIndex(index)
  }

  unsubscribeFromExternalState() {
    this.state.unsubscribeFromExternalState()
  }
}
