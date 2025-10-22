import { Entity } from "../../../store/index.js";
import { EntityPropertyPublisher, EntityWriter } from "../../../store/state/entity.js";
import { getPublisher, GetState, OverlayTokenRegistry, State, StateListener, StateListenerType, StatePublisher, TokenRegistry } from "../../../store/tokenRegistry.js"
import { DOMTemplate, render } from "../domTemplate.js";
import { ListEntityTemplateContext } from "../templateContext.js";

export class ListEntityEffect implements StateListener {
  readonly type = StateListenerType.SystemEffect
  private first: VirtualItem | undefined
  private parentNode!: Node
  private itemCache: Map<any, VirtualItem> = new Map()
  private firstUpdate: VirtualItem | undefined
  private lastUpdate: VirtualItem | undefined
  private rootEntity!: Entity<Array<any>>
  private rootPublisher!: EntityWriter

  constructor(
    private registry: TokenRegistry,
    private domTemplate: DOMTemplate,
    private query: (get: GetState) => Entity<Array<any>>,
    private templateContext: ListEntityTemplateContext<any>,
    private listStart: Node,
    private listEnd: Node,
  ) { }

  init(get: GetState): void {
    this.rootEntity = this.query(get)
    this.rootPublisher = this.rootEntity[getPublisher](this.registry) as EntityWriter

    this.patch(get(this.rootEntity))

    // this.parentNode = this.listStart.parentNode!

    // for (let index = 0; index < listData.length; index++) {
    //   // const next = this.createItem(index, new EntityPropertyPublisher(rootPublisher, index))
    //   const next = this.createItem(index, rootPublisher, entity)
    //   this.appendNode(parentNode, next)
    // }
  }

  run(get: GetState): void {
    console.log("update list in list entity")

    this.rootEntity = this.query(get)
    this.rootPublisher = this.rootEntity[getPublisher](this.registry) as EntityWriter

    this.patch(get(this.rootEntity))
  }

  private patch(data: Array<any>) {
    if (data.length === 0) {
      if (this.first !== undefined) {
        this.removeAllAfter(this.first)
        this.first = undefined
      }
      return
    }

    this.parentNode = this.listStart.parentNode!

    this.first = this.updateFirst(data[0])

    this.updateRest(this.first, data)

    this.itemCache.clear()
    this.firstUpdate = undefined
    this.lastUpdate = undefined
  }

  private updateFirst(firstData: any): VirtualItem {
    if (this.first === undefined) {
      const item = this.createItem(0, firstData)
      this.appendNode(item)
      return item
    }

    if (this.first.key === firstData) {
      return this.first
    }

    if (this.first.next?.key === firstData) {
      this.itemCache.set(this.first.key, this.first)
      this.removeNode(this.first)
      this.first.isDetached = true
      this.first = this.first.next
      this.first!.prev = undefined
      // if (this.usesIndex && this.first !== undefined) {
      //   this.updateIndex(0, this.first)
      // }

      return this.first!
    }

    this.firstUpdate = this.first
    this.firstUpdate.nextData = firstData
    this.lastUpdate = this.firstUpdate
    this.itemCache.set(this.first.key, this.first)

    return this.first
  }

  private updateRest(first: VirtualItem, data: Array<any>) {
    let last = first
    for (let i = 1; i < data.length; i++) {
      last = this.updateItem(i, last, data[i])
      // if (this.usesIndex && last.index !== i) {
      //   this.updateIndex(i, last)
      // }
    }

    if (last?.next !== undefined) {
      this.removeAllAfter(last.next)
      last.next = undefined
    }

    this.updateChangedItems()
  }

