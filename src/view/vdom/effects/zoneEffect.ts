import { GetState, ReactiveEffect, Store } from "../../../store/index.js"
import { createNode } from "../renderToDom.js"
// import { patch, virtualize } from "../renderToDom.js"
import { VirtualNode } from "../virtualNode.js"
import { EffectGenerator } from "./effectGenerator.js"

export interface NodeReference {
  node: Node | undefined
}

// NOTE -- do we even need this anymore? Basically we use this to handle
// showing and hiding views now. So that would probably not work.

// And note that the way we implemented show/hide -- it's either selecting
// to show some view or its showing the default, which is just an empty text
// node.
// So maybe we just make something like SelectZoneEffect and it can literally
// switch between views ... it would cache the views lazily and then just switch
// back and forth based on state somehow.

export class ZoneEffect implements ReactiveEffect {
  private currentNode!: Node

  // NOTE: What is nodeReference supposed to do here? This is like if the root node
  // changes I think ... but what test drives that out?
  // We might not actually need that anymore? The nodeReference is the stateful vnode itself
  // and this is only used by the template ...
  constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, _: NodeReference, private context: any = undefined) {
    if (placeholderNode) {
      this.currentNode = placeholderNode
    }
  }

  get node(): Node {
    return this.currentNode
  }

  init(get: GetState) {
    const initialVNode = this.generator(get, this.context)
    const nextNode = createNode(this.store, initialVNode)
    if (this.currentNode) {
      this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    }
    this.currentNode = nextNode
  }

  run(get: GetState) {
    // Note that right now this should be returning one of two exact virtual
    // nodes. (it's not actually generating the vnode)

    // But note too that this recreates the node every time
    // What we should do probably is use a template here
    // We can't actually cache the nodes while they are not visible
    // because if there are any updates
    // to the effects then they will unsubscribe automatically since the
    // node will not be attached to the dom. And when it is reattached the
    // effects will no longer update
    
    // Creating a new node works here. Creating a new template instance would
    // maybe be faster? But it probably doesn't matter in a case like this
    const nextVNode = this.generator(get, this.context)
    const nextNode = createNode(this.store, nextVNode)
    this.currentNode.parentNode!.replaceChild(nextNode, this.currentNode)
    this.currentNode = nextNode
  }

}

// export class PatchZoneEffect implements ReactiveEffect {
//   private current: VirtualNode | null = null

//   constructor(private store: Store, placeholderNode: Node | undefined, private generator: EffectGenerator<VirtualNode>, private nodeReference: NodeReference, private context: any = undefined) {
//     // if (placeholderNode !== undefined) {
//       // this.current = virtualize(placeholderNode)
//     // }
//   }

//   get node(): Node {
//     return this.current!.node!
//   }

//   init(get: GetState): void {
//     this.doPatch(get)
//   }

//   run(get: GetState): void {
//     if (!this.node?.isConnected) {
//       return
//     }

//     this.doPatch(get)
//   }

//   private doPatch(get: GetState) {
//     // this.current = patch(this.store, this.current, this.generator(get, this.context))
//     // this.nodeReference.node = this.node
//   }
// }
