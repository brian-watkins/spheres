import { createPublisher, getPublisher, ImmutableStatePublisher, ListenerNode, runListener, State, StateListener, StatePublisher, StateReference, StateTag, Subscriber, TokenRegistry } from "../tokenRegistry.js";
import { StateWriter } from "./publisher/stateWriter.js";

export interface EntityInitializer<T> {
  initialValue: T,
  name?: string
}

// Should we just pass a value here instead?
// export function oldentity<T>(initializer: EntityInitializer<T>): Entity<T> {
//   // const token = new Entity(
//   //   initializer.name,
//   //   initializer.initialValue,
//   // )
//   // // Can we handle ad hoc entities in a view function?
//   // // didCreateToken(token)
//   // return token
//   const writer = new EntityWriter(initializer.initialValue)
//   const token = new EntityState(writer)


//   // this doesn't work because it's using this to look up
//   // the publisher but this is a proxy and 
//   // return makeEntity(initializer.initialValue) as Entity<T>

//   return makeEntity(token) as Entity<T>
// }

export type Entity<T> = StateReference<T> & EntityProxy<T>

// Should be a non-function object type?
type EntityProxy<T> = T extends object ? {
  readonly [K in keyof T]: EntityProxy<T[K]>
} : EntityState<T>

// this could just implement StateReference<T> ...
export class EntityState<T> extends State<T> {

  constructor(private initialValue: T) {
    super(undefined)
  }

  [createPublisher](): StatePublisher<T> {
    // return new EntityWriter(this.value)
    return new EntityPublisher(this.initialValue)
  }

}

// it's weird -- what we're doing is that the token ends up
// knowing how to get the proper value because the token controls what
// publisher we get and except in the root case we return a wrapper
// object that knows how to get, set the property based on its parent.
// And only the stored publisher just has the root value. 
// but could we store this info on the token?

// I think we want to create a new object when you start to access a property
// but then on, we should just add a prop to that object instead of creating a new one?
// the thing is that we don't want to capture the previoud token (receiver) since
// that could be the item token that is reused across list items.

// function makeEntity(ref: StateReference<any>): Entity<any> {
//   return new Proxy(ref, {
//     get(target, prop, receiver) {
//       if (Reflect.has(target, prop)) {
//         return Reflect.get(target, prop, receiver)
//       } else {
//         // console.log("Entity prop for", prop)
//         // return a pub that knows thiis prop
//         // returning a new token basically (which is a stateRef)
//         return makeEntity({
//           [getPublisher](registry) {
//             console.log("get pub in make entity", prop)
//             // using receiver here makes it work because it's the
//             // same instance all the time we use to look up the pub (the proxy)
//             // but not sure if it's a good idea
//             // What would be better here is if we get the prop from the
//             // receiver outside this function and then use that to create
//             // a new property pub with the sequence of properties?
//             const parent = receiver[getPublisher](registry) as EntityPropertyPublisher
//             return new EntityPropertyPublisher(parent, prop as string)
//           }
//         })
//       }
//     },
//   }) as Entity<any>
// }

// function makeEntity(value: any): Entity<any> {
//   console.log("Creating root publisher with value", value)
//   const root = new EntityWriter(value)
//   const rootToken = new EntityState(root)

//   return new Proxy(rootToken, {
//     get(target, prop, receiver) {
//       if (Reflect.has(target, prop)) {
//         console.log("getting prop from root token", prop)
//         return Reflect.get(target, prop, receiver)
//       } else {
//         console.log("Entity prop for", prop)
//         // return a pub that knows thiis prop
//         // returning a new token basically (which is a stateRef)
//         const publisher = new EntityPublisher(root)
//         publisher[addProperty](prop as string | number)
//         const propToken = new EntityState(publisher as unknown as StateWriter<any>)
//         return makeEntityProperty(propToken, publisher)
//         // return {
//         //   [getPublisher](registry) {
//         //     console.log("getting pub", prop)
//         //     return receiver[getPublisher](registry)
//         //   }
//         // } as StateReference<any>
//       }
//     },
//   }) as Entity<any>
// }

// function makeEntityProperty(token: State<any>, publisher: EntityPublisher): Entity<any> {
//   // const publisher = new EntityPublisher(root)
//   // publisher[addProperty](property)

