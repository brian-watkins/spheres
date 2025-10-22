import { Container, container, Entity, State } from "../../store/index.js";
import { EntityRef, entityRef, getToken } from "../../store/state/entity.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { createStatePublisher, OverlayTokenRegistry, StatePublisher, Token } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewRenderer } from "./viewRenderer.js";

export interface StatePublisherCollection {
  getStatePublisher(key: OverlayTokenRegistry): StatePublisher<any>
  deleteStatePublisher(key: OverlayTokenRegistry): void
  clear(): void
}

class SplitStateCollection implements StatePublisherCollection {
  private publishers = new Map<OverlayTokenRegistry, StatePublisher<any>>()

  constructor(private token: State<any>) { }

  deleteStatePublisher(key: OverlayTokenRegistry): void {
    this.publishers.delete(key)
  }

  clear(): void {
    this.publishers.clear()
  }

  getStatePublisher(key: OverlayTokenRegistry): StatePublisher<any> {
    let publisher = this.publishers.get(key)
    if (publisher === undefined) {
      publisher = createStatePublisher(key, this.token)
      this.publishers.set(key, publisher)
    }
    return publisher
  }
}

export class ListItemTemplateContext<T> {
  public itemToken = container<T | undefined>({ initialValue: undefined })
  private _indexToken: Container<number> | undefined = undefined
  public usesIndex = true
  private tokenMap = new Map<Token, StatePublisherCollection>()

  constructor(viewRenderer: ViewRenderer, generator: (item: State<T>, index?: State<number>) => ViewDefinition) {
    this.usesIndex = generator.length == 2

    let indexToken: Container<number> | undefined = undefined
    if (this.usesIndex) {
      indexToken = this.indexToken
    }

    recordTokens(() => {
      generator(this.itemToken as State<T>, indexToken)(viewRenderer)
    })
      .forEach(token => this.addToken(token))
  }

  private addToken(token: State<any>) {
    this.tokenMap.set(token, new SplitStateCollection(token))
  }

  getStateMap(): Map<Token, StatePublisherCollection> {
    return this.tokenMap
  }

  get indexToken(): Container<number> {
    if (this._indexToken === undefined) {
      this._indexToken = container({ initialValue: -1 })
    }

    return this._indexToken
  }
}

export class ListEntityTemplateContext<T> {
  // public itemToken = entityRef<T>()
  private itemRef = entityRef<T>()
  private _indexToken: Container<number> | undefined = undefined
  public usesIndex = true
  private tokenMap = new Map<Token, StatePublisherCollection>()

  constructor(viewRenderer: ViewRenderer, generator: (item: EntityRef<T>, index?: State<number>) => ViewDefinition) {
    this.usesIndex = generator.length == 2

    let indexToken: Container<number> | undefined = undefined
    if (this.usesIndex) {
      indexToken = this.indexToken
    }

    recordTokens(() => {
      generator(this.itemRef, indexToken)(viewRenderer)
      // generator((run) => {
        // what if this is a function and then we could maybe call bind or
        // otherwise seet it's this value? somewhere?
        // return (get) => {
          // but how do I get this to be the data for an item?
          // could just do get(<some special value>) and that will
          // look up the value in the overlay registry
          // but I don't know if this helps anything since we still
          // have to go through the registry and return a publisher of some sort
          // we need some way to short circuit that?
          // Maybe we could have a special kind of state reference that just
          // returns a value? 
          // return run(get(this.itemToken) as Entity<T>, get)
        // }
      // })(viewRenderer)
    })
      .forEach(token => this.addToken(token))
  }

  getItemToken(): State<T> {
    return this.itemRef[getToken]()
  }

  getEntityToken(): State<Entity<T>> {
    return this.itemRef.$self
  }

  getCurrentEntity(): Entity<T> {
    throw new Error()
  }

  private addToken(token: State<any>) {
    this.tokenMap.set(token, new SplitStateCollection(token))
  }

  getStateMap(): Map<Token, StatePublisherCollection> {
    return this.tokenMap
  }

  get indexToken(): Container<number> {
    if (this._indexToken === undefined) {
      this._indexToken = container({ initialValue: -1 })
    }

    return this._indexToken
  }
}

