import { Container, container, derived, DerivedState, run, use, useHooks, write } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore.js";

interface DerivedBatchWithRegisterHookContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  calculated: DerivedState<string>
  queried: Container<string>
  unregistered: Container<string>
}

interface ConditionalRegistrationContext {
  numberContainer: Container<number>
  showUnregistered: Container<boolean>
  unregistered: Container<string>
  calculated: DerivedState<string>
}

export default behavior("register hooks during a batch", [

  example(testStoreContext<DerivedBatchWithRegisterHookContext>())
    .description("batched messages that register a container whose register hook queries a derived value updated by a message earlier in the batch")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            }),
            queried: container({ initialValue: "nothing yet" }),
            unregistered: container({ initialValue: "initial" })
          })
        }),
        fact("there is a register hook that supplies the derived value to the unregistered container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              if (container === context.tokens.unregistered) {
                actions.supply(`supplied: ${actions.get(context.tokens.calculated)}`)
              }
            }
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there is a subscriber to the queried container", (context) => {
          context.subscribeTo(context.tokens.queried, "sub-queried")
        })
      ],
      perform: [
        step("a batch message writes to a container and then registers the unregistered container", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            use(get => {
              return write(context.tokens.queried, get(context.tokens.unregistered))
            })
          ])
        })
      ],
      observe: [
        effect("the register hook sees the derived value that accounts for the earlier message in the batch", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            "nothing yet",
            "supplied: 27 + hello = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<ConditionalRegistrationContext>())
    .description("a container is registered by a derived value that recalculates as the batch is published")
    .script({
      suppose: [
        fact("there is a derivation that only reads the unregistered container when a flag is set", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const showUnregistered = container({ initialValue: false })
          const unregistered = container({ initialValue: "initial" })
          context.setTokens({
            numberContainer,
            showUnregistered,
            unregistered,
            calculated: derived(get => {
              if (get(showUnregistered)) {
                return `${get(numberContainer)} + ${get(unregistered)}`
              } else {
                return `${get(numberContainer)}`
              }
            })
          })
        }),
        fact("there is a register hook that supplies a value to the unregistered container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              if (container === context.tokens.unregistered) {
                actions.supply("supplied")
              }
            }
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent that causes the derived value to read the unregistered container", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            write(context.tokens.showUnregistered, true)
          ])
        })
      ],
      observe: [
        effect("the subscriber sees the value supplied by the register hook", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0",
            "27 + supplied"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the newly registered container is written to", (context) => {
          context.writeTo(context.tokens.unregistered, "written")
        })
      ],
      observe: [
        effect("the subscriber sees the update", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0",
            "27 + supplied",
            "27 + written"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithRegisterHookContext>())
    .description("a container is registered in a batch after a nested batch has completed")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            }),
            queried: container({ initialValue: "nothing yet" }),
            unregistered: container({ initialValue: "initial" })
          })
        }),
        fact("there is a register hook that supplies the derived value to the unregistered container", (context) => {
          useHooks(context.store, {
            onRegister(container, actions) {
              if (container === context.tokens.unregistered) {
                actions.supply(`supplied: ${actions.get(context.tokens.calculated)}`)
              }
            }
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there is a subscriber to the queried container", (context) => {
          context.subscribeTo(context.tokens.queried, "sub-queried")
        })
      ],
      perform: [
        step("a batch message dispatches a nested batch and then registers the unregistered container", (context) => {
          context.sendBatch([
            run(() => {
              context.sendBatch([
                write(context.tokens.stringContainer, "fun")
              ])
            }),
            write(context.tokens.numberContainer, 27),
            use(get => {
              return write(context.tokens.queried, get(context.tokens.unregistered))
            })
          ])
        })
      ],
      observe: [
        effect("the register hook sees the derived value that accounts for the earlier message in the outer batch", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            "nothing yet",
            "supplied: 27 + fun = awesome!"
          ])))
        })
      ]
    })

])
