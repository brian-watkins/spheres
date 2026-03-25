import { batch, command, Container, container, derived, DerivedState, exec, reset, run, update, use, write } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore.js";

interface SimpleBatchContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  reducerContainer: Container<Array<number>, string>
}

interface DerivedBatchContext {
  numberContainer: Container<number>,
  stringContainer: Container<string>,
  calculated: DerivedState<string>
}

interface DerivedBatchWithCounterContext extends DerivedBatchContext {
  counter: number
}

export default behavior("batched store messages", [

  example(testStoreContext<SimpleBatchContext>())
    .description("batched write messages to multiple containers")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            numberContainer: container({ initialValue: 0 }),
            stringContainer: container({ initialValue: "hello" }),
            reducerContainer: container({
              initialValue: [0],
              update: (message, current) => {
                return { value: [...current, message.length] }
              }
            })
          })
        }),
        fact("there are subscribers to all the containers", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
          context.subscribeTo(context.tokens.stringContainer, "sub-two")
          context.subscribeTo(context.tokens.reducerContainer, "sub-three")
        })
      ],
      perform: [
        step("a batch message is sent updating all three containers", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 4),
            write(context.tokens.stringContainer, "Yo!"),
            write(context.tokens.reducerContainer, "long word")
          ])
        })
      ],
      observe: [
        effect("the number container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0,
            4
          ])))
        }),
        effect("the string container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-two"), is(equalTo([
            "hello",
            "Yo!"
          ])))
        }),
        effect("the reducer container is updated", (context) => {
          expect(context.valuesForSubscriber("sub-three"), is(equalTo([
            [0],
            [0, 9]
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchContext>())
    .description("batched messages update in a single pass to avoid glitches")
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
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            update(context.tokens.stringContainer, (val) => `${val} + cool`),
            update(context.tokens.stringContainer, (val) => `${val} + super`),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "27 + hello + cool + super = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchContext>())
    .description("batched messages with reset")
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
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("the number container has a published value", (context) => {
          context.writeTo(context.tokens.numberContainer, 33)
        }),
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            reset(context.tokens.numberContainer),
            write(context.tokens.stringContainer, "what??"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "33 + hello = awesome!",
            "0 + what?? = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchContext>())
    .description("batched messages with use")
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
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "long-word"),
            use(get => {
              const value = get(context.tokens.stringContainer).length
              return write(context.tokens.numberContainer, value)
            }),
            write(context.tokens.stringContainer, "something cool"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "9 + something cool = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchContext>())
    .description("batch with container update")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({
            initialValue: "hello",
            update: (message, current) => {
              return {
                value: `${current} + ${message}`,
                message: write(numberContainer, message.length)
              }
            }
          })
          context.setTokens({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            write(context.tokens.stringContainer, "cool"),
            write(context.tokens.numberContainer, 31),
            write(context.tokens.stringContainer, "super"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "5 + hello + cool + super = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchContext>())
    .description("batch with batch")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({
            initialValue: 0,
            update(message, current) {
              return { value: message + current }
            }
          })
          const stringContainer = container({
            initialValue: "hello",
            update(message, current) {
              return { value: `${current} + ${message}` }
            },
          })
          context.setTokens({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a batch updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            batch([
              write(context.tokens.numberContainer, 31),
              write(context.tokens.stringContainer, "super")
            ]),
            write(context.tokens.stringContainer, "cool"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "58 + hello + super + cool = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithCounterContext>())
    .description("batched messages with run")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            counter: 0,
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a run message", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "fun"),
            write(context.tokens.numberContainer, 14),
            run(() => {
              context.tokens.counter = context.tokens.counter + 1
            }),
            write(context.tokens.stringContainer, "something cool"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees an update of the calculated value before the run and then after", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "14 + fun = awesome!",
            "14 + something cool = awesome!"
          ])))
        }),
        effect("the run message callback is executed", (context) => {
          expect(context.tokens.counter, is(1))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithCounterContext>())
    .description("batched messages with exec")
    .script({
      suppose: [
        fact("there is a derivation based on containers", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            counter: 0,
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = awesome!`
            })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a run message", (context) => {
          const simpleCommand = command()
          context.useCommand(simpleCommand, () => {
            context.tokens.counter++
          })
          context.sendBatch([
            write(context.tokens.stringContainer, "fun"),
            write(context.tokens.numberContainer, 14),
            exec(simpleCommand),
            write(context.tokens.stringContainer, "something cool"),
            exec(simpleCommand),
            write(context.tokens.numberContainer, 8),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees an update of the calculated value before the run and then after", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "14 + fun = awesome!",
            "14 + something cool = awesome!",
            "8 + something cool = awesome!",
          ])))
        }),
        effect("the command is executed", (context) => {
          expect(context.tokens.counter, is(2))
        })
      ]
    }),

  example(testStoreContext<{ container: Container<number> }>())
    .description("multiple writes to a container with system effects")
    .script({
      suppose: [
        fact("there is a container with a system effect", (context) => {
          context.setTokens({
            container: container({ initialValue: 0 })
          })
          context.subscribeSystemEffectTo(context.tokens.container, "sub-one")
        })
      ],
      perform: [
        step("a batch writes to the same container twice", (context) => {
          context.sendBatch([
            write(context.tokens.container, 5),
            write(context.tokens.container, 10),
          ])
        })
      ],
      observe: [
        effect("the subscriber is notified of the batched update", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([0, 10])))
        })
      ]
    }).andThen({
      perform: [
        step("another write is sent to the container", (context) => {
          context.sendBatch([
            write(context.tokens.container, 15),
            write(context.tokens.container, 100),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees the updated value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([0, 10, 100])))
        })
      ]
    })

])
