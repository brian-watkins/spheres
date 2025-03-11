import { Container, container, State } from "../../store";
import { StateWriter } from "../../store/state/publisher/stateWriter";
import { recordTokens } from "../../store/state/stateRecorder";
import { TokenRegistry } from "../../store/tokenRegistry";
import { ViewDefinition, ViewRenderer } from "./viewRenderer";
import { ListItemOverlayTokenRegistry } from "./virtualNode";

export class ListItemTemplateContext<T> {
  protected itemToken = container<T | undefined>({ initialValue: undefined })
  private _indexToken: Container<number> | undefined = undefined
  public usesIndex = true
  private tokens: Array<State<any>> | undefined

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

  addToken(token: State<any>) {
    if (this.tokens === undefined) {
      this.tokens = []
    }
    this.tokens.push(token)
  }

  get indexToken(): Container<number> {
    if (this._indexToken === undefined) {
      this._indexToken = container({ name: "index-token", initialValue: -1 })
    }

    return this._indexToken
  }

  createOverlayRegistry(rootRegistry: TokenRegistry, itemData: any, index: number): ListItemOverlayTokenRegistry {
    const registry = new ListItemOverlayTokenRegistry(rootRegistry, this.itemToken, new StateWriter(itemData))
    if (this.usesIndex) {
      registry.setIndexState(this.indexToken, index)
    }
    if (this.tokens !== undefined) {
      registry.setUserTokens(this.tokens)
    }
    return registry
  }
}