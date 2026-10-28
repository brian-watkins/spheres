import { behavior, effect, example, fact, step } from "best-behavior"
import { testStoreContext } from "./helpers/testStore"
import { container, Container, derived, ReactiveEffectHandle, State, useEffect } from "@store/index"
import { expect, is } from "great-expectations"

export default behavior("dependency management", [
  example(testStoreContext<Container<string>>())
    .description("effect that depends on derived state")
    .script({
      suppose: [
        fact(
          "there is a container with derived state listeners and an effect that subscribes to both",
          (context) => {
            const root = container({ initialValue: "hello" })
            const derivedOne = derived((get) => get(root).length)
            const derivedTwo = derived((get) => get(root) + "!!!")
            context.registerEffect("listener", (get) => `${get(derivedOne)} + ${get(derivedTwo)}`)
            context.registerEffect("simple", (get) => get(derivedOne))
            context.setTokens(root)
          },
        ),
      ],
      perform: [
        step("write to the container so that only one of the derived state update", (context) => {
          context.writeTo(context.tokens, "super")
        }),
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("listener"), is(["5 + hello!!!", "5 + super!!!"]))
        }),
        effect("the simple listener does not update", (context) => {
          expect(context.valuesForSubscriber("simple"), is([5]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("write to the container again", (context) => {
          context.writeTo(context.tokens, "awesome")
        }),
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(
            context.valuesForSubscriber("listener"),
            is(["5 + hello!!!", "5 + super!!!", "7 + awesome!!!"]),
          )
        }),
        effect("the simple listener updates", (context) => {
          expect(context.valuesForSubscriber("simple"), is([5, 7]))
        }),
      ],
    }),

  example(testStoreContext<Container<string>>())
    .description("derived state that depends on derived state")
    .script({
      suppose: [
        fact(
          "there is a container with derived state listeners and a derived state that subscribes to both",
          (context) => {
            const root = container({ initialValue: "hello" })
            const derivedOne = derived((get) => get(root).length)
            const derivedTwo = derived((get) => get(root) + "!!!")
            const derivedThree = derived((get) => `${get(derivedOne)} + ${get(derivedTwo)}`)
            context.setTokens(root)
            context.subscribeTo(derivedThree, "derived-sub")
          },
        ),
      ],
      perform: [
        step("write to the container so that only one of the derived state update", (context) => {
          context.writeTo(context.tokens, "super")
        }),
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("derived-sub"), is(["5 + hello!!!", "5 + super!!!"]))
        }),
      ],
    })
    .andThen({
      perform: [
        step("write to the container again", (context) => {
          context.writeTo(context.tokens, "funny")
        }),
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(
            context.valuesForSubscriber("derived-sub"),
            is(["5 + hello!!!", "5 + super!!!", "5 + funny!!!"]),
          )
        }),
      ],
    }),

  example(testStoreContext<UnsubscribedDerivedContext>())
    .description("derived state whose only subscriber unsubscribes")
    .script({
      suppose: [
        fact("there is a container with derived state that counts its calculations", (context) => {
          const tokens: UnsubscribedDerivedContext = {
            root: container({ initialValue: "hello" }),
            calculations: 0,
          }
          const counted = derived((get) => {
            tokens.calculations++
            return get(tokens.root).length
          })
          tokens.handle = useEffect(context.store, {
            run: (get) => {
              get(counted)
            },
          })
          context.setTokens(tokens)
        }),
      ],
      perform: [
        step("the effect unsubscribes", (context) => {
          context.tokens.handle?.unsubscribe()
        }),
        step("write to the container a few times", (context) => {
          context.writeTo(context.tokens.root, "super")
          context.writeTo(context.tokens.root, "awesome")
        }),
      ],
      observe: [
        effect("the derived state is not recalculated", (context) => {
          expect(context.tokens.calculations, is(1))
        }),
      ],
    }),

  example(testStoreContext<UnsubscribedDerivedChainContext>())
    .description("chain of derived state whose only subscriber unsubscribes")
    .script({
      suppose: [
        fact(
          "there is a container with a chain of derived state that counts its calculations",
          (context) => {
            const tokens: UnsubscribedDerivedChainContext = {
              root: container({ initialValue: "hello" }),
              firstCalculations: 0,
              secondCalculations: 0,
            }
            const first = derived((get) => {
              tokens.firstCalculations++
              return get(tokens.root).length
            })
            const second = derived((get) => {
              tokens.secondCalculations++
              return get(first) * 2
            })
            tokens.second = second
            tokens.handle = useEffect(context.store, {
              run: (get) => {
                get(second)
              },
            })
            context.setTokens(tokens)
          },
        ),
      ],
      perform: [
        step("the effect unsubscribes", (context) => {
          context.tokens.handle?.unsubscribe()
        }),
        step("write to the container once", (context) => {
          context.writeTo(context.tokens.root, "awesome")
        }),
      ],
      observe: [
        effect("the derived state that depends on the container is not recalculated", (context) => {
          expect(context.tokens.firstCalculations, is(1))
        }),
        effect(
          "the derived state that depends on other derived state is not recalculated",
          (context) => {
            expect(context.tokens.secondCalculations, is(1))
          },
        ),
      ],
    })
    .andThen({
      perform: [
        step("a new effect subscribes to the derived state", (context) => {
          context.subscribeTo(context.tokens.second!, "new-sub")
        }),
      ],
      observe: [
        effect("the new effect gets the current value", (context) => {
          expect(context.valuesForSubscriber("new-sub"), is([14]))
        }),
      ],
    }),

  example(testStoreContext<UnsubscribedDerivedTwoDependenciesContext>())
    .description("derived state with two dependencies that is subscribed to again after pruning")
    .script({
      suppose: [
        fact(
          "there is derived state that depends on two containers and counts its calculations",
          (context) => {
            const tokens: UnsubscribedDerivedTwoDependenciesContext = {
              first: container({ initialValue: "a" }),
              second: container({ initialValue: "b" }),
              calculations: 0,
            }
            const combined = derived((get) => {
              tokens.calculations++
              return get(tokens.first) + get(tokens.second)
            })
            tokens.combined = combined
            tokens.handle = useEffect(context.store, {
              run: (get) => {
                get(combined)
              },
            })
            context.setTokens(tokens)
          },
        ),
      ],
      perform: [
        step("the effect unsubscribes", (context) => {
          context.tokens.handle?.unsubscribe()
        }),
        step("write to the first container so the derived state is pruned", (context) => {
          context.writeTo(context.tokens.first, "A")
        }),
        step("a new effect subscribes to the derived state", (context) => {
          context.subscribeTo(context.tokens.combined!, "new-sub")
          context.tokens.calculations = 0
        }),
        step("write to the second container", (context) => {
          context.writeTo(context.tokens.second, "B")
        }),
      ],
      observe: [
        effect("the derived state is calculated once", (context) => {
          expect(context.tokens.calculations, is(1))
        }),
      ],
    }),
])

interface UnsubscribedDerivedContext {
  root: Container<string>
  calculations: number
  handle?: ReactiveEffectHandle
}

interface UnsubscribedDerivedChainContext {
  root: Container<string>
  firstCalculations: number
  secondCalculations: number
  second?: State<number>
  handle?: ReactiveEffectHandle
}

interface UnsubscribedDerivedTwoDependenciesContext {
  first: Container<string>
  second: Container<string>
  calculations: number
  combined?: State<string>
  handle?: ReactiveEffectHandle
}
