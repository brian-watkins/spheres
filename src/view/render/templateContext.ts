import { Container, container, State } from "../../store";
import { StateWriter } from "../../store/state/publisher/stateWriter";
import { recordTokens } from "../../store/state/stateRecorder";
import { Command, CommandController, createStatePublisher, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry";
import { ViewDefinition, ViewRenderer } from "./viewRenderer";

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

export class ListItemOverlayTokenRegistry implements TokenRegistry {
  private _tokenMap: Map<Token, StatePublisher<any>> | undefined

  constructor(
    private rootRegistry: TokenRegistry,
    private item: State<any>,
    private itemPublisher: StateWriter<any>
  ) { }

  set(): void { }

  registerState<T>(token: State<T>, initialState?: T): StatePublisher<T> {
    return createStatePublisher(this, token, initialState)
  }

  registerCommand(token: Command<any>): CommandController<any> {
    return this.rootRegistry.registerCommand(token)
  }

  private get tokenMap(): Map<Token, StatePublisher<any>> {
    if (this._tokenMap === undefined) {
      this._tokenMap = new Map()
    }
    return this._tokenMap
  }

  setIndexState(token: State<number>, value: number) {
    this.tokenMap.set(token, this.registerState(token, value))
  }

  setUserTokens(tokens: Array<State<any>>) {
    for (const token of tokens) {
      const controller = this.registerState(token)
      this.tokenMap.set(token, controller)
    }
  }

  get(token: Token): any {
    if (token === this.item) {
      return this.itemPublisher
    }
    return this._tokenMap?.get(token) ?? this.rootRegistry.get(token)
  }

  updateItemData(data: any) {
    this.itemPublisher.publish(data)
  }
}
