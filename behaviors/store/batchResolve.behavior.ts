import { Container, container, derived, DerivedState, run, use, write } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore.js";

interface DerivationCountContext {
  derivationCount: number
  numberContainer: Container<number>
  stringContainer: Container<string>
  calculated: DerivedState<string>
  queried: Container<string>
}

interface StableDerivationContext {
  derivationCount: number
  numberContainer: Container<number>
  isBig: DerivedState<boolean>
  description: DerivedState<string>
  query: Container<string>
}

interface AbandonedDependencyContext {
  derivationCount: number
  flag: Container<boolean>
  numberContainer: Container<number>
  calculated: DerivedState<number>
  firstQuery: Container<number>
  secondQuery: Container<number>
}

interface RepeatedPropagationContext {
  numberContainer: Container<number>
  calculated: DerivedState<string>
  query: Container<string>
}

interface FlushedEffectContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
}

interface EffectOrderContext {
  firstContainer: Container<number>
  secondContainer: Container<number>
  log: Array<string>
}

interface FlushedBatchContext {
  numberContainer: Container<number>
  calculated: DerivedState<string>
  query: Container<string>
}

interface RepeatedWriteContext {
  derivationCount: number
  numberContainer: Container<number>
  calculated: DerivedState<string>
  firstQuery: Container<string>
  secondQuery: Container<string>
}

