import { GetState, State } from "./store"

type UpdateNode = EffectListener | DerivedListener

interface TreeNode {
  parent: UpdateNode | undefined
  children?: Set<UpdateNode>
}

export class UpdatePlan {
  private rootNodes: Set<UpdateNode> = new Set()
  private treeNodes: Map<UpdateNode, TreeNode> = new Map()

  constructor(private getController: <T>(token: State<T>) => StateController<T>) { }

  addEffect(parent: UpdateNode | undefined, effect: UpdateNode, version: number): boolean {
    let currentVersion = versionMap.get(effect)
    if (currentVersion === undefined) {
      currentVersion = 0
      versionMap.set(effect, 0)
    }

    if (version !== currentVersion) {
      return false
    }

    // get metadata for node
    const treeNode = this.treeNodes.get(effect)
    if (treeNode === undefined) {
      this.treeNodes.set(effect, {
        parent
      })
      if (parent === undefined) {
        this.rootNodes.add(effect)
      } else {
        this.addChild(parent, effect)
      }
    } else {
      if (treeNode.parent) {
        this.removeChild(treeNode.parent, effect)
      }
      if (parent === undefined) {
        this.rootNodes.add(effect)
      } else {
        this.addChild(parent, effect)
      }
      
      treeNode.parent = parent

    }
    // look at parent of node
    // if there is parent, remove this node from its children
    // add node to parent's children
    // set parent of node

    return true
  }

  addChild(parent: UpdateNode, effect: UpdateNode) {
    const parentTreeNode = this.treeNodes.get(parent)!
    const children = parentTreeNode.children
    if (children === undefined) {
      parentTreeNode.children = new Set()
    }
    parentTreeNode.children!.add(effect)
  }

  removeChild(parent: UpdateNode, effect: UpdateNode) {
    this.treeNodes.get(parent)!.children!.delete(effect)
  }

  getGetStateForNode(node: UpdateNode): GetState {
    return (token) => {
      const controller = this.getController(token)

      let version = versionMap.get(node)
      if (version === undefined) {
        version = 0
        versionMap.set(node, 0)
      }
  
      controller.addListener(node, version)

      return controller.value
    }
  } 

  execute() {
    // when executing the plan, we need to know if a given derived state
    // changed its value. If not then we do not visit any of its children
    // because by now the tree is optimized in that way
    // But how do we know if the value has changed?
    this.executeForNode(this.rootNodes)
  }

  private getChildrenForNode(node: UpdateNode): Set<UpdateNode> {
    return this.treeNodes.get(node)?.children ?? new Set()
  }

  private executeForNode(nodes: Set<UpdateNode>) {
    // iterate over nodes in set
    // for each one call run with the plan if its derived state
    // or just getValue if its an effect
    for (const node of nodes) {
      versionMap.set(node, versionMap.get(node)! + 1)
      if ("derive" in node) {
        if (node.derive(this.getGetStateForNode(node))) {
          // then execute on node's children
          this.executeForNode(this.getChildrenForNode(node))
        } else {
          // value did not change so do nothng to the tree under this node
        }
      } else {
        node.run(this.getGetStateForNode(node))
      }
    }
  }
}

export interface DerivedListener {
  // listeners: Map<StateListener, number>
  update(plan: UpdatePlan): void
  derive(get: GetState): boolean
}

export interface EffectListener {
  run(get: GetState): void
}

export type StateListener = DerivedListener | EffectListener

// export interface StateListener {
//   // notify(version: number): boolean
//   // update(hasChanged: boolean): void
//   listeners?: Map<StateListener, number>
//   // removeListener?: (listener: StateListener) => void
//   run(get: GetState): void
// }

// interface StateListenerOwner {
  // removeListener: (listener: StateListener) => void
// }

export interface StateController<T> {
  addListener(listener: StateListener, version: number): void
  removeListener(listener: StateListener): void
  value: T
}

export class ConstantStateController<T> implements StateController<T> {
  constructor(public value: T) { }

  addListener(): void { }

  removeListener(): void { }
}

export interface ContainerController<T, M = T> extends StateController<T> {
  write(message: M): void
  accept(message: M): void
  publish(value: T): void
}

// interface UpdateTrackingNode {
//   dependencies: number
//   hasChanged: boolean
// }

export class SimpleStateController<T> implements ContainerController<T> {
  private listeners: Map<StateListener, number> = new Map()
  // private derivedListeners: Map<DerivedListener, number> = new Map()
  // private effects: Map<EffectListener, number> = new Map()