//   return new Proxy(token, {
//     get(target, prop, receiver) {
//       if (Reflect.has(target, prop)) {
//         console.log("getting prop from prop token", prop)
//         return Reflect.get(target, prop, receiver)
//       } else {
//         // console.log("Entity prop for", prop)
//         // return a pub that knows thiis prop
//         // returning a new token basically (which is a stateRef)
//         // publisher[addProperty](prop as string | number)
//         // return receiver
//         publisher[addProperty](prop as string | number)
//         return makeEntityProperty(token, publisher)
//       }
//     },
//   }) as Entity<any>
// }


export const addProperty = Symbol("addProperty")

export function entity<T>(initializer: EntityInitializer<T>): Entity<T> {
  // need to return a state token that will create an EntityPublisher
  // and function as a proxy and return a wrapper around the EntityPublisher
  // with the appropriate list of StateTags
  const entityState = new EntityState(initializer.initialValue)

  return createEntityProxy(entityState)
}

export class PropertyCarrier implements StateReference<any> {
  constructor(readonly token: State<any>, public props: Array<StateTag> = []) { }

  addProperty(prop: StateTag) {
    this.props.push(prop)
  }

  [getPublisher](registry: TokenRegistry): StatePublisher<any> {
    console.log("Property carrier get publisher")
    const entityPublisher = this.token[getPublisher](registry) as EntityPublisher
    return {
      addListener: (subscriber) => {
        // really what I want to do is add a PropertySubscriber
        entityPublisher.addListener(subscriber, this.props)
      },
      getValue: () => {
        console.log("Getting value for carrier", this.props)
        return entityPublisher.getValue(this.props)
      },
      write: (val) => {
        entityPublisher.write(val, this.props)
      }
    } as StateWriter<any>
  }
}

function createEntityProxy<T>(state: StateReference<T>): Entity<T> {
  return new Proxy(state, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        console.log("Calling on target", target, prop, receiver)
        const accessed = Reflect.get(target, prop, target)
        if (typeof accessed === 'function') {
          return accessed.bind(target);
        } else {
          return accessed
        }
      } else {
        if (target instanceof EntityState) {
          console.log("Creating new carrier with prop", prop)
          const carrier = new PropertyCarrier(target)
          carrier.addProperty(prop as StateTag)
          return createEntityProxy(carrier)
        } else {
          console.log("Adding prop for existing carrier", prop)
          // const carrier = new PropertyCarrier(target.token, target.props)
          // carrier.addProperty(prop as StateTag)
          // @ts-ignore
          target.addProperty(prop as StateTag)
          return receiver
          // return createEntityProxy(carrier)
        }

      }
    },
  }) as unknown as Entity<T>
}

interface EntityListenerNode {
  tags: { [key: StateTag]: EntityListenerNode }
  listeners: Array<Subscriber>
}

export type PropertyWriteHandler = (tags: Array<StateTag>, value: any) => void

export class EntityPublisher extends StateWriter<any> {
  // private props: Array<string | number> = []
  private rootListener: EntityListenerNode = { tags: {}, listeners: [] }
  private writeListeners: Array<PropertyWriteHandler> = []

  constructor(value: any) {
    super(value)
    // console.log("Creating entity publisher with value", this.value)
  }

  onPropertyWrite(handler: PropertyWriteHandler) {
    this.writeListeners.push(handler)
  }

  addListener(subscriber: Subscriber, tags?: Array<StateTag>): void {
    // add a subscriber that will only run if tags match. But how does
    // it know what tags have been used for the write?
    // Need to store tags with subscriber
    // Actually -- should store tags with the listener node I think.  
    // subscriber[5] = tags
    super.addListener(subscriber, tags)
    // console.log("got tags", tags)
    // // this.root.addListener(subscriber, this.tag())
    // if (tags !== undefined) {
    //   let listener = this.rootListener
    //   for (const tag of tags) {
    //     let next = listener.tags[tag]
    //     if (next === undefined) {
    //       console.log("Creating listener for tag", tag)
    //       next = { tags: {}, listeners: [] }
    //       listener.tags[tag] = next
    //       console.log("Creating listener for tag; tags now", listener.tags)
    //     }
    //     listener = next
    //   }
    //   listener.listeners.push(subscriber)
    // }
    // console.log("Root tags", this.rootListener.tags)
  }

