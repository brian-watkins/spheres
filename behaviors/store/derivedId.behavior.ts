import { Container, DerivedState, StateCollection, collection, container, derived } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

interface DerivedStateContext {
  stateCollection: StateCollection<DerivedState<number>>
  dependencyContainer: Container<number>
  data: { callCount: number }
}

export default behavior("Derived State with Id", [

  example(testStoreContext<DerivedStateContext>())
    .description("referencing derived state by id in a collection")
    .script({
      suppose: [
        fact("there is a container and a collection of derivative state", (context) => {
          const derivedStateCollection = collection((id) => derived({
            name: `fun-${id}`,
            query: (get) => {
              context.tokens.data.callCount++
              return get(context.tokens.dependencyContainer) + 20
            }
          }))

          context.setTokens({
            stateCollection: derivedStateCollection,
            dependencyContainer: container({ initialValue: 17 }),
            data: { callCount: 0 }
          })
        }),
        fact("a subscriber subscribes to derived state with id", (context) => {
          context.subscribeTo(context.tokens.stateCollection.get("derived-1"), "derived-sub-1")
          context.subscribeTo(context.tokens.stateCollection.get("derived-1"), "derived-sub-2")
        })
      ],
      perform: [
        step("update the dependency", (context) => {
          context.writeTo(context.tokens.dependencyContainer, 41)
        })
      ],
      observe: [
        effect("the subscribers have the correct values", (context) => {
          expect(context.valuesForSubscriber("derived-sub-1"), is([
            37,
            61
          ]))
          expect(context.valuesForSubscriber("derived-sub-2"), is([
            37,
            61
          ]))
        }),
        effect("the query was only called once for the initial value and then once for the change", (context) => {
          expect(context.tokens.data.callCount, is(2))
        }),
        effect("the stringified token shows the name", (context) => {
          expect(context.tokens.stateCollection.get("derived-1").toString(), is("fun-derived-1"))
        })
      ]
    })

])