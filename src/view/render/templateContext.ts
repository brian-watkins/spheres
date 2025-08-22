import { Container, container, State } from "../../store/index.js";
import { StateWriter } from "../../store/state/publisher/stateWriter.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { createStatePublisher, OverlayTokenRegistry, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry.js";
import { ViewDefinition, ViewRenderer } from "./viewRenderer.js";

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
      this._indexToken = container({ initialValue: -1 })
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

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private _tokenMap: Map<Token, StatePublisher<any>> | undefined
  private index: State<number> | undefined
  private indexPublisher: StateWriter<number> | undefined

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<any>,
    private itemPublisher: StateWriter<any>
  ) {
    super(rootRegistry)
  }

  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T> {
    return createStatePublisher(this, token, initialState)
  }

  private get tokenMap(): Map<Token, StatePublisher<any>> {
    if (this._tokenMap === undefined) {
      this._tokenMap = new Map()
    }
    return this._tokenMap
  }

  setIndexState(token: State<number>, value: number) {
    this.index = token
    this.indexPublisher = new StateWriter(value)
  }

  setUserTokens(tokens: Array<State<any>>) {
    for (const token of tokens) {
      const controller = this.registerState(token)
      this.tokenMap.set(token, controller)
    }
  }

  getState<C extends StatePublisher<any>>(token: State<any>): C {
    if (token === this.item) {
      return this.itemPublisher as any
    }

    if (token === this.index) {
      return this.indexPublisher as any
    }

    return (this._tokenMap?.get(token) ?? super.getState(token)) as any
  }

  updateItemData(data: any) {
    this.itemPublisher.publish(data)
  }

  updateIndex(index: number) {
    this.indexPublisher?.publish(index)
  }
}
