import { createPublisher, getPublisher, State, StatePublisher, StateReference, Subscriber } from "../tokenRegistry";
import { StateWriter } from "./publisher/stateWriter";

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
  const token = new EntityImpl(initializer.initialValue)
  // const writer = new EntityWriter(initializer.initialValue)

  return makeEntity({
    [getPublisher](registry) {
      // this has to return a publisher that wraps the main one
      return registry.getState(token)
    }
  }) as Entity<T>
}

export type Entity<T> = StateReference<T> & EntityProxy<T>

// Should be a non-function object type?
export type EntityProxy<T> = T extends object ? {
  readonly [K in keyof T]: EntityProxy<T[K]>
} : EntityImpl<T>

// this could just implement StateReference<T> ...
export class EntityImpl<T> extends State<T> {

  constructor(private value: T) {
    super(undefined)
  }

  [createPublisher](): StateWriter<T> {
    return new EntityWriter(this.value)
  }

}

function makeEntity(ref: StateReference<any>): Entity<any> {
  return new Proxy(ref, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      } else {
        // console.log("Entity prop for", prop)
        // return a pub that knows thiis prop
        return makeEntity({
          [getPublisher](registry) {
            const parent = target[getPublisher](registry) as EntityPropertyPublisher
            return new EntityPropertyPublisher(parent, prop as string)
          }
        })
      }
    },
  }) as Entity<any>
}

export class EntityPropertyPublisher extends StatePublisher<any> {

  constructor(private parent: StatePublisher<any>, private property: string) {
    super()
    this.filter = `${this.parent.filter}.${this.property}`
  }

  addListener(subscriber: Subscriber, tag?: string): void {
    // need to say somehow that this subscriber just cares about this prop
    // we could wrap the listener so that it returns false for notifyListeners
    // under some circumstances. but how would we know what we're updating?
    
    this.parent.addListener(subscriber, tag !== undefined ? `${this.property}.${tag}` : this.property)
  }

  write(val: any, filter?: string) {
    const update = { ...this.parent.getValue() }
    update[this.property] = val

    // console.log("entity property writer write", this.property, update)

    // console.log("filter", this.filter)

    //@ts-ignore
    this.parent.write(update, filter ?? this.filter)
  }

  getValue(): any {
    return this.parent.getValue()[this.property]
  }

}

class EntityWriter extends StateWriter<any> {
  public filter: string | undefined = "$"
  
  addListener(subscriber: Subscriber, tag?: string): void {
    if (tag === undefined) {
      super.addListener(subscriber, "$")  
    } else {
      super.addListener(subscriber, tag.startsWith("$") ? tag : `$.${tag}`)
    }
  }
  
  write(val: any, filter?: string): void {
    // console.log("Root entity writer write", val)
    // console.log("Using filter", filter ?? this.filter)

    this.filter = filter ?? this.filter
    this.publish(val)
    this.filter = "$"
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