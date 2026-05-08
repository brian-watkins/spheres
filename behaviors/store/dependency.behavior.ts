import { behavior, effect, example, fact, step } from "best-behavior";
import { testStoreContext } from "./helpers/testStore";
import { container, Container, derived } from "@store/index";
import { expect, is } from "great-expectations";

export default behavior("dependency management", [

  example(testStoreContext<Container<string>>())
    .description("effect that depends on derived state")
    .script({
      suppose: [
        fact("there is a container with derived state listeners and an effect that subscribes to both", (context) => {
          const root = container({ initialValue: "hello" })
          const derivedOne = derived(get => get(root).length)
          const derivedTwo = derived(get => get(root) + "!!!")
          context.registerEffect("listener", (get) => `${get(derivedOne)} + ${get(derivedTwo)}`)
          context.registerEffect("simple", get => get(derivedOne))
          context.setTokens(root)
        }),
      ],
      perform: [
        step("write to the container so that only one of the derived state update", (context) => {
          context.writeTo(context.tokens, "super")
        })
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("listener"), is([
            "5 + hello!!!",
            "5 + super!!!"
          ]))
        }),
        effect("the simple listener does not update", (context) => {
          expect(context.valuesForSubscriber("simple"), is([
            5
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("write to the container again", (context) => {
          context.writeTo(context.tokens, "awesome")
        })
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("listener"), is([
            "5 + hello!!!",
            "5 + super!!!",
            "7 + awesome!!!"
          ]))
        }),
        effect("the simple listener updates", (context) => {
          expect(context.valuesForSubscriber("simple"), is([
            5,
            7
          ]))
        })
      ]
    }),

  example(testStoreContext<Container<string>>())
    .description("derived state that depends on derived state")
    .script({
      suppose: [
        fact("there is a container with derived state listeners and a derived state that subscribes to both", (context) => {
          const root = container({ initialValue: "hello" })
          const derivedOne = derived(get => get(root).length)
          const derivedTwo = derived(get => get(root) + "!!!")
          const derivedThree = derived(get => `${get(derivedOne)} + ${get(derivedTwo)}`)
          context.setTokens(root)
          context.subscribeTo(derivedThree, "derived-sub")
        }),
      ],
      perform: [
        step("write to the container so that only one of the derived state update", (context) => {
          context.writeTo(context.tokens, "super")
        })
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("derived-sub"), is([
            "5 + hello!!!",
            "5 + super!!!"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("write to the container again", (context) => {
          context.writeTo(context.tokens, "funny")
        })
      ],
      observe: [
        effect("the listener is updated", (context) => {
          expect(context.valuesForSubscriber("derived-sub"), is([
            "5 + hello!!!",
            "5 + super!!!",
            "5 + funny!!!"
          ]))
        })
      ]
    })

])