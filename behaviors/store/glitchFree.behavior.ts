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
          const root = container<{ name: string | undefined }>({ initialValue: { name: undefined } })
          const currentName = derived({
            query: (get) => get(root).name ?? "Nobody"
          })
          let hasRegistered = false
          context.registerEffect("conditional", (get) => {
            if (get(root).name !== undefined) {
              if (!hasRegistered) {
                context.registerEffect("intermediate-effect", (get) => {
                  return `The current name is: ${get(currentName)}`
                })
                hasRegistered = true
              }
              return context.valuesForSubscriber("intermediate-effect").join("; ")
            } else {
              return "nothing"
            }
          })
          context.setTokens({
            rootContainer: root
          })
        })
      ],
      perform: [
        step("the root container is updated to register the next effect", (context) => {
          context.writeTo(context.tokens.rootContainer, { name: "Awesome Person" })
        }),
        step("the root container is updated again", (context) => {
          context.writeTo(context.tokens.rootContainer, { name: "Cool Dude" })
        })
      ],
      observe: [
        effect("the effect is always called with the latest derived value", (context) => {
          expect(context.valuesForSubscriber("conditional"), is([
            "nothing",
            "The current name is: Awesome Person",
            "The current name is: Awesome Person; The current name is: Cool Dude"
          ]))
        })
      ]
    })

])

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
}