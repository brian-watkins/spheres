import { ListenerNode, runUserEffects, StateListener, StatePublisher, StateTag, Subscriber } from "../../tokenRegistry";

interface TrieNode {
  tag: StateTag;
  hasListeners: boolean
  children: Record<string, TrieNode>;
}

export type PropertyWriteHandler = (tags: Array<StateTag>, value: any) => void

export class EntityPublisher extends EventTarget implements StatePublisher<any> {
  private root: TrieNode;
  private diff: [old: any, new: any] = [undefined, undefined]
  private writeListeners: Array<PropertyWriteHandler> = []

  constructor(private currentValue: any) {
    super();
    this.root = {
      tag: "",
      hasListeners: true,
      children: { "$": { tag: "$", hasListeners: false, children: {} } }
    };
  }

  onPropertyWrite(handler: PropertyWriteHandler) {
    this.writeListeners.push(handler)
  }

  addListener(subscriber: Subscriber, tags: Array<StateTag> = ["$"]): void {
    // subscriber is an event listener and will (?) only get subscribed
    // once even if this is called multiple times
    // but shouldn't the event type include the tags? So we only notify and publish
    // those subscribers that are relevant? Could also have the tags be part of the event data?
    const tagName = tags.join(".")
    this.addEventListener(`spheres-notify-${tagName}`, subscriber, { once: true })
    this.addEventListener(`spheres-publish-${tagName}`, subscriber, { once: true })

    // console.log("Adding listener", tagName)

    // Navigate/create the path in the trie
    let currentNode = this.root;
    for (const tag of tags) {
      const key = String(tag);
      if (!currentNode.children[key]) {
        currentNode.children[key] = {
          tag: tag,
          hasListeners: false,
          children: {}
        };
      }
      currentNode = currentNode.children[key];
    }
    currentNode.hasListeners = true
  }

  removeListener(_: StateListener): void {
    throw new Error("Method not implemented.");
  }

  notifyListeners(nodes: Array<ListenerNode>, tags?: Array<string>) {
    // this.dispatchEvent(new CustomEvent(`spheres-notify-${tags?.join(".")}`))
    // console.log("notify listeners", tags)
    // const allTags = this.getListenersInPath(tags ?? [])
    // console.log("All tags", allTags)
    for (const tagName of tags ?? []) {
      // console.log("Dispatching notify event", tagName)
      this.dispatchEvent(new CustomEvent(`spheres-notify-${tagName}`, { detail: nodes }))
    }
  }

  runListeners(tags?: Array<string>) {
    // console.log("run listeners", tags)
    // const allTags = this.getListenersInPath(tags ?? [])  
    // console.log("All tags", allTags)
    for (const tagName of tags ?? []) {
      // console.log("Dispatching publish event", tagName)
      this.dispatchEvent(new CustomEvent(`spheres-publish-${tagName}`))
    }
  }

  private getListenersInPath(tags: Array<StateTag>) {
    return this.getParentTags(tags ?? ["$"])
      .concat(this.getTagsWithPrefix(tags ?? ["$"]))
      .map(tags => tags.join("."))
  }

  runUserEffects(nodes: Array<ListenerNode>, _?: Array<StateTag>) {
    // console.log("Running user effects", nodes, tags)
    runUserEffects(nodes)
  }

  write(val: any, at?: Array<StateTag>): void {
    console.log("Entity publisher should write", val, at)
    if (at === undefined) {
      // console.log("No tags passed to write??")
      // this.currentValue = val
      this.diff = [ this.currentValue, val ]
      this.update(val, ["$"])
      return
    }

    // const parentVal = at.slice(0, -1)
    //   .reduce((acc, cur) => acc[cur], this.getValue())
    // console.log("Writing value", this.getValue(), at, val)
    const parentVal = getValueAt(this.getValue(), at.slice(0, -1))

    // console.log("entity publisher write", parentVal, at[at.length - 1], val)

    // I'm mutating the value ... so how do I compare old and new?
    this.diff = [ parentVal[at[at.length - 1]], val ]
    parentVal[at[at.length - 1]] = val

    // this.root.update(this.tag())
    this.update(undefined, at)

    this.writeListeners.forEach(handler => {
      handler(at, val)
    })

  }

