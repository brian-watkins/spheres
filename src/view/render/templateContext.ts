import { Container, container, State } from "../../store/index.js";
import { OverlayTokenRegistry } from "../../store/registry/overlayTokenRegistry.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { StatePublisher, Token } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewRenderer } from "./viewRenderer.js";

export interface StatePublisherCollection {
  getStatePublisher(key: OverlayTokenRegistry): StatePublisher<any>
  deleteStatePublisher(key: OverlayTokenRegistry): void
  clear(): void
}

export class ListItemTemplateContext<T> {
  public itemToken = container<T | undefined>({ initialValue: undefined })
  private _indexToken: Container<number> | undefined = undefined
  public usesIndex = true
  readonly viewTokens = new Set<Token>()

  constructor(viewRenderer: ViewRenderer, generator: (item: State<T>, index?: State<number>) => ViewDefinition) {
    this.usesIndex = generator.length == 2

    let indexToken: Container<number> | undefined = undefined
    if (this.usesIndex) {
      indexToken = this.indexToken
    }

    recordTokens(() => {
      generator(this.itemToken as State<T>, indexToken)(viewRenderer)
    })
      .forEach(token => this.viewTokens.add(token))
  }

  get indexToken(): Container<number> {
    if (this._indexToken === undefined) {
      this._indexToken = container({ initialValue: -1 })
    }

    return this._indexToken
  }
}
