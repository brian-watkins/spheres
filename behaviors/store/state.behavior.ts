import { ConfigurableExample, Context, behavior, effect, example, fact, step } from "esbehavior";
import { Container, Store, container, state } from "@src/store.js"
import { equalTo, expect, is } from "great-expectations";

class TestStore<T> {
  private store: Store
  private _tokens: T | undefined
  private values: Map<string, Array<any>> = new Map()

  constructor() {
    this.store = new Store()
  }

  subscribeTo<S>(token: Container<S>, name: string) {
    this.values.set(name, [])
    this.store.subscribe(token, (updatedValue) => {
      this.values.get(name)?.push(updatedValue)
    })
  }

  writeTo<S>(token: Container<S>, value: S) {
    this.store.dispatch({
      type: "write",
      token,
      value
    })
  }

  valuesForSubscriber(name: string): Array<any> {
    return this.values.get(name)!
  }

  setTokens(tokens: T) {
    this._tokens = tokens
  }

  get tokens(): T {
    return this._tokens!
  }
}

function testStoreContext<T>(): Context<TestStore<T>> {
  return {
    init: () => new TestStore<T>()
  }
}

interface BasicContainers {
  nameToken: Container<string>
}

const basicState: ConfigurableExample =
  example(testStoreContext<BasicContainers>())
    .description("Updating subscribers")
    .script({
      suppose: [
        fact("there is a container token with an initial value", (context) => {
          context.setTokens({
            nameToken: container("hello!")
          })
        })
      ],
      perform: [
        step("a listener subscribes", (context) => {
          context.subscribeTo(context.tokens.nameToken, "subscriber-one")
        })
      ],
      observe: [
        effect("the listener gets the initial value", (context) => {
          expect(context.valuesForSubscriber("subscriber-one"), is(equalTo([
            "hello!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the container value is updated", (context) => {
          context.writeTo(context.tokens.nameToken, "Thank you. Next!")
        })
      ],
      observe: [
        effect("the listener gets the updated value", (context) => {
          expect(context.valuesForSubscriber("subscriber-one"), is(equalTo([
            "hello!",
            "Thank you. Next!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("another listener subscribes", (context) => {
          context.subscribeTo(context.tokens.nameToken, "subscriber-two")
        })
      ],
      observe: [
        effect("the original listener is not notified", (context) => {
          expect(context.valuesForSubscriber("subscriber-one"), is(equalTo([
            "hello!",
            "Thank you. Next!"
          ])))
        }),
        effect("the new listener gets the latest value", (context) => {
          expect(context.valuesForSubscriber("subscriber-two"), is(equalTo([
            "Thank you. Next!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the state is updated again", (context) => {
          context.writeTo(context.tokens.nameToken, "Finally!")
        })
      ],
      observe: [
        effect("the original listener is updated", (context) => {
          expect(context.valuesForSubscriber("subscriber-one"), is(equalTo([
            "hello!",
            "Thank you. Next!",
            "Finally!"
          ])))
        }),
        effect("the latest listener is updated", (context) => {
          expect(context.valuesForSubscriber("subscriber-two"), is(equalTo([
            "Thank you. Next!",
            "Finally!"
          ])))
        })

      ]
    })

interface DerivedStateContext {
  numberToken: Container<number>
  derivedToken: Container<number>
}

const derivedState: ConfigurableExample =
  example(testStoreContext<DerivedStateContext>())
    .description("derived state updates")
    .script({
      suppose: [
        fact("one token is derived from another", (context) => {
          const numberToken = container(0)
          const derivedToken = state((get) => get(numberToken) + 18)
          context.setTokens({
            numberToken,
            derivedToken
          })
        }),
        fact("there is a subscriber to the derived token", (context) => {
          context.subscribeTo(context.tokens.derivedToken, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber receives the initial derived value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            18
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the basic state is updated", (context) => {
          context.writeTo(context.tokens.numberToken, 21)
        })
      ],
      observe: [
        effect("the subscriber receives the updated derived value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            18,
            39
          ])))
        })
      ]
    })

export default behavior("State", [
  basicState,
  derivedState
])