import { Container, container, State } from "../../store/index.js";
import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { createStatePublisher, StatePublisher, Token } from "../../store/tokenRegistry.js";
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