  // runListeners(tags?: Array<StateTag>): void {
  //   console.log("Running listeners; root tags", this.rootListener.tags)
  //   // basically find the listeners for these tags
  //   // then for every tag underneath check to see if the value changed and run
  //   let node: EntityListenerNode = this.rootListener
  //   for (const tag of tags ?? []) {
  //     node = node.tags[tag]
  //     if (node === undefined) {
  //       console.log("No listeners for tag", tag)
  //       return
  //     } else {
  //       console.log("Got listener for tag", tag)
  //     }
  //   }
  //   console.log("Checking subscribers for tag", node.tags)
  //   this.runChildSubscribers(node)
  // }

  // private runChildSubscribers(node: EntityListenerNode) {
  //   for (const subscriber of Array.from(node.listeners)) {
  //     console.log("running listener")
  //     runListener(subscriber)
  //   }
  //   // now check tags
  //   for (const tag in node.tags) {
  //     console.log("checking subscriber for tag", tag)
  //     this.runChildSubscribers(node.tags[tag])
  //   }
  // }

  // runUserEffects(subscribers: Array<Subscriber>): void {
  //   throw new Error("Method not implemented.");
  // }

  protected runListener(node: ListenerNode, tags?: Array<StateTag>): void {
    console.log("Running listener with tags", node.tags, tags)


    // if no tags then we are updating the whole entity so run everything
    if (tags === undefined) {
      // here actually need to test first if the tag has changed
      // so need to know the old value and the new value to test
      if (getValueAt(this.oldValue, node.tags) === getValueAt(this.currentValue, node.tags)) {
        super.addListener(node.subscriber, node.tags)
      } else {
        super.runListener(node)
      }
      
      return
    }

    // if tags only run if this subscriber is on the path
    if (
      node.tags !== undefined && tags !== undefined &&
      node.tags.join(".").startsWith(tags.join("."))
    ) {
      super.runListener(node)
    } else {
      super.addListener(node.subscriber)
    }
  }

  write(val: any, at?: Array<StateTag>): void {
    if (at === undefined) {
      console.log("Running listeners from root")
      // this.currentValue = val
      this.update(val)
      return
    }

    // const parentVal = at.slice(0, -1)
    //   .reduce((acc, cur) => acc[cur], this.getValue())
    console.log("Writing value", this.getValue(), at, val)
    const parentVal = getValueAt(this.getValue(), at.slice(0, -1))

    console.log("entity publisher write", parentVal, at[at.length - 1], val)

    // I'm mutating the value ... so how do I compare old and new?
    parentVal[at[at.length - 1]] = val

    // this.root.update(this.tag())
    this.update(undefined, at)

    this.writeListeners.forEach(handler => {
      handler(at, val)
    })
  }

  getValue(props?: Array<StateTag>) {
    // console.log("Getting value", this.currentValue, props, props?.reduce((acc, cur) => acc[cur], this.currentValue))
    // return props?.reduce((acc, cur) => acc[cur], this.currentValue) ?? this.currentValue
    return getValueAt(this.currentValue, props)
    // return this.value
  }
}

function getValueAt(current: any, props?: Array<StateTag>) {
  console.log("Getting value at", JSON.stringify(current), props)
  return props?.reduce((acc, cur) => acc[cur], current) ?? current
}

// this is basically like a proxy in that it just calls methods on its parent
// for each there's a setter, getter, and tag for subscribing
// export class EntityPropertyPublisher extends ImmutableStatePublisher<any> {

//   constructor(private parent: StatePublisher<any>, private property: string | number) {
//     super()
//     // console.log("creating entity with prop", this.property)
//     this.filter = `${this.parent.filter}.${this.property}`
//   }

//   addListener(subscriber: Subscriber, tag?: string): void {
//     // need to say somehow that this subscriber just cares about this prop
//     // we could wrap the listener so that it returns false for notifyListeners
//     // under some circumstances. but how would we know what we're updating?

//     this.parent.addListener(subscriber, tag !== undefined ? `${this.property}.${tag}` : `${this.property}`)
//   }

//   write(val: any, filter?: string) {
//     // const updated = { ...this.parent.getValue(), [this.property]: val }
//     const parentValue = this.parent.getValue()
//     parentValue[this.property] = val

//     console.log("entity property writer write", this.property, parentValue)

