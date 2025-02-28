import { HTMLBuilder } from "@view/index.js"
import { container, createStore } from "@store/index.js"
import { context } from "virtual:spheres/vite"
import { renderToString } from "@server/index.js"
import { funView } from "./view"

export function renderHTML(): string {
  return renderToString(createStore(), view, context)
}

const someFilename = container({ initialValue: "tracing" })

function view(root: HTMLBuilder) {
  root.html(el => {
    el.children
      .head(el => {
        el.children
          .title(el => el.children.textNode("Fun Stuff"))
          .link(el => {
            el.config
              .rel("stylesheet")
              .href("./styles.css")
          })
          .script(el => {
            el.config
              .type("module")
              .src("./index.ts")
          })
          .script(el => {
            el.config
              .type("module")
              .src((get) => `${get(someFilename)}.ts`)
          })
          .link(el => {
            el.config
              .rel("stylesheet")
              .href((get) => `${get(someFilename)}.css`)
          })
      })
      .body(el => {
        el.children.subview(funView)
      })
  })
}