export default behavior("resolving derived state during a batch", [

  example(testStoreContext<DerivationCountContext>())
    .description("batched messages with a use that queries a derived value before any container is written")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            derivationCount: 0,
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              context.tokens.derivationCount = context.tokens.derivationCount + 1
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            }),
            queried: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.queried, "sub-queried")
        }),
        fact("the count of derivations is reset", (context) => {
          context.tokens.derivationCount = 0
        })
      ],
      perform: [
        step("a batch message queries the derived value and then writes to a container", (context) => {
          context.sendBatch([
            use(get => {
              return write(context.tokens.queried, get(context.tokens.calculated))
            }),
            write(context.tokens.numberContainer, 27)
          ])
        })
      ],
      observe: [
        effect("the query sees the current derived value", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            "nothing yet",
            "0 + hello = awesome!"
          ])))
        }),
        effect("the subscriber sees the updated derived value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "27 + hello = awesome!"
          ])))
        }),
        effect("the derivation runs only once, when the batch is published", (context) => {
          expect(context.tokens.derivationCount, is(1))
        })
      ]
    }),

  example(testStoreContext<RepeatedWriteContext>())
    .description("batched messages that write to the same container again after a use has queried a derived value")
    .script({
      suppose: [
        fact("there is a derivation based on a container", (context) => {
          const numberContainer = container({ initialValue: 0 })
          context.setTokens({
            derivationCount: 0,
            numberContainer,
            calculated: derived(get => {
              context.tokens.derivationCount = context.tokens.derivationCount + 1
              return `${get(numberContainer)} is the number!`
            }),
            firstQuery: container({ initialValue: "nothing yet" }),
            secondQuery: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there are subscribers to the containers that record the queries", (context) => {
          context.subscribeTo(context.tokens.firstQuery, "sub-first")
          context.subscribeTo(context.tokens.secondQuery, "sub-second")
        }),
        fact("the count of derivations is reset", (context) => {
          context.tokens.derivationCount = 0
        })
      ],
      perform: [
        step("a batch writes to the container, queries, writes again, and queries again", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            use(get => {
              return write(context.tokens.firstQuery, get(context.tokens.calculated))
            }),
            write(context.tokens.numberContainer, 41),
            use(get => {
              return write(context.tokens.secondQuery, get(context.tokens.calculated))
            })
          ])
        })
      ],
      observe: [
        effect("the first query sees the value from the first write", (context) => {
          expect(context.valuesForSubscriber("sub-first"), is(equalTo([
            "nothing yet",
            "27 is the number!"
          ])))
        }),
        effect("the second query sees the value from the second write", (context) => {
          expect(context.valuesForSubscriber("sub-second"), is(equalTo([
            "nothing yet",
            "41 is the number!"
          ])))
        }),
        effect("the subscriber sees the final derived value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 is the number!",
            "41 is the number!"
          ])))
        }),
        effect("the derivation runs once for each query", (context) => {
          expect(context.tokens.derivationCount, is(2))
        })
      ]
    }),

  example(testStoreContext<FlushedBatchContext>())
    .description("batched messages that write to the same container again after the batch has been flushed")
    .script({
      suppose: [
        fact("there is a derivation based on a container", (context) => {
          const numberContainer = container({ initialValue: 0 })
          context.setTokens({
            numberContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} is the number!`
            }),
            query: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.query, "sub-query")
        })
      ],
      perform: [
        step("a batch writes, flushes via a run message, writes again, and then queries", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            run(() => { }),
            write(context.tokens.numberContainer, 41),
            use(get => {
              return write(context.tokens.query, get(context.tokens.calculated))
            })
          ])
        })
      ],
      observe: [
        effect("the query sees the value written after the flush", (context) => {
          expect(context.valuesForSubscriber("sub-query"), is(equalTo([
            "nothing yet",
            "41 is the number!"
          ])))
        })
      ]
    }),

  example(testStoreContext<StableDerivationContext>())
    .description("a use in a later batch after derivations were dirtied but did not change value")
    .script({
      suppose: [
        fact("there is a derivation whose dependent does not change value", (context) => {
          const numberContainer = container({ initialValue: 20 })
          const isBig = derived(get => get(numberContainer) > 10)
          context.setTokens({
            derivationCount: 0,
            numberContainer,
            isBig,
            description: derived<string>(get => {
              context.tokens.derivationCount = context.tokens.derivationCount + 1
              return get(isBig) ? "big" : "small"
            }),
            query: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.description, "sub-description")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.query, "sub-query")
        }),
        fact("a batch writes a value that does not change the derived values", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 30)
          ])
        }),
        fact("the count of derivations is reset", (context) => {
          context.tokens.derivationCount = 0
        })
      ],
      perform: [
        step("a later batch queries the derived value before any write", (context) => {
          context.sendBatch([
            use(get => {
              return write(context.tokens.query, get(context.tokens.description))
            }),
            write(context.tokens.numberContainer, 2)
          ])
        })
      ],
      observe: [
        effect("the query sees the cached derived value", (context) => {
          expect(context.valuesForSubscriber("sub-query"), is(equalTo([
            "nothing yet",
            "big"
          ])))
        }),
        effect("the derivation runs only once, when the later batch is published", (context) => {
          expect(context.tokens.derivationCount, is(1))
        })
      ]
    }),

  example(testStoreContext<AbandonedDependencyContext>())
    .description("a use in a later batch after a write to a container the derivation no longer reads")
    .script({
      suppose: [
        fact("there is a derivation that reads a container conditionally", (context) => {
          const flag = container({ initialValue: true })
          const numberContainer = container({ initialValue: 1 })
          context.setTokens({
            derivationCount: 0,
            flag,
            numberContainer,
            calculated: derived(get => {
              context.tokens.derivationCount = context.tokens.derivationCount + 1
              return get(flag) ? get(numberContainer) : 0
            }),
            firstQuery: container({ initialValue: -1 }),
            secondQuery: container({ initialValue: -1 })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there are subscribers to the containers that record the queries", (context) => {
          context.subscribeTo(context.tokens.firstQuery, "sub-first")
          context.subscribeTo(context.tokens.secondQuery, "sub-second")
        }),
        fact("the derivation stops reading the number container", (context) => {
          context.writeTo(context.tokens.flag, false)
        }),
        fact("a batch writes to the container the derivation no longer reads", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 99),
            use(get => {
              return write(context.tokens.firstQuery, get(context.tokens.calculated))
            })
          ])
        }),
        fact("the count of derivations is reset", (context) => {
          context.tokens.derivationCount = 0
        })
      ],
      perform: [
        step("a later batch queries the derived value before any write", (context) => {
          context.sendBatch([
            use(get => {
              return write(context.tokens.secondQuery, get(context.tokens.calculated))
            })
          ])
        })
      ],
      observe: [
        effect("the query sees the cached derived value", (context) => {
          expect(context.valuesForSubscriber("sub-second"), is(equalTo([
            -1,
            0
          ])))
        }),
        effect("the derivation does not run at all", (context) => {
          expect(context.tokens.derivationCount, is(0))
        })
      ]
    }),

  example(testStoreContext<RepeatedPropagationContext>())
    .description("batched messages where a use is surrounded by writes that affect the same effects")
    .script({
      suppose: [
        fact("there is a derivation based on a container", (context) => {
          const numberContainer = container({ initialValue: 0 })
          context.setTokens({
            numberContainer,
            calculated: derived(get => `${get(numberContainer)} is the number!`),
            query: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is an element effect and a user effect on the derived value", (context) => {
          context.subscribeSystemEffectTo(context.tokens.calculated, "element-sub")
          context.subscribeTo(context.tokens.calculated, "user-sub")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.query, "sub-query")
        })
      ],
      perform: [
        step("a batch writes, queries, and then writes again", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 1),
            use(get => {
              return write(context.tokens.query, get(context.tokens.calculated))
            }),
            write(context.tokens.numberContainer, 2)
          ])
        })
      ],
      observe: [
        effect("the query sees the value from the write before it", (context) => {
          expect(context.valuesForSubscriber("sub-query"), is(equalTo([
            "nothing yet",
            "1 is the number!"
          ])))
        }),
        effect("the element effect runs only once, with the final value", (context) => {
          expect(context.valuesForSubscriber("element-sub"), is(equalTo([
            "0 is the number!",
            "2 is the number!"
          ])))
        }),
        effect("the user effect runs only once, with the final value", (context) => {
          expect(context.valuesForSubscriber("user-sub"), is(equalTo([
            "0 is the number!",
            "2 is the number!"
          ])))
        })
      ]
    }),

  example(testStoreContext<FlushedEffectContext>())
    .description("an effect in a batch that is flushed before a later update to an unrelated container")
    .script({
      suppose: [
        fact("there are two containers", (context) => {
          context.setTokens({
            numberContainer: container({ initialValue: 0 }),
            stringContainer: container({ initialValue: "hello" })
          })
        }),
        fact("there is an effect that depends only on the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-number")
        })
      ],
      perform: [
        step("a batch updates the number, flushes via a run message, then updates the string", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            run(() => { }),
            write(context.tokens.stringContainer, "goodbye")
          ])
        })
      ],
      observe: [
        effect("the effect runs only once for the update to its dependency", (context) => {
          expect(context.valuesForSubscriber("sub-number"), is(equalTo([
            0,
            27
          ])))
        })
      ]
    }),

  example(testStoreContext<EffectOrderContext>())
    .description("effects in a batch that is flushed before later updates to their dependencies")
    .script({
      suppose: [
        fact("there are two containers", (context) => {
          context.setTokens({
            firstContainer: container({ initialValue: 0 }),
            secondContainer: container({ initialValue: 0 }),
            log: []
          })
        }),
        fact("there is an effect for each container that records to a shared log", (context) => {
          context.registerEffect("first-effect", get => {
            const value = get(context.tokens.firstContainer)
            context.tokens.log.push(`first: ${value}`)
            return value
          })
          context.registerEffect("second-effect", get => {
            const value = get(context.tokens.secondContainer)
            context.tokens.log.push(`second: ${value}`)
            return value
          })
        })
      ],
      perform: [
        step("a batch updates the first container, flushes, then updates the second and first containers", (context) => {
          context.sendBatch([
            write(context.tokens.firstContainer, 1),
            run(() => { }),
            write(context.tokens.secondContainer, 1),
            write(context.tokens.firstContainer, 2)
          ])
        })
      ],
      observe: [
        effect("after the flush, the effects run in the order their dependencies were updated", (context) => {
          expect(context.tokens.log, is(equalTo([
            "first: 0",
            "second: 0",
            "first: 1",
            "second: 1",
            "first: 2"
          ])))
        })
      ]
    })

])