  private updateItem(index: number, last: VirtualItem, data: any): VirtualItem {
    const current = last.next

    if (current === undefined) {
      const next = this.createItem(index, data)
      this.appendNode(next)
      last.next = next
      next.prev = last
      return next
    }

    if (data === current.key) {
      return current
    }

    if (data === current.next?.key) {
      this.itemCache.set(current.key, current)
      this.removeNode(current)
      current.isDetached = true
      last.next = current.next
      current.next!.prev = last
      return current.next!
    }

    if (this.lastUpdate === undefined) {
      this.firstUpdate = current
      this.firstUpdate.nextData = data
      this.lastUpdate = this.firstUpdate
    } else {
      this.lastUpdate.nextUpdate = current
      current.nextData = data
      this.lastUpdate = current
    }
    this.itemCache.set(current.key, current)

    return current
  }

  private updateChangedItems() {
    let nextUpdate = this.firstUpdate
    while (nextUpdate !== undefined) {
      const data = nextUpdate.nextData
      const item = nextUpdate

      const cached = this.itemCache.get(data)

      if (cached !== undefined) {
        const itemToMove = cached.clone()
        if (itemToMove.isDetached) {
          if (item.isDetached) {
            this.insertNode(item, itemToMove)
            this.replaceListItem(item, itemToMove)
            item.isDetached = false
          } else {
            this.replaceNode(item, itemToMove)
            this.replaceListItem(item, itemToMove)
            item.isDetached = true
          }

          itemToMove.isDetached = false
        } else {
          this.replaceNode(item, itemToMove)
          this.replaceListItem(item, itemToMove)
          if (this.domTemplate.isFragment) {
            this.itemCache.delete(item.key)
          }
          item.isDetached = true
          cached.isDetached = true
        }
        // if (this.usesIndex && itemToMove.index !== item.index) {
        if (itemToMove.index !== item.index) {
          this.updateIndex(item.index, itemToMove)
        }
      } else {
        if (item.isDetached) {
          const next = this.createItem(item.index, data)
          this.insertNode(item, next)
          this.replaceListItem(item, next)
          item.isDetached = false
        } else {
          if (data.id !== undefined && data.id === item.key.id) {
            this.updateItemData(item, data)
          } else {
            const next = this.createItem(item.index, data)
            this.replaceNode(item, next)
            this.replaceListItem(item, next)
            if (next.prev === undefined) {
              this.first = next
            }
          }
        }
      }

      nextUpdate = nextUpdate.nextUpdate
      item.nextData = undefined
      item.nextUpdate = undefined
    }
  }

  private appendNode(item: VirtualItem): void {
    this.parentNode.insertBefore(item.node, this.listEnd)
  }

  private insertNode(item: VirtualItem, next: VirtualItem): void {
    // Seems like this cannot happen where item is the first in the list
    // so this should be ok to assume item.prev is not undefined
    const last = item.prev!
    if (this.domTemplate.isFragment) {
      if (next.node.childNodes.length > 0) {
        this.parentNode.insertBefore(next.node, last.node.nextSibling)
      } else {
        const range = new Range()
        range.setStartBefore(next.firstNode!)
        range.setEndAfter(next.lastNode!)
        const frag = range.extractContents()
        this.parentNode.insertBefore(frag, last.node.nextSibling)
      }
    } else {
      this.parentNode.insertBefore(next.node, last.node.nextSibling)
    }
  }

