import { createStringRenderer } from "spheres/server"
import { createStore } from "spheres/store";
import { HTMLBuilder } from "spheres/view";

const renderToString = createStringRenderer(pageView, {
  activationScripts: ["/src/index.ts"]
})

export function render(): string {
  return renderToString(createStore())
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
          .title(el => el.children.textNode("Fun Stuff"))
      })
      .body(el => {
        el.children.h1(el => el.children.textNode("Hello!"))
      })
  })
}