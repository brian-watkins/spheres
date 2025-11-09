import { collection, container, Container, update } from "@store/index.js";
import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { testStoreContext } from "./helpers/testStore";
import { Collection } from "@store/state/collection";
import { errorMessage, okMessage } from "./helpers/metaMatchers";

export default behavior("container collection", [

  example(testStoreContext<ContainerIdTestContext<string, string>>())
    .description("basic collection")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          context.setTokens({
            collection: collection((id) => container({
              initialValue: "",
              name: `Fun-Collection[${id}]`
            }))
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
          expect(context.tokens.collection.at("container-1").toString(), is("Fun-Collection[container-1]"))
        })
      ]
    }),

  example(testStoreContext<ContainerIdTestContext<number, CollectionResult, string>>())
    .description("collection with an update function")
    .script({
      suppose: [
        fact("there is a collection", (context) => {
          context.setTokens({
            collection: collection((id) => container({
              initialValue: { words: `${id}` },
              update: (message, current) => {
                return {
                  value: { words: `${current.words} + ${message}` }
                }
              }
            }))
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
            collection: collection((id) => container({
              initialValue: { words: `${id}` },
              update: (message, current) => {
                return {
                  value: { words: `${current.words} + ${message}` }
                }
              }
            }))
          })
        }),
        fact("there is a subscriber for a collection container", (context) => {
          context.subscribeToCollection(context.tokens.collection, 1, "sub-1")
        })
      ],
      perform: [
        step("update the value of a collection item", (context) => {
          context.store.dispatch(update(context.tokens.collection.at(1), (curr) => `Size: ${curr.words.length}`))
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
    }),

  example(testStoreContext<ContainerIdTestContext<string, string>>())
    .description("the meta container is referenced")
    .script({
      suppose: [
        fact("three references are created to the same container", (context) => {
          const containerCollection = collection((id: string) => container({
            name: id,
            initialValue: "",
            update: (message, current) => {
              return { value: `${current} ${message}`.trim() }
            }
          }))
          context.setTokens({
            collection: containerCollection,
            // one: containerCollection.at("container-1"),
            // two: containerCollection.at("container-1"),
            // three: containerCollection.at("container-1"),
          })
        }),
        fact("there is a subscriber to the meta container for the container with the same id", (context) => {
          context.subscribeTo(context.tokens.collection.at("container-1").meta, "meta-sub-1")
        }),
        fact("there are container hooks defined for the container", (context) => {
          context.useContainerHooks(context.tokens.collection.at("container-1"), {
            async onWrite(message, actions) {
              actions.error("Oops!", message)
            },
          })
        })
      ],
      perform: [
        step("an error is thrown in the reducer", (context) => {
          context.writeTo(context.tokens.collection.at("container-1"), "BLOWUP")
        })
      ],
      observe: [
        effect("the meta container has the expected value", (context) => {
          expect(context.valuesForSubscriber("meta-sub-1"), is(arrayWith([
            okMessage(),
            errorMessage("BLOWUP", "Oops!")
          ])))
        })
      ]
    })
])

interface CollectionResult {
  words: string
}

interface ContainerIdTestContext<Key, Value, Message = Value> {
  collection: Collection<Key, Container<Value, Message>>
}