  private replaceNode(current: VirtualItem, next: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(current.firstNode!)
      range.setEndAfter(current.lastNode!)
      range.deleteContents()
      if (next.node.childNodes.length > 0) {
        this.parentNode.insertBefore(next.node, current.next?.firstNode ?? this.listEnd)
      } else {
        const range = new Range()
        range.setStartBefore(next.firstNode!)
        range.setEndAfter(next.lastNode!)
        const frag = range.extractContents()
        this.parentNode.insertBefore(frag, current.next?.firstNode ?? this.listEnd)
      }
    } else {
      this.parentNode.replaceChild(next.node, current.node)
    }
  }

  private replaceListItem(current: VirtualItem, replacement: VirtualItem) {
    if (current.prev) {
      current.prev.next = replacement
    }
    replacement.prev = current.prev
    if (current.next) {
      current.next.prev = replacement
    }
    replacement.next = current.next
    // current.unsubscribeFromExternalState()
  }

  private removeNode(item: VirtualItem): void {
    if (this.domTemplate.isFragment) {
      const range = new Range()
      range.setStartBefore(item.firstNode!)
      range.setEndAfter(item.lastNode!)
      range.deleteContents()
    } else {
      this.parentNode.removeChild(item.node)
    }
    // item.unsubscribeFromExternalState()
  }

  private removeAllAfter(start: VirtualItem) {
    if (start === undefined) return

    const range = new Range()
    range.setEndBefore(this.listEnd)

    if (this.domTemplate.isFragment) {
      range.setStartBefore(start.firstNode!)
    } else {
      range.setStartBefore(start.node)
    }

    range.deleteContents()

    let item: VirtualItem | undefined = start
    while (item !== undefined) {
      // item.unsubscribeFromExternalState()
      item = item.next
    }
  }

  private updateItemData(item: VirtualItem, itemData: any): void {
    // item.updateItemData(itemData)
    // item.key = itemData
  }

  private updateIndex(index: number, item: VirtualItem): void {
    // item.updateIndex(index)
    console.log("updating index", item.key, index)
    item.index = index
    // need to put this in a better spot
    item.filter = `$.${index}`
  }


  private createItem(index: number, key: any): VirtualItem {
    const item = new VirtualItem(
      index,
      key,
      this.registry,
      this.templateContext.getItemToken(),
      this.templateContext.getEntityToken(),
      this.rootEntity,
      this.rootPublisher
    )

    const node = render(this.domTemplate, item)
    item.node = node
    // item.setNode(
    //   node,
    //   this.domTemplate.isFragment ? node.firstChild! : undefined,
    //   this.domTemplate.isFragment ? node.lastChild! : undefined
    // )

    return item
  }

  // private appendNode(parentNode: Node, item: VirtualItem): void {
  //   parentNode.insertBefore(item.node, this.listEnd)
  // }

}

class VirtualItem extends OverlayTokenRegistry {
  node!: Node
  firstNode: Node | undefined = undefined
  lastNode: Node | undefined = undefined
  isDetached: boolean = false
  prev: VirtualItem | undefined = undefined
  next: VirtualItem | undefined = undefined
  nextData: any | undefined = undefined
  nextUpdate: VirtualItem | undefined = undefined

  constructor(
    public index: number,
    readonly key: any,
    registry: TokenRegistry,
    private itemToken: State<any>,
    private entityToken: State<Entity<any>>,
    private entity: Entity<any[]>,
    private rootPublisher: StatePublisher<any>,
  ) {
    super(registry)
    this.filter = this.index
  }

  clone(): VirtualItem {
    const clone = new VirtualItem(
      this.index,
      this.key,
      this.parentRegistry,
      this.itemToken,
      this.entityToken,
      this.entity,
      this.rootPublisher
    )

    // clone.setNode(this.node, this.firstNode, this.lastNode)
    clone.node = this.node
    // clone.indexToken = this.indexToken
    // clone.indexPublisher = this.indexPublisher
    clone.isDetached = this.isDetached
    clone.prev = this.prev
    clone.next = this.next

    return clone
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    console.log("get state in overlay registry", token, this.itemToken)
    if (token === this.itemToken) {
      // maybe we just return the root pub
      // then this would subscribe with a tag of `label` or whatever
      // and when running we find the overlay that matches the start and
      // the tag that matches the end?
      // return this.rootPublisher as any
      console.log("returning entity prop publisher for shared token", this.index)
      return new EntityPropertyPublisher(this.rootPublisher, this.index) as any

      // but what if it returned *this* ... would that allow us to do anything?
    }

    if (token === this.entityToken) {
      return {
        getValue: () => {
          return this.entity[this.index]
        }
      } as C
    }

    return this.parentRegistry.getState(token)
  }

}