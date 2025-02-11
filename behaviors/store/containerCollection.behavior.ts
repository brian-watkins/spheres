import { collection, Container, container, StateCollection } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage } from "helpers/metaMatchers";
import { testStoreContext } from "helpers/testStore";

export default behavior("container collection", [

  example(testStoreContext<ContainerIdTestContext>())
    .description("reference container via id from collection")
    .script({
      suppose: [
        fact("three references are created to the same container", (context) => {
          const containerCollection = collection((id) => container({
            name: id,
            initialValue: "",
            update: (message, current) => {
              return { value: `${current} ${message}`.trim() }
            }
          }))
          context.setTokens({
            collection: containerCollection,
            one: containerCollection.get("container-1"),
            two: containerCollection.get("container-1"),
            three: containerCollection.get("container-2"),
          })
        }),
        fact("there are subscribers for the containers with the same id", (context) => {
          context.subscribeTo(context.tokens.collection.get("container-1"), "sub-1")
          context.subscribeTo(context.tokens.collection.get("container-2"), "sub-2")
        })
      ],
      perform: [
        step("write to the first reference", (context) => {
          context.writeTo(context.tokens.one, "one")
        }),
        step("write to the second reference", (context) => {
          context.writeTo(context.tokens.two, "two")
        }),
        step("write to the third reference", (context) => {
          context.writeTo(context.tokens.three, "three")
        })
      ],
      observe: [
        effect("the subscriber gets the messages written to the containers referenced by the same id", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "",
            "one",
            "one two",
          ]))
        }),
        effect("the other subscriber gets the message written to the container referenced by the other id", (context) => {
          expect(context.valuesForSubscriber("sub-2"), is([
            "",
            "three"
          ]))
        }),
        effect("the debug name is equal to the id", (context) => {
          expect(context.tokens.one.toString(), is("container-1"))
          expect(context.tokens.two.toString(), is("container-1"))
          expect(context.tokens.three.toString(), is("container-2"))
        })
      ]
    }),

  example(testStoreContext<ContainerIdTestContext>())
    .description("the meta container is referenced")
    .script({
      suppose: [
        fact("three references are created to the same container", (context) => {
          const containerCollection = collection((id) => container({
            name: id,
            initialValue: "",
            update: (message, current) => {
              return { value: `${current} ${message}`.trim() }
            }
          }))
          context.setTokens({
            collection: containerCollection,
            one: containerCollection.get("container-1"),
            two: containerCollection.get("container-1"),
            three: containerCollection.get("container-1"),
          })
        }),
        fact("there is a subscriber to the meta container for the container with the same id", (context) => {
          context.subscribeTo(context.tokens.collection.get("container-1").meta, "meta-sub-1")
        }),
        fact("there are container hooks defined for the container", (context) => {
          context.useContainerHooks(context.tokens.collection.get("container-1"), {
            async onWrite(message, actions) {
              actions.error("Oops!", message)
            },
          })
        })
      ],
      perform: [
        step("an error is thrown in the reducer", (context) => {
          context.writeTo(context.tokens.collection.get("container-1"), "BLOWUP")
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

interface ContainerIdTestContext {
  collection: StateCollection<Container<string>>
  one: Container<string>
  two: Container<string>
  three: Container<string>
}
