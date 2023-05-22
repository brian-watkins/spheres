import { ConfigurableExample, behavior, effect, example, fact, step } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { Selection, Container, selection, container } from "@src/index.js";
import { testStoreContext } from "./helpers/testStore.js";

interface BasicSelectionContext {
  numberContainer: Container<number>,
  incrementModThreeSelection: Selection<number, number>
}

const basicSelection: ConfigurableExample =
  example(testStoreContext<BasicSelectionContext>())
    .description("trigger a selection")
    .script({
      suppose: [
        fact("there is a selection", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeSelection = selection(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            numberContainer,
            incrementModThreeSelection
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the selection is stored", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        }),
        step("the selection is stored again", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            2,
            0
          ])))
        })
      ]
    })

const lateSubscribeSelection: ConfigurableExample =
  example(testStoreContext<BasicSelectionContext>())
    .description("dispatch a selection on a container before any subscribers")
    .script({
      suppose: [
        fact("there is a selection", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementModThreeSelection = selection(numberContainer, ({ current }) => {
            return (current + 1) % 3
          })
          context.setTokens({
            numberContainer,
            incrementModThreeSelection
          })
        })
      ],
      perform: [
        step("the selection is stored", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        }),
        step("the selection is stored again", (context) => {
          context.storeSelection(context.tokens.incrementModThreeSelection)
        }),
        step("a listener subscribes to the container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the latest value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            0
          ])))
        })
      ]
    })

interface SelectionWithInputContext {
  numberContainer: Container<number>
  incrementSelection: Selection<number, number, number>
}

const selectionWithInput: ConfigurableExample =
  example(testStoreContext<SelectionWithInputContext>())
    .description("a selection that takes an input value")
    .script({
      suppose: [
        fact("there is a selection", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const incrementSelection = selection(numberContainer, ({ current }, value: number) => {
            return current + value
          })
          context.setTokens({
            numberContainer,
            incrementSelection
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the selection is stored", (context) => {
          context.storeSelection(context.tokens.incrementSelection, 5)
        }),
        step("the selection is stored again", (context) => {
          context.storeSelection(context.tokens.incrementSelection, 10)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            6,
            16
          ])))
        })
      ]
    })

interface SelectionWithOtherStateContext {
  numberContainer: Container<number>
  anotherContainer: Container<number>
  incrementSelection: Selection<number, number, number>
}

const selectionWithOtherState: ConfigurableExample =
  example(testStoreContext<SelectionWithOtherStateContext>())
    .description("a selection that gets the value of another state")
    .script({
      suppose: [
        fact("there is a selection", (context) => {
          const numberContainer = container({ initialValue: 1 })
          const anotherContainer = container({ initialValue: 7 })
          const incrementSelection = selection(numberContainer, ({ get, current }, value: number) => {
            return get(anotherContainer) + current + value
          })
          context.setTokens({
            numberContainer,
            anotherContainer,
            incrementSelection
          })
        }),
        fact("there is a subscriber to the number container", (context) => {
          context.subscribeTo(context.tokens.numberContainer, "sub-one")
        })
      ],
      perform: [
        step("the selection is stored", (context) => {
          context.storeSelection(context.tokens.incrementSelection, 5)
        }),
        step("the other container is updated", (context) => {
          context.writeTo(context.tokens.anotherContainer, 3)
        }),
        step("the selection is stored again", (context) => {
          context.storeSelection(context.tokens.incrementSelection, 10)
        }),
      ],
      observe: [
        effect("the subscriber gets the updated values", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            1,
            13,
            26
          ])))
        })
      ]
    })


export default behavior("selection", [
  basicSelection,
  lateSubscribeSelection,
  selectionWithInput,
  selectionWithOtherState
])