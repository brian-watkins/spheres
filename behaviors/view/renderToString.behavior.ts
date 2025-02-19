import { HTMLView, renderToString } from "@src/index.js";
import { behavior, effect, example, Example } from "best-behavior";
import { equalTo, expect, is } from "great-expectations";
import { appWithZone, appWithDataAttributesNoValue, appWithDeeplyNestedState, appWithInnerHTML, appWithNestedState, appWithPropertiesAndAttributes, appWithReactiveAttributes, appWithReactiveClass, appWithReactiveText, appWithSimpleState, appWithZones, staticApp, appWithViewSelector, appWithEvents } from "./fixtures/static.app.js";
import { createStore } from "@spheres/store"

export default behavior("Render view to HTML string", [
  renderTest("render view with no event handlers or state", (renderer) => {
    const actual = renderer.renderView(staticApp({ name: "Cool Dude", age: 27 }))
    expect(actual, is(equalTo(`<div><h1>Hello "Cool Dude"!</h1><hr><p>You are supposedly 27 years old.</p></div>`)))
  }),
  renderTest("render view with properties and attributes", (renderer) => {
    const actual = renderer.renderView(appWithPropertiesAndAttributes({ name: "Awesome Person", age: 99 }))
    expect(actual, is(equalTo(`<div id="element-1"><div data-person="Awesome Person" class="my-class another-class">99 years old</div></div>`)))
  }),
  renderTest("render view with data attribute that has no value", (renderer) => {
    const actual = renderer.renderView(appWithDataAttributesNoValue({ name: "Funny Dude", age: 11 }))
    expect(actual, is(equalTo(`<div><div data-is-person="true">11 years old</div></div>`)))
  }),
  renderTest("render view with state", (renderer) => {
    const actual = renderer.renderView(appWithSimpleState)
    expect(actual, is(equalTo(`<div><h2>Cool Person!</h2></div>`)))
  }),
  renderTest("render view with nested stateful views", (renderer) => {
    const actual = renderer.renderView(appWithNestedState)
    expect(actual, is(equalTo(`<div><!--switch-start-0.2--><h2 data-spheres-template="">Cool Person!</h2><!--switch-end-0.2--></div>`)))
  }),
  renderTest("render view with deeply nested stateful views", (renderer) => {
    const actual = renderer.renderView(appWithDeeplyNestedState)
    expect(actual, is(equalTo(`<div><div><h2>Cool Person!</h2><p>98 years!</p></div></div>`)))
  }),
  renderTest("render with zone", (renderer) => {
    const actual = renderer.renderView(appWithZone)
    expect(actual, is(equalTo("<div><h1>Hello!</h1></div>")))
  }),
  renderTest("render view with reactive text", (renderer) => {
    const actual = renderer.renderView(appWithReactiveText)
    expect(actual, is(equalTo("<div>98 years old!</div>")))
  }),
  renderTest("render view with reactive attribute", (renderer) => {
    const actual = renderer.renderView(appWithReactiveAttributes)
    expect(actual, is(equalTo(`<div data-name="Cool Person!">This is your name!</div>`)))
  }),
  renderTest("render view with reactive class", (renderer) => {
    const actual = renderer.renderView(appWithReactiveClass)
    expect(actual, is(equalTo(`<div class="bg-red-98">Look at this!</div>`)))
  }),
  renderTest("render view with innerHTML property", (renderer) => {
    const actual = renderer.renderView(appWithInnerHTML)
    expect(actual, is(equalTo(`<div><div><h1>HELLO!!!</h1></div></div>`)))
  }),
  renderTest("render view with list with events", (renderer) => {
    const actual = renderer.renderView(appWithZones)
    expect(actual, is(equalTo(`<div><!--list-start-0.2--><div data-spheres-template=""><h1>snake is at index 0</h1><button data-spheres-click="0.2.3">Click me!</button></div><div data-spheres-template=""><h1>eagle is at index 1</h1><button data-spheres-click="0.2.3">Click me!</button></div><!--list-end-0.2--></div>`)))
  }),
  renderTest("render view with non-bubbling events and bubbling events", (renderer) => {
    const actual = renderer.renderView(appWithEvents)
    expect(actual, is(equalTo(`<div><div><div data-spheres-click="0.3">Element with events!</div></div></div>`)))
  }),
  renderTest("render view with conditional view", (renderer) => {
    const actual = renderer.renderView(appWithViewSelector)
    expect(actual, is(equalTo(`<div><!--switch-start-0.2--><h3 data-spheres-template="">Fun!</h3><!--switch-end-0.2--></div>`)))
  }),
  renderTest("render void elements without closing tags", (renderer) => {
    const actual = renderer.renderView((root) => {
      root.main(el => {
        el.children
          .hr()
          .img(el => {
            el.config.src("/assets/myImg.png")
          })
      })
    })
    expect(actual, is(equalTo(`<main><hr><img src="/assets/myImg.png"></main>`)))
  })
])

class TestRenderer {
  private store = createStore()

  renderView(view: HTMLView): string {
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
