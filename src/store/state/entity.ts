import { createPublisher, getPublisher, State, StatePublisher, StateReference, Subscriber } from "../tokenRegistry.js";
import { StateWriter } from "./publisher/stateWriter.js";

export interface EntityInitializer<T> {
  initialValue: T,
  name?: string
}

// Should we just pass a value here instead?
export function entity<T>(initializer: EntityInitializer<T>): Entity<T> {
  // const token = new Entity(
  //   initializer.name,
  //   initializer.initialValue,
  // )
  // // Can we handle ad hoc entities in a view function?
  // // didCreateToken(token)
  // return token
  const writer = new EntityWriter(initializer.initialValue)
  const token = new EntityState(writer)


  // this doesn't work because it's using this to look up
  // the publisher but this is a proxy and 
  // return makeEntity(initializer.initialValue) as Entity<T>

  return makeEntity(token) as Entity<T>
}

export type Entity<T> = StateReference<T> & EntityProxy<T>

// Should be a non-function object type?
type EntityProxy<T> = T extends object ? {
  readonly [K in keyof T]: EntityProxy<T[K]>
} : EntityState<T>

// this could just implement StateReference<T> ...
export class EntityState<T> extends State<T> {

  constructor(private publisher: StateWriter<any>) {
    super(undefined)
  }

  [createPublisher](): StateWriter<T> {
    // return new EntityWriter(this.value)
    return this.publisher
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

function makeEntity(ref: StateReference<any>): Entity<any> {
  return new Proxy(ref, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        // console.log("Entity prop for", prop)
        // return a pub that knows thiis prop
        // returning a new token basically (which is a stateRef)
        return makeEntity({
          [getPublisher](registry) {
            console.log("get pub in make entity", prop)
            // using receiver here makes it work because it's the
            // same instance all the time we use to look up the pub (the proxy)
            // but not sure if it's a good idea
            // What would be better here is if we get the prop from the
            // receiver outside this function and then use that to create
            // a new property pub with the sequence of properties?
            const parent = receiver[getPublisher](registry) as EntityPropertyPublisher
            return new EntityPropertyPublisher(parent, prop as string)
          }
        })
      }
    },
  }) as Entity<any>
}

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

export class EntityPublisher extends StatePublisher<any> {
  private props: Array<string | number> = []

  constructor(private root: EntityWriter) {
    super()
  }

  [addProperty](prop: string | number): void {
    this.props.push(prop)
  }

  private tag(): string {
    return ['$', ...this.props].join(".")
  }

  addListener(subscriber: Subscriber): void {
    console.log("got tag", this.tag())
    this.root.addListener(subscriber, this.tag())
  }

  write(val: any): void {
    const parentVal = this.props.slice(0, -1)
      .reduce((acc, cur) => acc[cur], this.root.getValue())

    console.log("entity publisher write", parentVal, this.props[this.props.length - 1], val)

    parentVal[this.props[this.props.length - 1]] = val

    this.root.update(this.tag())
  }

  getValue() {
    console.log("Getting value", this.root.getValue(), this.tag())
    return this.props.reduce((acc, cur) => acc[cur], this.root.getValue())
  }
}

// this is basically like a proxy in that it just calls methods on its parent
// for each there's a setter, getter, and tag for subscribing
export class EntityPropertyPublisher extends StatePublisher<any> {

  constructor(private parent: StatePublisher<any>, private property: string | number) {
    super()
    // console.log("creating entity with prop", this.property)
    this.filter = `${this.parent.filter}.${this.property}`
  }

  addListener(subscriber: Subscriber, tag?: string): void {
    // need to say somehow that this subscriber just cares about this prop
    // we could wrap the listener so that it returns false for notifyListeners
    // under some circumstances. but how would we know what we're updating?

    this.parent.addListener(subscriber, tag !== undefined ? `${this.property}.${tag}` : `${this.property}`)
  }

  write(val: any, filter?: string) {
    // const updated = { ...this.parent.getValue(), [this.property]: val }
    const parentValue = this.parent.getValue()
    parentValue[this.property] = val

    console.log("entity property writer write", this.property, parentValue)

    // console.log("filter", this.filter)

    // this.parent.write(updated, filter ?? this.filter)
    //@ts-ignore
    this.parent.update(filter ?? this.filter)
  }

  update(filter: string) {
    //@ts-ignore
    this.parent.update(filter)
  }

  getValue(): any {
    console.log("getting value", this.parent.getValue(), this.property)
    let value = this.parent.getValue()
    return value[this.property]
  }

}

export class EntityWriter extends StateWriter<any> {
  public filter: string | undefined = "$"

  addListener(subscriber: Subscriber, tag?: string): void {
    if (tag === undefined) {
      console.log("Adding sub to root")
      super.addListener(subscriber, "$")
    } else {
      console.log("adding child sub with tag", tag)
      super.addListener(subscriber, tag.startsWith("$") ? tag : `$.${tag}`)
    }
    // super.addListener(subscriber, tag)
  }

  write(val: any, filter?: string): void {
    console.log("Root entity writer write", val, this.filter)
    // console.log("Using filter", filter)

    // this.filter = filter ?? this.filter
    this.publish(val, filter ?? this.filter)
    // this.filter = "$"
  }

  update(tag: string) {
    const userEffects: Array<Subscriber> = []
    this.notifyListeners(userEffects)

    this.runListeners(tag)

    this.runUserEffects(userEffects)
  }

}

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
  const token = {} as State<T>

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
        console.log("Adding prop", prop)
        // target._publisher![addProperty](prop as string | number)
        // const publisher = new EntityPublisher(target._root!)
        // this could potentially be a token to get the index from the registry
        // publisher[addProperty](target._index!)
        // publisher[addProperty](prop as string | number)
        // const propToken = new EntityState(publisher! as unknown as StateWriter<any>)
        // return makeEntityProperty(propToken, publisher)
        return makeEntity({
          [getPublisher](registry) {
            console.log("getting pub in entity ref")
            const rootPublisher = registry.getState(token)
            return new EntityPropertyPublisher(rootPublisher, prop as string)
          }
        })
      }
    },
  }) as unknown as EntityRef<T>
}