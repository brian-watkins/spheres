import { createStringRenderer } from "spheres/server"
import { container, createStore } from "spheres/store";
import { HTMLBuilder } from "spheres/view";

const someContainer = container({ initialValue: "initial" })
const anotherContainer = container({ initialValue: "https://some-resource.com/resource" })

const renderToString = createStringRenderer(pageView, {
  stateMap: { someContainer },
  activationScripts: ["/src/index.ts"]
})

export function render(): string {
  return renderToString(createStore({
    async init(actions) {
      actions.pending(someContainer, "")
    },
  }))
}

function pageView(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children
          .link(el => {
            el.config
              .rel("icon")
              .href("data:,")
          })
          .script(el => {
            el.config
              .type("module")
              .src("https://my-other-server/js/someScript.js")
          })
          .script(el => {
            el.config
              .type("module")
              .src(get => get(anotherContainer))
          })
          .title(el => el.children.textNode("Fun Stuff"))
      })
      .body(el => {
        el.children.h1(el => el.children.textNode("Hello!"))
      })
  })
}