  constructor(private _value: T, private getController: <S>(token: State<S>) => StateController<S>) { }

  addListener(listener: StateListener, version: number) {
    this.listeners.set(listener, version)
  }

  removeListener(listener: StateListener) {
    this.listeners.delete(listener)
  }

  write(value: any) {
    this.accept(value)
  }

  accept(value: any) {
    this.publish(value)
  }

  publish(value: T) {
    if (Object.is(this._value, value)) return

    this._value = value

    // const listenerStack: Array<UpdateTrackingNode> = []
    // const nodeMap = new Map<StateListener, UpdateTrackingNode>()
    const plan = new UpdatePlan(this.getController)
    for (const [listener, version] of this.listeners) {
      // for each listener, update the plan.
      // let currentVersion = versionMap.get(listener)!
      // if (currentVersion === undefined) {
      //   currentVersion = 0
      //   versionMap.set(listener, 0)
      // }

      // if (version !== currentVersion) {
      //   // need to unsubscribe
      //   console.log("Unsubscribing due to version mismatch!")
      //   this.removeListener(listener)
      //   continue
      // }

      if (plan.addEffect(undefined, listener as EffectListener, version)) {
        if ("update" in listener) {
          listener.update(plan)
        }
      } else {
        this.removeListener(listener)
      }

      // REVISIT
      // if ("update" in listener) {
      // listener.update(plan)
      // }

      // if (!accepted) {
      //   // if it returns undefined then remove the listener and don't add
      //   // anything to the stack
      //   this.removeListener(listener)
      // }
      // notify(nodeMap, this, listener, version)
    }

    plan.execute()

    // Then here we would iterate over the stack and call update
    // for (const listener of Array.from(this.listeners.keys())) {
    // listener.update(true)
    // update(nodeMap, this.runListener, listener, true)
    // }
  }

  get value(): T {
    return this._value
  }
}

export const versionMap = new WeakMap<StateListener, number>()

// function notify(nodes: Map<StateListener, UpdateTrackingNode>, owner: StateListenerOwner, listener: StateListener, version: number) {
//   //@ts-ignore
//   console.log("Notify", listener.derivation)
//   // need to get the current listener version.
//   // if the version is not equal to the version for this listener then return false or something
//   let currentVersion = versionMap.get(listener)!
//   // if (currentVersion === undefined) {
//   //   currentVersion = 0
//   //   versionMap.set(listener, 0)
//   // }

//   if (version !== currentVersion) {
//     // need to unsubscribe
//     console.log("Unsubscribing due to version mismatch!")
//     owner.removeListener(listener)
//     return
//   }

//   let current = nodes.get(listener)
//   if (current === undefined) {
//     current = {
//       dependencies: 0,
//       hasChanged: false
//     }
//     nodes.set(listener, current)

//     // notifiy derived
//     if ("listeners" in listener) {
//       // Only notify listeners once the first time we get notified
//       for (const [child, childVersion] of listener.listeners) {
//         // each child should have a version associated with it
//         //@ts-ignore
//         notify(nodes, listener, child, childVersion)
//       }  
//     }
//   }
//   current.dependencies = current.dependencies + 1
// }

// function update(nodes: Map<StateListener, UpdateTrackingNode>, runListener: (listener: StateListener) => void, listener: StateListener, hasChanged: boolean) {
//   const node = nodes.get(listener)
//   if (node === undefined) {
//     throw new Error("HUH??")
//   }

//   node.dependencies = node.dependencies - 1
//   if (hasChanged) node.hasChanged = true

//   if (node.dependencies === 0) {
//     //@ts-ignore
//     console.log("Dependencies are zero so updating", listener.derivation)
//     if (node.hasChanged) {
//       versionMap.set(listener, versionMap.get(listener)! + 1)
//       // here we need to know whether the value has changed.
//       // Should the DerivedStateController alert its own children?
//       // And ReactiveEffect doesn't have children so it doesn't matter
//       // But for DerivedStateController to do that, it would need to
//       // know about update function, nodes, runListener
//       runListener(listener)
//     } else {
//       console.log("Node hasn't changed")
//     }

//     for (const child of listener.listeners?.keys() ?? []) {
//       // I need to know if I have changed as part of the run listener ...
//       // will node.hasChanged update here if we update it inside run? Seems very sketchy
//       update(nodes, runListener, child, node.hasChanged)
//     }  
//   } else {
//     //@ts-ignore
//     console.log("Dependencies not zero", node.dependencies, listener.derivation)
//   }

// }