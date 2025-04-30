import { Container, DerivedState, GetState, ReactiveEffect, ReactiveEffectHandle, container, derived, useEffect } from "@store/index.js"
import { ConfigurableExample, behavior, effect, example, fact, step } from "best-behavior"
import { equalTo, expect, is } from "great-expectations"
import { testStoreContext } from "./helpers/testStore.js"

interface BasicQueryContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
}

const basicEffect: ConfigurableExample =
  example(testStoreContext<BasicQueryContext>())
    .description("create an effect")
    .script({
      suppose: [
        fact("there are some containers", (context) => {
          context.setTokens({
            stringContainer: container({ initialValue: "hello" }),
            numberContainer: container({ initialValue: 7 })
          })
        }),
        fact("a subscriber registers an effect involving the state", (context) => {
          context.registerEffect("sub-one", (get) => {
            return `${get(context.tokens.stringContainer)} ==> ${get(context.tokens.numberContainer)} times!`
          })
        })
      ],
      observe: [
        effect("the effect gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello ==> 7 times!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the string container is updated", (context) => {
          context.writeTo(context.tokens.stringContainer, "Yo!")
        }),
        step("the number container is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 14)
        })
      ],
      observe: [
        effect("the effect gets the updated value on each change", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "hello ==> 7 times!",
            "Yo! ==> 7 times!",
            "Yo! ==> 14 times!"
          ])))
        })
      ]
    })

interface HiddenDepsContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
  calls: number
}

const effectWithHiddenDependencies: ConfigurableExample =
  example(testStoreContext<HiddenDepsContext>())
    .description("effect with hidden dependents")
    .script({
      suppose: [
        fact("there are some containers", (context) => {
          context.setTokens({
            stringContainer: container({ initialValue: "hello" }),
            numberContainer: container({ initialValue: 7 }),
            calls: 0
          })
        }),
        fact("a subscriber registers an effect involving the state", (context) => {
          context.registerEffect("sub-one", (get) => {
            context.tokens.calls++
            if (get(context.tokens.stringContainer) === "reveal!") {
              return `The secret number is: ${get(context.tokens.numberContainer)}`
            } else {
              return `It's a secret!`
            }
          })
        })
      ],
      perform: [
        step("update the hidden dependency", (context) => {
          context.writeTo(context.tokens.numberContainer, 21)
        })
      ],
      observe: [
        effect("the effect function is not called when the hidden dependency changes", (context) => {
          expect(context.tokens.calls, is(1))
        }),
        effect("the subscriber does not update when the hidden dependency changes", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "It's a secret!",
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the hidden dependency is triggered", (context) => {
          context.writeTo(context.tokens.stringContainer, "reveal!")
        }),
        step("the hidden dependency is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 22)
        }),
        step("the hidden dependency is hidden again", (context) => {
          context.writeTo(context.tokens.stringContainer, "hide it!")
        }),
        step("the hidden dependency is updated", (context) => {
          context.writeTo(context.tokens.numberContainer, 28)
        }),
        step("the hidden dependency is updated again", (context) => {
          context.writeTo(context.tokens.numberContainer, 31)
        })
      ],
      observe: [
        effect("the run function is not called when the dependency is hidden", (context) => {
          expect(context.tokens.calls, is(4))
        }),
        effect("the subscriber gets updates for the hidden dependency only when it is in the path of the effect function", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "It's a secret!",
            "The secret number is: 21",
            "The secret number is: 22",
            "It's a secret!"
          ])))
        })
      ]
    })

interface CollectingEffectContext {
  container: Container<string>
  handle?: ReactiveEffectHandle
  collector: Array<string>
}

const unsubscribingEffect: ConfigurableExample =
  example(testStoreContext<CollectingEffectContext>())
    .description("an effect that unsubscribes itself under certain conditions")
    .script({
      suppose: [
        fact("there are some containers", (context) => {
          context.setTokens({
            container: container({ initialValue: "hello" }),
            collector: []
          })
        }),
        fact("an effect is registered", (context) => {
          context.tokens.handle = useEffect(context.store, new UnsubscribingEffect(context.tokens.collector, (get) => {
            return get(context.tokens.container) !== "unsub"
          }))
        })
      ],
      perform: [
        step("the container is updated", (context) => {
          context.writeTo(context.tokens.container, "yo yo!")
        }),
        step("the effect is unsubscribed", (context) => {
          context.tokens.handle?.unsubscribe()
        }),
        step("the container updates again", (context) => {
          context.writeTo(context.tokens.container, "Hello again!")
        })
      ],
      observe: [
        effect("the effect was only run twice", (context) => {
          expect(context.tokens.collector, is([
            "RUN!",
            "RUN!"
          ]))
        })
      ]
    })

