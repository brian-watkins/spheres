import { render } from "../../src/display/index.js";
import { behavior, effect, example, Example } from "esbehavior";
import { equalTo, expect, is } from "great-expectations";
import { appWithDataAttributesNoValue, appWithPropertiesAndAttributes, staticApp } from "./fixtures/static.app.js";

export default behavior("Render view to HTML", [
  test("render view with no event handlers or state", () => {
    const actual = render(staticApp({ name: "Cool Dude", age: 27 }))
    expect(actual, is(equalTo("<div><h1>Hello &quot;Cool Dude&quot;!</h1><hr><p>You are supposedly 27 years old.</p></div>")))
  }),
  test("render view with properties and attributes", () => {
    const actual = render(appWithPropertiesAndAttributes({ name: "Awesome Person", age: 99 }))
    expect(actual, is(equalTo(`<div id="element-1"><div class="my-class another-class" data-person="Awesome Person">99 years old</div></div>`)))
  }),
  test("render view with data attribute that has no value", () => {
    const actual = render(appWithDataAttributesNoValue({ name: "Funny Dude", age: 11 }))
    expect(actual, is(equalTo(`<div><div data-is-person="true">11 years old</div></div>`)))
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
