import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, assignedWith, equalTo, expect, is } from "great-expectations";
import { container, meta, ok, pending, useWriter, withInitialValue } from "@src/index.js";
import { Container } from "@src/loop.js";
import { testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { TestWriter } from "./helpers/testWriter.js";
import { okMessage, pendingMessage } from "./helpers/metaMatchers.js";

interface ContainerWithWriterContext {
  container: Container<string>
  writer: TestWriter<string>
}

const simpleManagedContainer =
  example(testSubscriberContext<ContainerWithWriterContext>())
    .description("update to simple container")
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
          useWriter(containerState, writer)

          context.setState({
            container: containerState,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.container, "sub-one")
        }),
        fact("there is a subscriber to the meta container", (context) => {
          context.subscribeTo(meta(context.state.container), "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            equalTo("initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a write message is dispatched for the container", (context) => {
          context.write(context.state.container, "Something Funny!")
        })
      ],
      observe: [
        effect("the writer gets the data to update", (context) => {
          expect(context.state.writer.lastValueToWrite, is(assignedWith(equalTo("Something Funny!"))))
        }),
        effect("the subscriber does not receive the message yet", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            equalTo("initial"),
          ])))
        }),
        effect("the subscriber to the meta container gets a pending message", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            okMessage("initial"),
            pendingMessage("Something Funny!")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager writes the value and publishes it", (context) => {
          context.state.writer.resolveWith?.("Wrote Something Funny!")
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            equalTo("initial"),
            equalTo("Wrote Something Funny!")
          ])))
        }),
        effect("the meta subscriber receives an ok value", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            okMessage("initial"),
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

const writerThatUsesOtherState =
  example(testSubscriberContext<ContainerAndStateWithWriter>())
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
          useWriter(thingContainer, writer)
          context.setState({
            userIdState,
            container: thingContainer,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.container, "sub-one")
        }),
        fact("there is a subscriber to the meta-container", (context) => {
          context.subscribeTo(meta(context.state.container), "meta-sub")
        })
      ],
      observe: [
        effect("the subscriber gets the initial state", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            "initial"
          ])))
        }),
        effect("the meta subscriber gets the ok message with the initial value", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            okMessage("initial")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a value is written to the container", (context) => {
          context.write(context.state.container, "hello")
        })
      ],
      observe: [
        effect("the meta subscriber gets the pending write value", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            okMessage("initial"),
            pendingMessage("Writing hello for user 28")
          ])))
        }),
        effect("the container subscriber receives no new value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            "initial"
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the user id state changes", (context) => {
          context.write(context.state.userIdState, 41)
        }),
        step("the write completes", (context) => {
          context.state.writer.resolveWith?.("wrote-hello")
        })
      ],
      observe: [
        effect("the subscriber gets the written message with the new userId", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(equalTo([
            "initial",
            "Wrote wrote-hello for user 41"
          ])))
        }),
        effect("the meta subscriber gets the ok message with the written value", (context) => {
          expect(context.valuesReceivedBy("meta-sub"), is(arrayWith([
            okMessage("initial"),
            pendingMessage("Writing hello for user 28"),
            okMessage("Wrote wrote-hello for user 41"),
          ])))
        }),
      ]
    })

export default behavior("Managed Update", [
  simpleManagedContainer,
  writerThatUsesOtherState
])