import { Container, container } from "@src/index";
import { behavior, effect, example, fact, step } from "best-behavior";
import { arrayWith, expect, is } from "great-expectations";
import { errorMessage, okMessage } from "helpers/metaMatchers";
import { testStoreContext } from "helpers/testStore";

export default behavior("dynamic container id", [

  example(testStoreContext<ContainerIdTestContext>())
    .description("reference container via string id")
    .script({
      suppose: [
        fact("three references are created to the same container", (context) => {
          context.setTokens({
            one: containerGenerator("container-1"),
            two: containerGenerator("container-1"),
            three: containerGenerator("container-1")
          })
        }),
        fact("there is a subscriber for the container with the same id", (context) => {
          context.subscribeTo(containerGenerator("container-1"), "sub-1")
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
        effect("the subscriber gets all the messages", (context) => {
          expect(context.valuesForSubscriber("sub-1"), is([
            "",
            "one",
            "one two",
            "one two three"
          ]))
        }),
        effect("the debug name is equal to the id", (context) => {
          expect(context.tokens.one.toString(), is("container-1"))
          expect(context.tokens.two.toString(), is("container-1"))
          expect(context.tokens.three.toString(), is("container-1"))
        })
      ]
    }),

  example(testStoreContext<ContainerIdTestContext>())
    .description("the meta container is referenced")
    .script({
      suppose: [
        fact("three references are created to the same container", (context) => {
          context.setTokens({
            one: containerGenerator("container-1"),
            two: containerGenerator("container-1"),
            three: containerGenerator("container-1")
          })
        }),
        fact("there is a subscriber to the meta container for the container with the same id", (context) => {
          context.subscribeTo(containerGenerator("container-1").meta, "meta-sub-1")
        }),
        fact("there are container hooks defined for the container", (context) => {
          context.useContainerHooks(containerGenerator("container-1"), {
            async onWrite(message, actions) {
              actions.error(message, "Oops!")
            },
          })
        })
      ],
      perform: [
        step("an error is thrown in the reducer", (context) => {
          context.writeTo(containerGenerator("container-1"), "BLOWUP")
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
    }),

  example(testStoreContext<Container<string>>())
    .description("when the name and the id are set")
    .script({
      suppose: [
        fact("there is a container with a name and an id", (context) => {
          context.setTokens(container({
            id: "6",
            name: "fun-container",
            initialValue: "hello"
          }))
        })
      ],
      observe: [
        effect("the string name includes the name and id", (context) => {
          expect(context.tokens.toString(), is("fun-container-6"))
        })
      ]
    })

])

function containerGenerator(id: string): Container<string> {
  return container({
    id,
    initialValue: "",
    update: (message, current) => {
      return { value: `${current} ${message}`.trim() }
    }
  })
}

interface ContainerIdTestContext {
  one: Container<string>
  two: Container<string>
  three: Container<string>
}