//     // console.log("filter", this.filter)

//     // this.parent.write(updated, filter ?? this.filter)
//     //@ts-ignore
//     this.parent.update(filter ?? this.filter)
//   }

//   update(filter: string) {
//     //@ts-ignore
//     this.parent.update(filter)
//   }

//   getValue(): any {
//     console.log("getting value", this.parent.getValue(), this.property)
//     let value = this.parent.getValue()
//     return value[this.property]
//   }

// }

// export type EntityTag = string | number

// export class EntityWriter extends StateWriter<any> {
//   public filter: string | undefined = "$"

//   // what is tag was an array, we could insrt the subscriber in an object
//   // or basically we need to build a tree of some sort that we can
//   // traverse to see what parts we care about when the whole object updates
//   addListener(subscriber: Subscriber, tags?: Array<EntityTag>): void {
//     if (tag === undefined) {
//       console.log("Adding sub to root")
//       super.addListener(subscriber, "$")
//     } else {
//       console.log("adding child sub with tag", tag)
//       super.addListener(subscriber, tag.startsWith("$") ? tag : `$.${tag}`)
//     }
//     // super.addListener(subscriber, tag)
//   }

//   write(val: any, filter?: string): void {
//     // if filter is undefined, the entire thing changed
//     console.log("Root entity writer write", val, this.filter)
//     // console.log("Using filter", filter)

//     // this.filter = filter ?? this.filter
//     this.publish(val, filter ?? this.filter)
//     // this.filter = "$"
//   }

//   update(tag: string) {
//     const userEffects: Array<Subscriber> = []
//     this.notifyListeners(userEffects)

//     this.runListeners(tag)

//     this.runUserEffects(userEffects)
//   }

// }

// const blah: EntityProxy<string>

// export type Lens<T> = T extends object
//   ? { [K in keyof T]: Lens<T[K]> }
//   : Lens<{}>


// export class Entity<T> {
//   constructor(private name: string | undefined, private value: T) { }
//   // should have a selector function
//   // could just take a function that gets a raw proxy that is typed appropriately
//   // and records what is accessed to make the selector
//   focus<S>(generator: (lens: Lens<T>) => Lens<S>): WritableState<S, S> {
//     return {} as any
//   }
// }


export type EntityRef<T> = EntityProxy<T> & {
  [getToken](): State<T>
  $self: State<Entity<T>>
}

export const getToken = Symbol("getToken")

export function entityRef<T>(): EntityRef<T> {
  // const entityRefImpl: { _root?: EntityWriter, _index?: number } = {}

  // const writer = new EntityWriter(initializer.initialValue)
  // const token = new EntityState(writer)
  const token = {
    [getPublisher](registry) {
      return registry.getState(this)
    }
  } as State<T>

  const entityToken = {
    [getPublisher](registry) {
      console.log("getting entity token")
      return registry.getState(this)
    }
  } as State<Entity<T>>

  return new Proxy({
    [getToken]() {
      return token
    },
    get $self() {
      console.log("Getting self token!!")
      return entityToken
    }
  }, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        // here we want to return a new object that knows about the props
        // this should be provided by the virtual itsm
        // >>> const publisher = new EntityPublisher(root)
        // >>> publisher[addProperty](index)
        console.log("Adding prop", prop, target)
        if (target instanceof PropertyCarrier) {
          target.addProperty(prop as StateTag)
          return receiver
        } else {
          console.log("Creating new carrier")
          const carrier = new PropertyCarrier(token)
          carrier.addProperty(prop as StateTag)
          return createEntityProxy(carrier)
        }

        // target._publisher![addProperty](prop as string | number)
        // const publisher = new EntityPublisher(target._root!)
        // this could potentially be a token to get the index from the registry
        // publisher[addProperty](target._index!)
        // publisher[addProperty](prop as string | number)
        // const propToken = new EntityState(publisher! as unknown as StateWriter<any>)
        // return makeEntityProperty(propToken, publisher)
        // return makeEntity({
        //   [getPublisher](registry) {
        //     console.log("getting pub in entity ref")
        //     const rootPublisher = registry.getState(token)
        //     return new EntityPropertyPublisher(rootPublisher, prop as string)
        //   }
        // })
      }
    },
  }) as unknown as EntityRef<T>
}