  private update(value: any, tags: Array<StateTag>) {
    // this.oldValue = this.currentValue
    if (value !== undefined) {
      this.currentValue = value
    }

    const allTags = this.getListenersInPath(tags ?? [])

    const userEffects: Array<ListenerNode> = []
    // not sure what we have todo user effects like this, why
    // not just track in the state publisher and run at the end of the list?
    this.notifyListeners(userEffects, allTags)

    console.log("Run listeners with tags", tags)
    this.runListeners(allTags)
    console.log("Done running listeners")

    this.runUserEffects(userEffects, tags)

    this.diff = [undefined, undefined]
  }


  getValue(props?: Array<StateTag>) {
    return getValueAt(this.currentValue, props)
  }

  private getParentTags(prefix: Array<StateTag>): Array<Array<StateTag>> {
    const result: Array<Array<StateTag>> = []

    let currentNode: TrieNode | undefined = this.root;
    let currentPath = []
    for (const tag of prefix) {
      const key = String(tag);
      currentNode = currentNode.children[key];
      if (currentNode === undefined) {
        return result
      }
      currentPath.push(currentNode.tag)
      if (currentNode.hasListeners) {
        result.push([...currentPath])
      }
      // if (!currentNode) {
      //   // Prefix not found, return empty array
      //   console.log("Prefix not found", prefix)
      //   return result;
      // }
    }

    // for (let i = 1; i < prefix.length; i++) {
    //   result.push(prefix.slice(0, -(prefix.length - i)))
    // }
    // result.push(prefix)
    // console.log("Parent tags", result.slice(0, -1))

    return result.slice(0, -1)
  }

  /**
   * Get all complete tag paths that start with the given prefix
   */
  private getTagsWithPrefix(prefix: Array<StateTag>): Array<Array<StateTag>> {
    const result: Array<Array<StateTag>> = [];

    // could we diff these here? to see which ones need to actually be updated?
    // We also probably don't really need the prefix map but at least that lets us know
    // what is a child. We just need a way to know if there actually are subscribers
    // at a given level so we don't emit events when there's no subscriber for that set
    // of tags

    // Navigate to the prefix node
    let currentNode: TrieNode | undefined = this.root;
    for (const tag of prefix) {
      const key = String(tag);
      currentNode = currentNode.children[key];
      if (!currentNode) {
        // Prefix not found, return empty array
        // console.log("Prefix not found", prefix)
        return result;
      }
    }

    // Collect all complete paths from this node
    // Couldn't this also be any tag paths that startWith this tag path?
    this.collectAllPaths(currentNode, prefix, [], result);

    // console.log("Got all child paths", result)

    return result;
  }

  private collectAllPaths(node: TrieNode, currentPath: Array<StateTag>, childPath: Array<StateTag>, result: Array<Array<StateTag>>): void {
    // Add the current path as it represents a listener AND if there is a diff
    if (node.hasListeners) {
      if (getValueAt(this.diff[0], childPath) === getValueAt(this.diff[1], childPath)) {
        console.log("No diff at", childPath)
        return
      } else {
        console.log("Got diff", this.diff, childPath)
      }
      result.push([...currentPath]);
    }

    // Recursively collect from all children
    for (const key in node.children) {
      const childNode = node.children[key];
      this.collectAllPaths(childNode, [...currentPath, childNode.tag], [...childPath, childNode.tag], result);
    }
  }
}

function getValueAt(current: any, props: Array<StateTag> = []) {
  console.log("Getting value at", current, props)
  return props.filter(tag => tag !== "$").reduce((acc, cur) => acc[cur], current) ?? current
}


// what I want is to somehow subscribe in such a way that
// it will be triggered by a write. but only those that need to update

// write: $.[1]
// and say there are three items each subscribe to *.label.name

// in this case we know partly what has changed
// ideally this should rule out the other subscribers
// we could do something where we have a bunch of objects in a graph 
// and when you subscribe it bubbles the event up that tree.
// So we would get the object corresponding to $.[1] and dispatch events
// and then bubble to its children

// Or we just have a list of paths and when a write comes in we find
// all the paths that start with that write and dispatch events to the ones
// that match. but we'd also need to check the value at that path before dispatching

// the subscriber should *check if I need to* update if $, [1], or label changes
// And definitely update if name changes.
