import { addAttribute, addProperty, bindToContainer, makeVirtualElement, virtualNodeConfig } from "@src/vdom/virtualNode.js";
import { behavior, effect, example, fact, step } from "esbehavior";
import { expect, is, resolvesTo } from "great-expectations";
import { selectElement } from "helpers/displayElement.js";
import { renderContext } from "helpers/renderContext.js";
import { Container, container } from "state-party";

interface ContainerContext {
  containerOne: Container<string>
  containerTwo: Container<string>
}

export default behavior("bound element", [

  (m) => m.pick() && example(renderContext<ContainerContext>())
    .description("update input element with bound value")
    .script({
      suppose: [
        fact("there is an input node with a bound container", (context) => {
          const stringContainer = container({ initialValue: "Yo!" })
          context.setState({
            containerOne: stringContainer,
            containerTwo: container({ initialValue: "hey hey hey!" })
          })

          const bindConfig = virtualNodeConfig()
          addAttribute(bindConfig, "name", "funnyContainer")
          addAttribute(bindConfig, "type", "text")
          // this maybe should be bindToContainer function
          // and then we could set the event listener if we needed to
          bindToContainer(bindConfig, stringContainer)
          // addProperty(bindConfig, "container", stringContainer)

          context.mount(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("input", bindConfig, [])
          ]))
        }),
        fact("there are subscribers to the containers", (context) => {
          context.subscribeTo(context.state.containerOne, "sub-one")
          context.subscribeTo(context.state.containerTwo, "sub-two")
        })
      ],
      observe: [
        effect("it renders the input field with the initial value of the bound container", async () => {
          await expect(selectElement("[name='funnyContainer']").inputValue(), resolvesTo("Yo!"))
        })
      ]
    }).andThen({
      perform: [
        step("the container value is updated", (context) => {
          context.writeTo(context.state.containerOne, "Who dis?")
        })
      ],
      observe: [
        effect("it renders the input field with the updated value of the bound container", async () => {
          await expect(selectElement("[name='funnyContainer']").inputValue(), resolvesTo("Who dis?"))
        })
      ]
    }).andThen({
      perform: [
        step("a new value is typed into the field", async () => {
          await selectElement("[name='funnyContainer']").type("cool things")
        })
      ],
      observe: [
        effect("the container value is updated", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is([
            "Yo!",
            "Who dis?",
            "cool things"
          ]))
        })
      ]
    }).andThen({
      perform: [
        step("the input element's ordinary attributes are updated", (context) => {
          const bindConfig = virtualNodeConfig()
          addAttribute(bindConfig, "name", "seriousContainer")
          addAttribute(bindConfig, "type", "text")
          // this maybe should be bindToContainer function
          bindToContainer(bindConfig, context.state.containerOne)
          // addProperty(bindConfig, "container", context.state.containerOne)

          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("input", bindConfig, [])
          ]))
        })
      ],
      observe: [
        effect("it renders the input field with the value of the bound container", async () => {
          await expect(selectElement("[name='seriousContainer']").inputValue(), resolvesTo("cool things"))
        })
      ]
    }).andThen({
      perform: [
        step("the input element's bound container is updated", (context) => {
          const bindConfig = virtualNodeConfig()
          addAttribute(bindConfig, "name", "seriousContainer")
          addAttribute(bindConfig, "type", "text")
          bindToContainer(bindConfig, context.state.containerTwo)
          // addProperty(bindConfig, "container", context.state.containerTwo)

          context.patch(makeVirtualElement("div", virtualNodeConfig(), [
            makeVirtualElement("input", bindConfig, [])
          ]))
        })
      ],
      observe: [
        effect("it renders the input field with the value of the newly bound container", async () => {
          await expect(selectElement("[name='seriousContainer']").inputValue(), resolvesTo("hey hey hey!"))
        })
      ]
    }).andThen({
      perform: [
        step("input is entered into the field", async () => {
          await selectElement("[name='seriousContainer']").type("a new idea!")
        })
      ],
      observe: [
        effect("the container value is updated", (context) => {
          expect(context.valuesForSubscriber("sub-two"), is([
            "hey hey hey!",
            "a new idea!"
          ]))
        }),
        effect("the old container value is no longer updated", (context) => {
          expect(context.valuesForSubscriber("sub-one"), is([
            "Yo!",
            "Who dis?",
            "cool things"
          ]))
        })
      ]
    })

])