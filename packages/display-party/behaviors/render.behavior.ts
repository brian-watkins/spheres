import { renderToString, View } from "../src/index.js";
import { behavior, effect, example, Example } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { appWithDataAttributesNoValue, appWithDeeplyNestedState, appWithInnerHTML, appWithNestedState, appWithPropertiesAndAttributes, appWithSimpleState, staticApp } from "./fixtures/static.app.js";
import { Store } from "state-party"

export default behavior("Render view to HTML", [
  renderTest("render view with no event handlers or state", async (renderer) => {
    const actual = await renderer.renderView(staticApp({ name: "Cool Dude", age: 27 }))
    expect(actual, is(equalTo("<div><h1>Hello &quot;Cool Dude&quot;!</h1><hr><p>You are supposedly 27 years old.</p></div>")))
  }),
  renderTest("render view with properties and attributes", async (renderer) => {
    const actual = await renderer.renderView(appWithPropertiesAndAttributes({ name: "Awesome Person", age: 99 }))
    expect(actual, is(equalTo(`<div id="element-1"><div class="my-class another-class" data-person="Awesome Person">99 years old</div></div>`)))
  }),
  renderTest("render view with data attribute that has no value", async (renderer) => {
    const actual = await renderer.renderView(appWithDataAttributesNoValue({ name: "Funny Dude", age: 11 }))
    expect(actual, is(equalTo(`<div><div data-is-person="true">11 years old</div></div>`)))
  }),
  renderTest("render view with state", async (renderer) => {
    const actual = await renderer.renderView(appWithSimpleState())
    expect(actual, is(equalTo(`<div><h2>Cool Person!</h2></div>`)))
  }),
  renderTest("render view with nested stateful views", async (renderer) => {
    const actual = await renderer.renderView(appWithNestedState())
    expect(actual, is(equalTo(`<div><h2>Cool Person!</h2></div>`)))
  }),
  renderTest("render view with deeply nested stateful views", async (renderer) => {
    const actual = await renderer.renderView(appWithDeeplyNestedState())
    expect(actual, is(equalTo(`<div><div><h2>Cool Person!</h2><p>98 years!</p></div></div>`)))
  }),
  renderTest("render view with innerHTML property", async (renderer) => {
    const actual = await renderer.renderView(appWithInnerHTML())
    expect(actual, is(equalTo(`<div><div><h1>HELLO!!!</h1></div></div>`)))
  })
])

class TestRenderer {
  private store = new Store()

  async renderView(view: View): Promise<string> {
    return renderToString(this.store, view)
  }
}

function renderTest(description: string, generator: (renderer: TestRenderer) => void): Example {
  return example({ init: () => new TestRenderer() })
  .description(description)
    .script({
      observe: [
        effect("it produces the expected string representation", generator)
      ]
    })
}
