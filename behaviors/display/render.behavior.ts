import { render } from "../../src/display/index.js";
import { behavior, effect, example, Example } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { appWithDataAttributesNoValue, appWithNestedState, appWithPropertiesAndAttributes, appWithSimpleState, staticApp } from "./fixtures/static.app.js";

export default behavior("Render view to HTML", [
  test("render view with no event handlers or state", async () => {
    const actual = await render(staticApp({ name: "Cool Dude", age: 27 }))
    expect(actual, is(equalTo("<div><h1>Hello &quot;Cool Dude&quot;!</h1><hr><p>You are supposedly 27 years old.</p></div>")))
  }),
  test("render view with properties and attributes", async () => {
    const actual = await render(appWithPropertiesAndAttributes({ name: "Awesome Person", age: 99 }))
    expect(actual, is(equalTo(`<div id="element-1"><div class="my-class another-class" data-person="Awesome Person">99 years old</div></div>`)))
  }),
  test("render view with data attribute that has no value", async () => {
    const actual = await render(appWithDataAttributesNoValue({ name: "Funny Dude", age: 11 }))
    expect(actual, is(equalTo(`<div><div data-is-person="true">11 years old</div></div>`)))
  }),
  test("render view with state", async () => {
    const actual = await render(appWithSimpleState())
    expect(actual, is(equalTo(`<div><h2>Cool Person!</h2></div>`)))
  }),
  test("render view with nested stateful views", async () => {
    const actual = await render(appWithNestedState())
    expect(actual, is(equalTo(`<div><div><h2>Cool Person!</h2><p>98 years!</p></div></div>`)))
  })
])

function test(description: string, generator: () => void): Example {
  return example()
    .script({
      observe: [
        effect(description, generator)
      ]
    })
}