class UnsubscribingEffect implements ReactiveEffect {
  constructor(public collector: Array<string>, private runner: (get: GetState) => boolean) { }

  run(get: GetState): void {
    if (this.runner(get)) {
      this.collector.push("RUN!")
    }
  }
}

interface MultipleDepContext {
  stringContainer: Container<string>
  numberContainer: Container<number>
  derivedFirst: DerivedState<boolean>
  derivedSecond: DerivedState<boolean>
  effectRuns: Array<string>
}

const multipleDependencyEffect: ConfigurableExample =
  example(testStoreContext<MultipleDepContext>())
    .description("effect with multiple dependencies")
    .script({
      suppose: [
        fact("there are multiple derived state", (context) => {
          context.setTokens({
            stringContainer: container({ initialValue: "hello!" }),
            numberContainer: container({ initialValue: 0 }),
            derivedFirst: derived({ query: (get) => get(context.tokens.stringContainer).length % 2 === 0 }),
            derivedSecond: derived({ query: (get) => get(context.tokens.numberContainer) % 2 === 0 }),
            effectRuns: []
          })
        }),
        fact("there is an effect with multiple dependencies", (context) => {
          useEffect(context.store, {
            run: (get) => {
              if (get(context.tokens.derivedFirst) && get(context.tokens.derivedSecond)) {
                context.tokens.effectRuns.push("All true")
              } else {
                context.tokens.effectRuns.push("Not all true")
              }
            },
          })
        })
      ],
      perform: [
        step("write to number container", (context) => {
          context.writeTo(context.tokens.numberContainer, 1)
        }),
        step("write to number container", (context) => {
          context.writeTo(context.tokens.numberContainer, 2)
        }),
        step("write to number container without changing derived value", (context) => {
          context.writeTo(context.tokens.numberContainer, 4)
        }),
        step("write to number container", (context) => {
          context.writeTo(context.tokens.numberContainer, 1)
        }),
      ],
      observe: [
        effect("the effect is called only when the derived values change", (context) => {
          expect(context.tokens.effectRuns, is([
            "All true",
            "Not all true",
            "All true",
            "Not all true"
          ]))
        })
      ]
    })

const initializingEffectExample: ConfigurableExample =
  example(testStoreContext<CollectingEffectContext>())
    .description("an effect with an initializer")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            container: container({ initialValue: "hello" }),
            collector: []
          })
        }),
        fact("an effect is registered", (context) => {
          useEffect(context.store, new InitializingEffect(context.tokens.collector, (get) => {
            return get(context.tokens.container)
          }))
        })
      ],
      perform: [
        step("the container is updated", (context) => {
          context.writeTo(context.tokens.container, "YO! YO!")
        }),
        step("the container is updated again", (context) => {
          context.writeTo(context.tokens.container, "Hey! Hey!")
        }),
        step("the container updates again", (context) => {
          context.writeTo(context.tokens.container, "WHAT! WHAT!")
        })
      ],
      observe: [
        effect("the initializer is run first and then the run function", (context) => {
          expect(context.tokens.collector, is([
            "INIT: hello",
            "RUN: YO! YO!",
            "RUN: Hey! Hey!",
            "RUN: WHAT! WHAT!"
          ]))
        })
      ]
    })

class InitializingEffect implements ReactiveEffect {
  constructor(private collector: Array<string>, private runner: (get: GetState) => string) { }

  init(get: GetState): void {
    this.collector.push(`INIT: ${this.runner(get)}`)
  }

  run(get: GetState): void {
    this.collector.push(`RUN: ${this.runner(get)}`)
  }
}

export default behavior("effect", [
  basicEffect,
  effectWithHiddenDependencies,
  unsubscribingEffect,
  multipleDependencyEffect,
  initializingEffectExample
])
