import { HTMLBuilder } from "spheres/view"
import { container, createStore } from "spheres/store"
import { funView } from "./view"
import { createStringRenderer } from "spheres/server"
import { someView } from "./someView"

const rendererToString = createStringRenderer(view, {
  activationScripts: [
    "./index.ts"
  ]
})

export function renderHTML(): string {
  return rendererToString(createStore())
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
              .src((get) => `${get(someFilename)}.ts`)
          })
          .link(el => {
            el.config
              .rel("stylesheet")
              .href((get) => `${get(someFilename)}.css`)
          })
      })
      .body(el => {
        el.children
          .subview(someView)
          .subview(funView)
      })
  })
}