import { Container, container, State } from "../../store/index.js";
import { DerivedStatePublisher } from "../../store/state/derived.js";
import { StateWriter } from "../../store/state/publisher/stateWriter.js";
import { recordTokens } from "../../store/state/stateRecorder.js";
import { createStatePublisher, initListener, OverlayTokenRegistry, StatePublisher, Token, TokenRegistry } from "../../store/tokenRegistry.js";
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

const derivations: Map<Token, DerivedStatePublisher<any>> = new Map()

export function unsubscribeAllOuterTokens(parentRegistry: TokenRegistry) {
  for (const [token, publisher] of derivations) {
    const parentPub = parentRegistry.getState(token as State<any>)
    parentPub.removeListener(publisher)
    // publisher.removeListener(publisher)
  }
  derivations.clear()
}

export class ListItemOverlayTokenRegistry extends OverlayTokenRegistry {
  private _tokenMap: Map<Token, StatePublisher<any>> | undefined
  private useRealTokens: boolean = false

  constructor(
    rootRegistry: TokenRegistry,
    private item: State<any>,
    private itemPublisher: StateWriter<any>,
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
    this.tokenMap.set(token, this.registerState(token, value))
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

    // here is where we request an 'outside' token
    // so here we could return a derived state publisher for that token
    // and then anything inside the list would subscribe to /that/ and
    // there would be only one subscription on the actual token. But it
    // would still have the same value and update etc.
    // return (this._tokenMap?.get(token) ?? super.getState(token)) as any
    return (this._tokenMap?.get(token) ?? this.getOuterToken(token)) as C
  }

  setUseRealTokens(useRealTokens: boolean) {
    this.useRealTokens = useRealTokens
  }

  private getOuterToken(token: State<any>): DerivedStatePublisher<any> {
    if (this.useRealTokens) {
      return super.getState(token)
    }
    
    let publisher = derivations.get(token)
    if (publisher === undefined) {
      publisher = new DerivedStatePublisher(this.parentRegistry, (get) => get(token))
      initListener(publisher)
      derivations.set(token, publisher)
    }
    return publisher
  }

  updateItemData(data: any) {
    this.itemPublisher.publish(data)
  }
}
