import { collection, use } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore";
import { Collection } from "@store/state/collection";

export default behavior("container collection", [

  example(testStoreContext<ContainerIdTestContext<string, string>>())
    .description("basic collection")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          context.setTokens({
            collection: collection({
              initialValues: () => "",
              name: "Fun-Collection"
            }),
          })
        }),
        fact("there are subscribers for the containers with the same id", (context) => {
          context.subscribeToCollection(context.tokens.collection, "container-1", "sub-1")
          context.subscribeToCollection(context.tokens.collection, "container-2", "sub-2")
        })
      ],
      perform: [
        step("write to the first reference", (context) => {
          context.writeToCollection(context.tokens.collection, "container-1", "one")
        }),
        step("write to the second reference", (context) => {
          context.writeToCollection(context.tokens.collection, "container-1", "two")
        }),
        step("write to the third reference", (context) => {
          context.writeToCollection(context.tokens.collection, "container-2", "three")
        })
      ],
      observe: [
        effect("the subscriber gets the messages written to the containers referenced by the same id", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "",
            "one",
            "two",
          ]))
        }),
        effect("the other subscriber gets the message written to the container referenced by the other id", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            "",
            "three"
          ]))
        }),
        effect("the debug name is equal to the id", (context) => {
          expect(context.tokens.collection.toString(), is("Fun-Collection"))
        })
      ]
    }),

  example(testStoreContext<ContainerIdTestContext<number, CollectionResult, string>>())
    .description("collection with an update function")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          context.setTokens({
            collection: collection({
              initialValues: (id) => ({ words: `${id}` }),
              update: (message, current) => {
                return {
                  value: { words: `${current.words} + ${message}` }
                }
              }
            }),
          })
        }),
        fact("there are subscribers for the collection containers", (context) => {
          context.subscribeToCollection(context.tokens.collection, 1, "sub-1")
          context.subscribeToCollection(context.tokens.collection, 2, "sub-2")
        })
      ],
      perform: [
        step("write to the first reference", (context) => {
          context.writeToCollection(context.tokens.collection, 1, "one")
        }),
        step("write to the second reference", (context) => {
          context.writeToCollection(context.tokens.collection, 1, "two")
        }),
        step("write to the third reference", (context) => {
          context.writeToCollection(context.tokens.collection, 2, "three")
        })
      ],
      observe: [
        effect("the subscriber gets the messages written to the containers referenced by the same id", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            { words: "1" },
            { words: "1 + one" },
            { words: "1 + one + two" },
          ]))
        }),
        effect("the other subscriber gets the message written to the container referenced by the other id", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            { words: "2" },
            { words: "2 + three" }
          ]))
        })
      ]
    }),

  example(testStoreContext<ContainerIdTestContext<number, CollectionResult, string>>())
    .description("update collection item")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          context.setTokens({
            collection: collection({
              initialValues: (id) => ({ words: `${id}` }),
              update: (message, current) => {
                return {
                  value: { words: `${current.words} + ${message}` }
                }
              }
            }),
          })
        }),
        fact("there is a subscriber for a collection container", (context) => {
          context.subscribeToCollection(context.tokens.collection, 1, "sub-1")
        })
      ],
      perform: [
        step("update the value of a collection item", (context) => {
          context.store.dispatch(use(get => get(context.tokens.collection).update(1, (curr) => `Size: ${curr.words.length}`)))
        })
      ],
      observe: [
        effect("the subscriber receives the updated value", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            { words: "1" },
            { words: "1 + Size: 1" }
          ]))
        })
      ]
    })

])

interface CollectionResult {
  words: string
}

interface ContainerIdTestContext<Key, Value, Message = Value> {
  collection: Collection<Key, Value, Message>
}
