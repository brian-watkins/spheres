import { behavior, effect, example, fact, step } from "esbehavior";
import { arrayWith, assignedWith, equalTo, expect, is, Matcher, objectWith } from "great-expectations";
import { container, useWriter, withInitialValue } from "@src/index.js";
import { Container } from "@src/loop.js";
import { testSubscriberContext } from "./helpers/testSubscriberContext.js";
import { TestWritable, testWriteMessage, TestWriter } from "./helpers/testWriter.js";

interface ContainerWithWriterContext {
  container: Container<TestWritable<string>>
  writer: TestWriter<string>
}

const simpleManagedContainer =
  example(testSubscriberContext<ContainerWithWriterContext>())
    .description("update to simple container")
    .script({
      suppose: [
        fact("there is a container that uses a writer", (context) => {
          const containerState = container<TestWritable<string>>(withInitialValue({ type: "write-unknown" }))
          const writer = new TestWriter<string>()
          writer.setHandler(async (value, _, set, waitFor) => {
            set(value)
            const writtenValue = await waitFor()
            set(writtenValue)
          })
          useWriter(containerState, writer)

          context.setState({
            container: containerState,
            writer
          })
        }),
        fact("there is a subscriber", (context) => {
          context.subscribeTo(context.state.container, "sub-one")
        })
      ],
      observe: [
        effect("the subscriber gets the initial value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage()
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a write message is dispatched for the container", (context) => {
          context.update((loop) => {
            loop.dispatch(testWriteMessage(context.state.container, {
              type: "write-pending",
              value: "Something Funny!"
            }))
          })
        })
      ],
      observe: [
        effect("the writer gets the data to update", (context) => {
          expect(context.state.writer.lastValueToWrite, is(assignedWith(writePendingMessage("Something Funny!"))))
        }),
        effect("the subscriber get a write pending message", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage(),
            writePendingMessage("Something Funny!")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the manager writes the value and publishes it", (context) => {
          context.state.writer.resolveWith?.({ type: "write-ok", value: "Wrote Something Funny!" })
        })
      ],
      observe: [
        effect("the subscriber receives the written value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage(),
            writePendingMessage("Something Funny!"),
            writeOkMessage("Wrote Something Funny!")
          ])))
        })
      ]
    })

interface ContainerAndStateWithWriter {
  userIdState: Container<number>
  container: Container<TestWritable<string>>
  writer: TestWriter<string>
}

const writerThatUsesOtherState =
  example(testSubscriberContext<ContainerAndStateWithWriter>())
    .description("writer that uses other state")
    .script({
      suppose: [
        fact("there is a container with a writer", (context) => {
          const userIdState = container(withInitialValue(28))
          const thingContainer = container<TestWritable<string>>(withInitialValue({ type: "write-unknown" }))
          const writer = new TestWriter<string>()
          writer.setHandler(async (value, get, set, waitFor) => {
            if (value.type === "write-pending") {
              set({ type: "write-pending", value: `Writing ${value.value} for user ${get(userIdState)}` })
            }
            const thing = await waitFor()
            if (thing.type === "write-ok") {
              set({ type: "write-ok", value: `Wrote ${thing.value} for user ${get(userIdState)}` })
            }
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
        })
      ],
      observe: [
        effect("the subscriber gets the initial state with the derived key", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage()
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("a value is written to the container", (context) => {
          context.update((loop) => {
            loop.dispatch(testWriteMessage(context.state.container, { type: "write-pending", value: "hello" }))
          })
        })
      ],
      observe: [
        effect("the subscriber gets the pending write value", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage(),
            writePendingMessage("Writing hello for user 28")
          ])))
        })
      ]
    }).andThen({
      perform: [
        step("the user id state changes", (context) => {
          context.write(context.state.userIdState, 41)
        }),
        step("the write completes", (context) => {
          context.state.writer.resolveWith?.({ type: "write-ok", value: "wrote-hello" })
        })
      ],
      observe: [
        effect("the subscriber gets the written message with the new userId", (context) => {
          expect(context.valuesReceivedBy("sub-one"), is(arrayWith([
            writeUnknownMessage(),
            writePendingMessage("Writing hello for user 28"),
            writeOkMessage("Wrote wrote-hello for user 41")
          ])))
        })
      ]
    })

function writeUnknownMessage(): Matcher<TestWritable<string>> {
  return objectWith({
    type: equalTo("write-unknown")
  })
}

function writePendingMessage(value: string): Matcher<TestWritable<string>> {
  return objectWith({
    type: equalTo("write-pending"),
    value: equalTo(value)
  })
}

function writeOkMessage(value: string): Matcher<TestWritable<string>> {
  return objectWith({
    type: equalTo("write-ok"),
    value: equalTo(value)
  })
}

export default behavior("Managed Update", [
  simpleManagedContainer,
  writerThatUsesOtherState
])