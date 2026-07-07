import { VirtualItem } from "./virtualItem.js"

export enum PatchResult {
  Survive, Delete, Replace
}

export enum ListUpdateType {
  Insert, Delete, Change
}

export interface ListInsert {
  type: ListUpdateType.Insert
  data: any
  before: VirtualItem
  index: number
}

export interface ListChangeItem {
  type: ListUpdateType.Change
  item: VirtualItem
  data: any
  index: number
}

export interface ListDelete {
  type: ListUpdateType.Delete
  item: VirtualItem
}

export type ListUpdate = ListInsert | ListDelete | ListChangeItem

export class ListPatch {
  readonly updates: Array<ListUpdate> = []
  index: number = 0
  someItemRemainsInPlace: boolean = false
  someItemMoves: boolean = false

  private itemCache: Map<any, VirtualItem> = new Map()

  addUpdate(update: ListUpdate) {
    this.updates.push(update)
  }

  getItem(key: any): VirtualItem | undefined {
    return this.itemCache.get(key)
  }

  setItem(item: VirtualItem) {
    this.itemCache.set(item.key, item)
  }

  get replacingAllItems(): boolean {
    return !this.someItemRemainsInPlace && !this.someItemMoves
  }

  get onlyAppendingItems(): boolean {
    return this.updates.length === 0
  }

  scan(first: VirtualItem | undefined, data: Array<any>) {
    let item: VirtualItem | undefined = first
    let index = 0
    let someItemRemainsInPlace = false
    while (item !== undefined) {
      if (index >= data.length) {
        // ran out of new data so delete; cache because may have moved earlier
        this.setItem(item)
        this.addUpdate({
          type: ListUpdateType.Delete,
          item
        })
        item.patchResult = PatchResult.Delete
        item = item.next
        continue
      }

      if (item.key === data[index]) {
        // there is a match so update index if necessary and go to the next
        someItemRemainsInPlace = true
        if (item.index !== index) {
          item.updateIndex(index)
        }

        item = item.next
        index = index + 1
        continue
      }

      if (item.key === data[index + 1]) {
        // insert an item and then go to next data so we get back on track
        this.addUpdate({
          type: ListUpdateType.Insert,
          data: data[index],
          before: item,
          index
        })

        index = index + 1
        continue
      }

      if (data[index] === item.next?.key) {
        // delete an item so cache and skip to next item
        // but keep data the same so we get back on track
        item.patchResult = PatchResult.Delete
        this.setItem(item)
        this.addUpdate({
          type: ListUpdateType.Delete,
          item
        })

        if (item.next !== undefined) {
          // Cache next in case anything needs to be inserted
          // before this item that is deleted
          this.setItem(item.next)
        }

        item = item.next
        continue
      }

      // by default, change the item in this slot
      // and cache the current in case it is moved
      this.addUpdate({
        type: ListUpdateType.Change,
        item,
        data: data[index],
        index
      })

      this.setItem(item)
      item.patchResult = PatchResult.Replace

      if (item.next !== undefined && item.next.key === data[index + 1]) {
        this.setItem(item.next)
      }

      item = item.next
      index = index + 1
    }

    this.index = index
    this.someItemRemainsInPlace = someItemRemainsInPlace
  }

  scanForItemsToRemove(data: Array<any>): Array<VirtualItem> {
    for (let x = this.index; x < data.length; x++) {
      const item = this.getItem(data[x])
      if (item !== undefined) {
        this.someItemMoves = true
        item.patchResult = PatchResult.Survive
      }
    }

    const itemsToRemove: Array<VirtualItem> = []
    for (const update of this.updates) {
      switch (update.type) {
        case ListUpdateType.Change: {
          const item = this.getItem(update.data)
          if (item !== undefined) {
            this.someItemMoves = true
            item.patchResult = PatchResult.Survive
          }
          break
        }
        case ListUpdateType.Insert: {
          const item = this.getItem(update.data)
          if (item !== undefined) {
            this.someItemMoves = true
            item.patchResult = PatchResult.Survive
          }
          break
        }
        case ListUpdateType.Delete: {
          itemsToRemove.push(update.item)
          break
        }
      }
    }

    return itemsToRemove
  }
}
