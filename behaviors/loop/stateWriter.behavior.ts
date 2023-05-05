import { behavior, ConfigurableExample, effect, example, fact, step } from "esbehavior";
import { arrayWith, assignedWith, equalTo, expect, is } from "great-expectations";
import { TestWriter } from "./helpers/testWriter.js";
import { initMessage, okMessage, pendingMessage } from "./helpers/metaMatchers.js";
import { container, Container, ok, pending, withInitialValue, withReducer } from "@src/store/";
import { testStoreContext } from "./helpers/testStore.js";

interface ContainerWithWriterContext {
  container: Container<string>
  writer: TestWriter<string>
}

const containerWithSimpleWriter: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<ContainerWithWriterContext>())
    .description("update to simple container with a writer")
    .script({
      suppose: [
        fact("there is a container that uses a writer", (context) => {
          const containerState = container(withInitialValue("initial"))
          const writer = new TestWriter<string>()
          writer.setHandler(async (value, _, set, waitFor) => {
            set(pending(value))
            const writtenValue = await waitFor()
            set(ok(writtenValue))
          })
          context.useWriter(containerState, writer)

          context.setTokens({
            container: containerState,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(context.tokens.container.meta, "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(arrayWith([
            equalTo("initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a write message is dispatched for the container", (context) => {
          context.writeTo(context.tokens.container, "Something Funny!")
        })
      ],
      observe: [
        effect("the writer gets the data to update", (context) => {
          expect(context.tokens.writer.lastValueToWrite, is(assignedWith(equalTo("Something Funny!"))))
        }),
        effect("the subscriber does not receive the message yet", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(arrayWith([
            equalTo("initial"),
          ])))
        }),
        effect("the subscriber to the meta container gets a pending message", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            initMessage("initial"),
            pendingMessage("Something Funny!")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager writes the value and publishes it", (context) => {
          context.tokens.writer.resolveWith?.("Wrote Something Funny!")
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(arrayWith([
            equalTo("initial"),
            equalTo("Wrote Something Funny!")
          ])))
        }),
        effect("the meta subscriber receives an ok value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            initMessage("initial"),
            pendingMessage("Something Funny!"),
            okMessage("Wrote Something Funny!")
          ])))
        })
      ]
    })

interface ContainerAndStateWithWriter {
  userIdState: Container<number>
  container: Container<string>
  writer: TestWriter<string>
}

const writerThatUsesOtherState: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<ContainerAndStateWithWriter>())
    .description("writer that uses other state")
    .script({
      suppose: [
        fact("there is a container with a writer", (context) => {
          const userIdState = container(withInitialValue(28))
          const thingContainer = container(withInitialValue("initial"))
          const writer = new TestWriter<string>()
          writer.setHandler(async (value, get, set, waitFor) => {
            set(pending(`Writing ${value} for user ${get(userIdState)}`))
            const thing = await waitFor()
            set(ok(`Wrote ${thing} for user ${get(userIdState)}`))
          })
          context.useWriter(thingContainer, writer)
          context.setTokens({
            userIdState,
            container: thingContainer,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.container, "sub-one")
        }),
        fact("there is a subscriber to the meta-container", (context) => {
          context.subscribeTo(context.tokens.container.meta, "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the initial state", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta subscriber gets the ok message with the initial value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            initMessage("initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a value is written to the container", (context) => {
          context.writeTo(context.tokens.container, "hello")
        })
      ],
      observe: [
        effect("the meta subscriber gets the pending write value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            initMessage("initial"),
            pendingMessage("Writing hello for user 28")
          ])))
        }),
        effect("the container subscriber receives no new value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the user id state changes", (context) => {
          context.writeTo(context.tokens.userIdState, 41)
        }),
        step("the write completes", (context) => {
          context.tokens.writer.resolveWith?.("wrote-hello")
        })
      ],
      observe: [
        effect("the subscriber gets the written message with the new userId", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            "initial",
            "Wrote wrote-hello for user 41"
          ])))
        }),
        effect("the meta subscriber gets the ok message with the written value", (context) => {
          expect(context.valuesForSubscriber("meta-sub"), is(arrayWith([
            initMessage("initial"),
            pendingMessage("Writing hello for user 28"),
            okMessage("Wrote wrote-hello for user 41"),
          ])))
        }),
      ]
    })

interface ReducerContainerWriterContext {
  reducerContainer: Container<number, string>
  writer: TestWriter<string>
}

const reducerContainerWriter: ConfigurableExample =
  (m) => m.pick() && example(testStoreContext<ReducerContainerWriterContext>())
    .description("writer for container with reducer")
    .script({
      suppose: [
        fact("there is a reducer container with a writer", (context) => {
          const reducerContainer = container(withReducer(28, (message: string, current: number) => {
            return message === "add" ? current + 1 : current - 1
          }))
          const writer = new TestWriter<string>()
          writer.setHandler(async (_, __, set, waitFor) => {
            const thing = await waitFor()
            set(ok(thing))
          })
          context.useWriter(reducerContainer, writer)
          context.setTokens({
            reducerContainer,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.tokens.reducerContainer, "sub-one")
        })
      ],
      perform: [
        step("a value is written to the container", (context) => {
          context.writeTo(context.tokens.reducerContainer, "hello")
        }),
        step("the write completes", (context) => {
          context.tokens.writer.resolveWith?.("add")
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is(equalTo([
            28,
            29
          ])))
        })
      ]
    })


export default behavior("Writer", [
  containerWithSimpleWriter,
  writerThatUsesOtherState,
  reducerContainerWriter
])