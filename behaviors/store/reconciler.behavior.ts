import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { command, Command, container, Container, derived, exec, supplied, SuppliedState, update } from "@store/index";
import { expect, identicalTo, is } from "great-expectations";

interface MagicObject {
  name: string,
  count: number
}

interface ReconcilerContext {
  root: Container<Array<MagicObject>>
}

interface SuppliedReconcilerContext {
  items: SuppliedState<Array<MagicObject>>
  supplyCommand: Command<Array<MagicObject>>
}

export default behavior("reconciler", [

  example(testStoreContext<ReconcilerContext>())
    .description("derived state with a reconciler")
    .script({
      suppose: [
        fact("there is a container with a list", (context) => {
          const root = container({
            initialValue: [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ]
          })
          context.setTokens({ root })
        }),
        fact("there is derived state with a reconciler that filters the list", (context) => {
          const plentiful = derived({
            query: (get) => get(context.tokens.root).filter(item => item.count > 5),
            reconciler: (current, next) => {
              // Naive reconciler for testing only
              let isDifferent = false
              for (let i = 0; i < current.length; i++) {
                if (current[i] !== next[i]) {
                  isDifferent = true
                  break
                }
              }
              return isDifferent ? next : current
            }
          })
          context.subscribeTo(plentiful, "filter-sub")
        })
      ],
      perform: [
        step("an item excluded by the filter is updated", (context) => {
          context.store.dispatch(update(context.tokens.root, (val) => {
            return val.map(item => item.name === "rabbit" ? { ...item, count: item.count + 1 } : item)
          }))
        })
      ],
      observe: [
        effect("the subscriber does not get an update, since the filtered items are unchanged", (context) => {
          expect(context.valuesForSubscriber("filter-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 }
            ]
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("an item included in the filter is updated", (context) => {
          context.store.dispatch(update(context.tokens.root, (val) => {
            return val.map(item => item.name === "wand" ? { ...item, count: item.count + 1 } : item)
          }))
        })
      ],
      observe: [
        effect("the subscriber gets an update with the new filtered items", (context) => {
          expect(context.valuesForSubscriber("filter-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 }
            ],
            [
              { name: "wand", count: 23 },
              { name: "cape", count: 14 }
            ]
          ]))
        })
      ]
    }),

  example(testStoreContext<ReconcilerContext>())
    .description("derived state with a reconciler that preserves item identity")
    .script({
      suppose: [
        fact("there is a container with a list", (context) => {
          const root = container({
            initialValue: [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ]
          })
          context.setTokens({ root })
        }),
        fact("there is derived state that maps to fresh objects with a reconciler that keeps unchanged items", (context) => {
          const plentiful = derived({
            query: (get) => get(context.tokens.root)
              .filter(item => item.count > 5)
              .map(item => ({ ...item })),
            reconciler: (current, next) => {
              // Naive reconciler for testing only
              const isSameItem = (a: MagicObject, b: MagicObject) => a !== undefined && a.name === b.name && a.count === b.count
              if (current.length === next.length && current.every((item, i) => isSameItem(item, next[i]))) {
                return current
              }
              return next.map((nextItem, i) => isSameItem(current[i], nextItem) ? current[i] : nextItem)
            }
          })
          context.subscribeTo(plentiful, "identity-sub")
        })
      ],
      perform: [
        step("an item included in the filter is updated", (context) => {
          context.store.dispatch(update(context.tokens.root, (val) => {
            return val.map(item => item.name === "wand" ? { ...item, count: item.count + 1 } : item)
          }))
        })
      ],
      observe: [
        effect("the subscriber gets an update with the new filtered items", (context) => {
          expect(context.valuesForSubscriber("identity-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 }
            ],
            [
              { name: "wand", count: 23 },
              { name: "cape", count: 14 }
            ]
          ]))
        }),
        effect("the unchanged item keeps its identity across updates, since the reconciled value is stored", (context) => {
          const [first, second] = context.valuesForSubscriber("identity-sub")
          expect(second[1], is(identicalTo(first[1])))
        })
      ]
    }),

  example(testStoreContext<ReconcilerContext>())
    .description("container with reconciler")
    .script({
      suppose: [
        fact("there is a container with a reconciler", (context) => {
          const root = container({
            initialValue: [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            reconciler(current, next) {
              // Naive reconciler for testing only
              let isDifferent = current.length !== next.length
              return isDifferent ? next : current
            },
          })
          context.setTokens({ root })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.root, "sub-one")
        })
      ],
      perform: [
        step("the container is updated with a value that is identical to the first", (context) => {
          context.writeTo(context.tokens.root, [
            { name: "wand", count: 22 },
            { name: "cape", count: 14 },
            { name: "rabbit", count: 2 }
          ])
        }),
        step("the container is updated with a value is different", (context) => {
          context.writeTo(context.tokens.root, [
            { name: "wand", count: 22 },
            { name: "cape", count: 14 },
            { name: "rabbit", count: 2 },
            { name: "hat", count: 1 }
          ])
        })
      ],
      observe: [
        effect("the subscriber only receives two updates", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 },
              { name: "hat", count: 1 }
            ]
          ]))
        }),
      ]
    }),

  example(testStoreContext<ReconcilerContext>())
    .description("container with a reconciler that preserves item identity")
    .script({
      suppose: [
        fact("there is a container with a reconciler that keeps unchanged items", (context) => {
          const root = container({
            initialValue: [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            reconciler(current, next) {
              // Naive reconciler for testing only
              const isSameItem = (a: MagicObject, b: MagicObject) => a !== undefined && a.name === b.name && a.count === b.count
              if (current.length === next.length && current.every((item, i) => isSameItem(item, next[i]))) {
                return current
              }
              return next.map((nextItem, i) => isSameItem(current[i], nextItem) ? current[i] : nextItem)
            },
          })
          context.setTokens({ root })
        }),
        fact("there is a subscriber to the container", (context) => {
          context.subscribeTo(context.tokens.root, "identity-container-sub")
        })
      ],
      perform: [
        step("the container is updated with fresh objects where only one item changes", (context) => {
          context.store.dispatch(update(context.tokens.root, (val) => {
            return val.map(item => item.name === "wand" ? { ...item, count: item.count + 1 } : { ...item })
          }))
        })
      ],
      observe: [
        effect("the subscriber gets an update with the new items", (context) => {
          expect(context.valuesForSubscriber("identity-container-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            [
              { name: "wand", count: 23 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ]
          ]))
        }),
        effect("the unchanged items keep their identity across updates, since the reconciled value is stored", (context) => {
          const [first, second] = context.valuesForSubscriber("identity-container-sub")
          expect(second[1], is(identicalTo(first[1])))
          expect(second[2], is(identicalTo(first[2])))
        })
      ]
    }),

  example(testStoreContext<SuppliedReconcilerContext>())
    .description("supplied state with a reconciler that preserves item identity")
    .script({
      suppose: [
        fact("there is supplied state with a reconciler that keeps unchanged items", (context) => {
          const items = supplied<Array<MagicObject>>({
            initialValue: [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            reconciler: (current, next) => {
              // Naive reconciler for testing only
              const isSameItem = (a: MagicObject, b: MagicObject) => a !== undefined && a.name === b.name && a.count === b.count
              if (current.length === next.length && current.every((item, i) => isSameItem(item, next[i]))) {
                return current
              }
              return next.map((nextItem, i) => isSameItem(current[i], nextItem) ? current[i] : nextItem)
            }
          })
          context.setTokens({
            items,
            supplyCommand: command<Array<MagicObject>>()
          })
        }),
        fact("there is a command manager that writes to the supplied state", (context) => {
          context.useCommand(context.tokens.supplyCommand, (message, { supply }) => {
            supply(context.tokens.items, message)
          })
        }),
        fact("there is a subscriber to the supplied state", (context) => {
          context.subscribeTo(context.tokens.items, "identity-supplied-sub")
        })
      ],
      perform: [
        step("the command supplies fresh objects that are deep equal to the current", (context) => {
          context.store.dispatch(exec(context.tokens.supplyCommand, [
            { name: "wand", count: 22 },
            { name: "cape", count: 14 },
            { name: "rabbit", count: 2 }
          ]))
        })
      ],
      observe: [
        effect("the subscriber does not get a new value", (context) => {
          expect(context.valuesForSubscriber("identity-supplied-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the command supplies fresh objects where only one item changes", (context) => {
          context.store.dispatch(exec(context.tokens.supplyCommand, [
            { name: "wand", count: 23 },
            { name: "cape", count: 14 },
            { name: "rabbit", count: 2 }
          ]))
        })
      ],
      observe: [
        effect("the subscriber gets an update with the new items", (context) => {
          expect(context.valuesForSubscriber("identity-supplied-sub"), is([
            [
              { name: "wand", count: 22 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ],
            [
              { name: "wand", count: 23 },
              { name: "cape", count: 14 },
              { name: "rabbit", count: 2 }
            ]
          ]))
        }),
        effect("the unchanged items keep their identity across updates, since the reconciled value is stored", (context) => {
          const [first, second] = context.valuesForSubscriber("identity-supplied-sub")
          expect(second[1], is(identicalTo(first[1])))
          expect(second[2], is(identicalTo(first[2])))
        })
      ]
    })

])
