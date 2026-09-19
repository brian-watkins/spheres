import { batch, command, Container, ContainerHooks, container, derived, DerivedState, exec, meta, reset, run, update, use, write } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext, TestStore } from "./helpers/testStore.js";
import { TestTask } from "./helpers/testTask.js";

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

interface DerivedBatchWithQueryContext extends DerivedBatchContext {
  queried: Container<string>
}

interface ReconciledDerivedBatchContext {
  numberContainer: Container<number>
  highWaterMark: DerivedState<number>
  queried: Container<number>
}

interface DerivedBatchWithWriteHookContext extends DerivedBatchContext {
  writeTask: TestTask<string>
}

interface DerivedBatchWithMetaAndTaskContext extends DerivedBatchWithMetaContext {
  writeTask: TestTask<string>
}

interface DerivedBatchWithMetaContext {
  numberContainer: Container<number>
  stringContainer: Container<string>
  calculated: DerivedState<string>
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
    .description("batched messages with use that references a container updated earlier in the batch")
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

  example(testStoreContext<DerivedBatchWithQueryContext>())
    .description("batched messages with use that queries a derived value updated by a message earlier in the batch")
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
            queried: container({ initialValue: "nothing yet" })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.queried, "sub-queried")
        })
      ],
      perform: [
        step("a batch message writes to a container and then queries the derived value", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            use(get => {
              return write(context.tokens.queried, get(context.tokens.calculated))
            })
          ])
        })
      ],
      observe: [
        effect("the query sees the derived value that accounts for the earlier message in the batch", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            "nothing yet",
            "27 + hello = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<ReconciledDerivedBatchContext>())
    .description("batched messages with use that queries a reconciled derived value updated by a message earlier in the batch")
    .script({
      suppose: [
        fact("there is a derivation with a reconciler", (context) => {
          const numberContainer = container({ initialValue: 0 })
          context.setTokens({
            numberContainer,
            highWaterMark: derived({
              query: get => get(numberContainer),
              reconciler: (current, next) => Math.max(current, next)
            }),
            queried: container({ initialValue: -1 })
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.highWaterMark, "sub-high-water-mark")
        }),
        fact("there is a subscriber to the container that records the query", (context) => {
          context.subscribeTo(context.tokens.queried, "sub-queried")
        }),
        fact("the container has been updated to a high value", (context) => {
          context.writeTo(context.tokens.numberContainer, 14)
        })
      ],
      perform: [
        step("a batch message writes a lower value to the container and then queries the derived value", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 3),
            use(get => {
              return write(context.tokens.queried, get(context.tokens.highWaterMark))
            })
          ])
        })
      ],
      observe: [
        effect("the query sees the reconciled derived value", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            -1,
            14
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

  example(testStoreContext<DerivedBatchWithMetaContext>())
    .description("batch with batch writing to a container with a write hook")
    .script({
      suppose: [
        fact("there is a derivation based on a container and its meta value", (context) => {
          setMetaTokens(context)
        }),
        fact("the string container has a write hook that rejects some messages", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, writeHooks)
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a batch that writes to the container with the write hook", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "cool"),
            batch([
              write(context.tokens.numberContainer, 27),
            ]),
            write(context.tokens.stringContainer, "super"),
            write(context.tokens.numberContainer, 31),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "31 + super = ok!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a batch message is sent with a batch that is rejected by the write hook", (context) => {
          context.sendBatch([
            batch([
              write(context.tokens.numberContainer, 14),
            ]),
            write(context.tokens.stringContainer, "bad"),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one more update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "31 + super = ok!",
            "14 + super = error!"
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
    .description("batched messages with run followed by a write to a container with a write hook")
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
        fact("the string container has a write hook that accepts the write", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, writeHooks)
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a run message before the writes", (context) => {
          context.sendBatch([
            run(() => {
              context.tokens.counter = context.tokens.counter + 1
            }),
            write(context.tokens.stringContainer, "fun"),
            write(context.tokens.numberContainer, 14),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value after the run", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "14 + fun = awesome!"
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
    }),

  example(testStoreContext<DerivedBatchWithWriteHookContext>())
    .description("batched messages to a container with a write hook")
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
            writeTask: new TestTask<string>()
          })
        }),
        fact("the string container has a write hook that sometimes waits before accepting the write", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, {
            async onWrite(message, actions) {
              if (message === "wait") {
                const value = await context.tokens.writeTask.waitForIt()
                actions.ok(value)
              } else {
                actions.ok(`${actions.current} + ${message}`)
              }
            }
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with writes the hook accepts immediately", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "cool"),
            write(context.tokens.numberContainer, 27),
            write(context.tokens.stringContainer, "super"),
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
    }).andThen({
      perform: [
        step("a batch message is sent with a write the hook waits to accept", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "wait"),
            write(context.tokens.numberContainer, 14),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees only the update from the other container", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "27 + hello + cool + super = awesome!",
            "14 + hello + cool + super = awesome!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the write hook accepts the write after the batch has completed", (context) => {
          context.tokens.writeTask.resolveWith("later")
        })
      ],
      observe: [
        effect("the subscriber sees the late update", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = awesome!",
            "27 + hello + cool + super = awesome!",
            "14 + hello + cool + super = awesome!",
            "14 + later = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithQueryContext>())
    .description("batched messages to a container with a write hook that queries a derived value updated by a message earlier in the batch")
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
            queried: container({ initialValue: "nothing yet" })
          })
        }),
        fact("the queried container has a write hook that records the derived value", (context) => {
          context.useContainerHooks(context.tokens.queried, {
            onWrite(message, actions) {
              actions.ok(`${message}: ${actions.get(context.tokens.calculated)}`)
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
        step("a batch message writes to a container and then to the container with the write hook", (context) => {
          context.sendBatch([
            write(context.tokens.numberContainer, 27),
            write(context.tokens.queried, "recorded")
          ])
        })
      ],
      observe: [
        effect("the write hook sees the derived value that accounts for the earlier message in the batch", (context) => {
          expect(context.valuesForSubscriber("sub-queried"), is(equalTo([
            "nothing yet",
            "recorded: 27 + hello = awesome!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithMetaContext>())
    .description("the meta value published by a write hook is part of the batch")
    .script({
      suppose: [
        fact("there is a derivation based on a container and its meta value", (context) => {
          setMetaTokens(context)
        }),
        fact("the string container has a write hook that rejects some messages", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, writeHooks)
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a message is written that the write hook rejects", (context) => {
          context.writeTo(context.tokens.stringContainer, "bad")
        })
      ],
      observe: [
        effect("the subscriber sees the error meta value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "0 + hello = error!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "cool"),
            write(context.tokens.numberContainer, 27),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "0 + hello = error!",
            "27 + cool = ok!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithMetaContext>())
    .description("the pending meta value published by a write hook is part of the batch")
    .script({
      suppose: [
        fact("there is a derivation based on a container and its meta value", (context) => {
          setMetaTokens(context)
        }),
        fact("the string container has a write hook that waits to accept some messages", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, writeHooks)
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a message the write hook does not accept yet", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "wait"),
            write(context.tokens.numberContainer, 27),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "27 + hello = pending!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithMetaContext>())
    .description("the error meta value published by a write hook is part of the batch")
    .script({
      suppose: [
        fact("there is a derivation based on a container and its meta value", (context) => {
          setMetaTokens(context)
        }),
        fact("the string container has a write hook that rejects some messages", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, writeHooks)
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent with a message the write hook rejects", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "bad"),
            write(context.tokens.numberContainer, 27),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees one update of the calculated value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "27 + hello = error!"
          ])))
        })
      ]
    }),

  example(testStoreContext<DerivedBatchWithMetaAndTaskContext>())
    .description("a write hook reports an error after the batch has completed")
    .script({
      suppose: [
        fact("there is a derivation based on a container and its meta value", (context) => {
          const numberContainer = container({ initialValue: 0 })
          const stringContainer = container({ initialValue: "hello" })
          context.setTokens({
            numberContainer,
            stringContainer,
            calculated: derived(get => {
              return `${get(numberContainer)} + ${get(stringContainer)} = ${get(meta(stringContainer)).type}!`
            }),
            writeTask: new TestTask<string>()
          })
        }),
        fact("the string container has a write hook that waits before rejecting the write", (context) => {
          context.useContainerHooks(context.tokens.stringContainer, {
            async onWrite(message, actions) {
              await context.tokens.writeTask.waitForIt()
              actions.error("not a good value", message)
            }
          })
        }),
        fact("there is a subscriber to the derived value", (context) => {
          context.subscribeTo(context.tokens.calculated, "sub-calc")
        })
      ],
      perform: [
        step("a batch message is sent updating the two containers", (context) => {
          context.sendBatch([
            write(context.tokens.stringContainer, "cool"),
            write(context.tokens.numberContainer, 27),
          ])
        })
      ],
      observe: [
        effect("the subscriber sees only the update from the other container", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "27 + hello = ok!"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the write hook rejects the write after the batch has completed", async (context) => {
          context.tokens.writeTask.resolveWith("whatever")
          await Promise.resolve()
        })
      ],
      observe: [
        effect("the subscriber sees the error meta value", (context) => {
          expect(context.valuesForSubscriber("sub-calc"), is(equalTo([
            "0 + hello = ok!",
            "27 + hello = ok!",
            "27 + hello = error!"
          ])))
        })
      ]
    })

])

const writeHooks: ContainerHooks<string, string, string> = {
  onWrite(message, actions) {
    switch (message) {
      case "wait": {
        actions.pending(message)
        break
      }
      case "bad": {
        actions.error("not a good value", message)
        break
      }
      default: {
        actions.ok(message)
      }
    }
  }
}

function setMetaTokens(context: TestStore<DerivedBatchWithMetaContext>) {
  const numberContainer = container({ initialValue: 0 })
  const stringContainer = container({ initialValue: "hello" })
  context.setTokens({
    numberContainer,
    stringContainer,
    calculated: derived(get => {
      return `${get(numberContainer)} + ${get(stringContainer)} = ${get(meta(stringContainer)).type}!`
    })
  })
}
