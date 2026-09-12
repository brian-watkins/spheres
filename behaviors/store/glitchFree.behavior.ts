import { Container, DerivedState, command, container, derived } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore";

export default behavior("glitch-free effects", [

  example(testStoreContext<GlitchEffectContext>())
    .description("an effect that depends on multiple state tokens that update in sequence")
    .script({
      suppose: [
        fact("there is a root container and several dependencies", (context) => {
          const root = container({ initialValue: "root" })
          const first = derived({
            query: (get) => `${get(root)} + first`
          })
          const second = derived({
            query: (get) => `${get(root)} + second`
          })
          context.setTokens({
            rootContainer: root,
            complexDerived: derived({
              query: (get) => `${get(first)} & ${get(second)}`
            })
          })
        }),
        fact("there is an effect that observes the derived state", (context) => {
          context.subscribeTo(context.tokens.complexDerived, "sub")
        })
      ],
      perform: [
        step("the root container is updated", (context) => {
          context.writeTo(context.tokens.rootContainer, "primary")
        })
      ],
      observe: [
        effect("the effect is called on the initial value and only one update", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "root + first & root + second",
            "primary + first & primary + second"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchEffectContext>())
    .description("dependency tree with child that depends on parent from another branch")
    .script({
      suppose: [
        fact("there is derived state that depends on state from another branch", (context) => {
          const root = container({ initialValue: "hello" })
          const first = derived({ query: (get) => `First ${get(root)} + ${get(third)}` })
          const second = derived({ query: (get) => `Second ${get(root)}` })
          const third = derived({ query: (get) => `Third ${get(second)}` })
          const fourth = derived({ query: (get) => `Complex '${get(first)}' + '${get(third)}'` })
          context.setTokens({
            rootContainer: root,
            complexDerived: fourth
          })
        }),
        fact("there is a subscriber to the third derived state", (context) => {
          context.subscribeTo(context.tokens.complexDerived, "sub-1")
        })
      ],
      perform: [
        step("a message is written to the root container", (context) => {
          context.writeTo(context.tokens.rootContainer, "Yo!")
        })
      ],
      observe: [
        effect("the subscriber receives the expected messages", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is(equalTo([
            "Complex 'First hello + Third Second hello' + 'Third Second hello'",
            "Complex 'First Yo! + Third Second Yo!' + 'Third Second Yo!'"
          ])))
        })
      ]
    }),

  example(testStoreContext<GlitchCommandContext>())
    .description("a command that is triggered by a query with multiple tokens updated in sequence")
    .script({
      suppose: [
        fact("there is a command with a query", (context) => {
          const root = container({ initialValue: "root" })
          const first = derived({
            query: (get) => `${get(root)} + first`
          })
          const second = derived({
            query: (get) => `${get(root)} + second`
          })
          const myCommand = command({
            trigger: (get) => `${get(first)} & ${get(second)}`
          })
          let commandMessages: Array<string> = []
          context.useCommand(myCommand, (message) => {
            commandMessages.push(message)
          })
          context.setTokens({
            rootContainer: root,
            commandMessages
          })
        })
      ],
      perform: [
        step("the root container is updated, triggering the command", (context) => {
          context.writeTo(context.tokens.rootContainer, "FUN")
        })
      ],
      observe: [
        effect("the command is triggered with the initial message and then only once", (context) => {
          expect(context.tokens.commandMessages, is([
            "root + first & root + second",
            "FUN + first & FUN + second"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchUndefinedEffectContext>())
    .description("container that has effect that depends on state derived from that container")
    .script({
      suppose: [
        fact("there is a root container and nested dependencies", (context) => {
          const listenerLog: Array<string> = []
          const root = container<{ name: string | undefined }>({ initialValue: { name: undefined } })
          const currentName = derived({
            query: (get) => {
              listenerLog.push("Running derived state")
              return get(root).name ?? "Nobody"
            }
          })
          let hasRegistered = false
          context.registerEffect("conditional", (get) => {
            listenerLog.push("Running first effect")
            if (get(root).name !== undefined) {
              if (!hasRegistered) {
                context.registerEffect("intermediate-effect", (get) => {
                  listenerLog.push("Running second effect")
                  return `The current name is: ${get(currentName)}`
                })
                hasRegistered = true
              }
              return "some effect"
            } else {
              return "nothing"
            }
          })
          context.setTokens({
            rootContainer: root,
            listenerLog
          })
        })
      ],
      perform: [
        step("the root container is updated to register the next effect, which subscribes to the derived state", (context) => {
          context.writeTo(context.tokens.rootContainer, { name: "Awesome Person" })
        }),
        step("the root container is updated again", (context) => {
          context.writeTo(context.tokens.rootContainer, { name: "Cool Dude" })
        })
      ],
      observe: [
        effect("derived state is always called first, and then user defined effects", (context) => {
          expect(context.tokens.listenerLog, is([
            "Running first effect",
            "Running first effect",
            "Running second effect",
            "Running derived state",
            "Running derived state",
            "Running first effect",
            "Running second effect",
          ]))
        }),
        effect("the second effect is updated with the latest derived value", (context) => {
          expect(context.valuesForSubscriber("intermediate-effect"), is([
            "The current name is: Awesome Person",
            "The current name is: Cool Dude"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchUnchangedBranchContext>())
    .description("an effect that depends on a changed derivation and an unchanged derivation reached through another derivation")
    .script({
      suppose: [
        fact("there is derived state where one branch does not change and is observed through another derivation", (context) => {
          const root = container({ initialValue: { items: [1] } })
          const count = derived({
            query: (get) => get(root).items.length
          })
          const hasItems = derived({
            query: (get) => get(root).items.length > 0
          })
          const hasItemsAlias = derived({
            query: (get) => get(hasItems)
          })
          context.setTokens({
            rootContainer: root
          })
          context.registerEffect("sub", (get) => {
            return `count: ${get(count)}, hasItems: ${get(hasItemsAlias)}`
          })
        })
      ],
      perform: [
        step("the root container is updated so that only the count changes", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2] })
        }),
        step("the root container is updated again so that only the count changes", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2, 3] })
        })
      ],
      observe: [
        effect("the effect is called on the initial value and once for each update", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "count: 1, hasItems: true",
            "count: 2, hasItems: true",
            "count: 3, hasItems: true"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchUnchangedDerivationContext>())
    .description("a derivation that is not reference-stable depends only on an unchanged derivation")
    .script({
      suppose: [
        fact("there is a derivation that builds a new array from a derivation that does not change", (context) => {
          const derivationLog: Array<string> = []
          const root = container({ initialValue: { items: [1] } })
          const hasItems = derived({
            query: (get) => get(root).items.length > 0
          })
          const labels = derived({
            query: (get) => {
              derivationLog.push("labels")
              return get(hasItems) ? ["has items"] : []
            }
          })
          context.setTokens({
            rootContainer: root,
            derivationLog
          })
          context.registerEffect("sub", (get) => get(labels).join(", "))
        })
      ],
      perform: [
        step("the root container is updated in a way that does not change the derivation", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2] })
        }),
        step("the root container is updated again", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2, 3] })
        })
      ],
      observe: [
        effect("the derivation runs only for the initial value", (context) => {
          expect(context.tokens.derivationLog, is([
            "labels"
          ]))
        }),
        effect("the effect is called only on the initial value", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "has items"
          ]))
        })
      ]
    }),

  example(testStoreContext<GlitchUnchangedBranchContext>())
    .description("a derivation that depends only on an unchanged derivation still updates when that derivation changes later")
    .script({
      suppose: [
        fact("there is a derivation that depends on a derivation that does not change at first", (context) => {
          const root = container({ initialValue: { items: [1] } })
          const hasManyItems = derived({
            query: (get) => get(root).items.length > 2
          })
          const label = derived({
            query: (get) => get(hasManyItems) ? "many" : "few"
          })
          context.setTokens({
            rootContainer: root
          })
          context.registerEffect("sub", (get) => get(label))
        })
      ],
      perform: [
        step("the root container is updated in a way that does not change the derivation", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2] })
        }),
        step("the root container is updated in a way that does change the derivation", (context) => {
          context.writeTo(context.tokens.rootContainer, { items: [1, 2, 3] })
        })
      ],
      observe: [
        effect("the effect receives the updated value", (context) => {
          expect(context.valuesForSubscriber("sub"), is([
            "few",
            "many"
          ]))
        })
      ]
    })

])

interface GlitchUnchangedBranchContext {
  rootContainer: Container<{ items: Array<number> }>
}

interface GlitchUnchangedDerivationContext {
  rootContainer: Container<{ items: Array<number> }>
  derivationLog: Array<string>
}

interface GlitchCommandContext {
  rootContainer: Container<string>
  commandMessages: Array<string>
}

interface GlitchEffectContext {
  rootContainer: Container<string>
  complexDerived: DerivedState<string>
}

interface GlitchUndefinedEffectContext {
  rootContainer: Container<{ name: string | undefined }>
  listenerLog: Array<string>
}
