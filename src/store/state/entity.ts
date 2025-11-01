import { createPublisher, getPublisher, State, StatePublisher, StateReference, StateTag, TokenRegistry } from "../tokenRegistry.js";
import { EntityPublisher } from "./publisher/entityPublisher.js";
import { StateWriter } from "./publisher/stateWriter.js";

export interface EntityInitializer<T> {
  initialValue: T,
  name?: string
}


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

export const addProperty = Symbol("addProperty")

export function entity<T>(initializer: EntityInitializer<T>): Entity<T> {
  // need to return a state token that will create an EntityPublisher
  // and function as a proxy and return a wrapper around the EntityPublisher
  // with the appropriate list of StateTags
  const entityState = new EntityState(initializer.initialValue)

  return createEntityProxy(entityState)
}

export class PropertyCarrier implements StateReference<any> {
  constructor(readonly token: State<any>, public props: Array<StateTag> = [ "$" ]) { }

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
      }
    },
  }) as unknown as EntityRef<T>
}