import { Container, DerivedState, container, derived } from "@src/index";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "helpers/testStore";

interface DerivedStateContext {
  dependencyContainer: Container<number>
  data: { callCount: number }
}

export default behavior("Derived State with Id", [

  example(testStoreContext<DerivedStateContext>())
    .description("referencing derived state by id")
    .script({
      suppose: [
        fact("there is a container", (context) => {
          context.setTokens({
            dependencyContainer: container({ initialValue: 17 }),
            data: { callCount: 0 }
          })
        }),
        fact("a subscriber subscribes to derived state with id", (context) => {
          const derivedWithId1 = derived({
            id: "super-cool",
            query: (get) => {
              context.tokens.data.callCount++
              return get(context.tokens.dependencyContainer) + 20
            }
          })

          const derivedWithId2 = derived({
            id: "super-cool",
            query: (get) => {
              context.tokens.data.callCount++
              return get(context.tokens.dependencyContainer) + 20
            }
          })

          context.subscribeTo(derivedWithId1, "derived-sub-1")
          context.subscribeTo(derivedWithId2, "derived-sub-2")
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
        effect("the query was only called once for each change", (context) => {
          expect(context.tokens.data.callCount, is(2))
        })
      ]
    }),

  example(testStoreContext<DerivedState<string>>())
    .description("when the name and the id are set")
    .script({
      suppose: [
        fact("there is a derived state with a name and an id", (context) => {
          context.setTokens(derived({
            id: "6",
            name: "fun-derived-state",
            query: () => "hello!"
          }))
        })
      ],
      observe: [
        effect("the string name includes the name and id", (context) => {
          expect(context.tokens.toString(), is("fun-derived-state-6"))
        })
      ]
    })

])