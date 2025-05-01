import { container, write } from "@store/index.js";
import { HTMLBuilder } from "@view/index.js";


enum RoutePath {
  HOME = "home",
  BIG = "big",
  REGULAR = "regular"
}

const routePath = container<RoutePath>({ initialValue: RoutePath.HOME })

function homeZone(root: HTMLBuilder) {
  root.h3(el => {
    el.children.textNode("Welcome home!")
  })
}

function bigZone(root: HTMLBuilder) {
  root.h1(el => {
    el.children.textNode("Big text!")
  })
}

function regularZone(root: HTMLBuilder) {
  root.p(el => {
    el.children.textNode("Regular text!")
  })
}

export default function (root: HTMLBuilder) {
  root.div(el => {
    el.children
      .select(el => {
        el.config
          .name("route")
          .on("change", (evt) => {
            const path = (evt.target as HTMLSelectElement).value as unknown as RoutePath
            return write(routePath, path)
          })
        el.children
          .option(el => {
            el.config
              .value(RoutePath.HOME)
              .selected(true)
            el.children.textNode("Home")
          })
          .option(el => {
            el.config.value(RoutePath.BIG)
            el.children.textNode("Big")
          })
          .option(el => {
            el.config.value(RoutePath.REGULAR)
            el.children.textNode("Regular")
          })
      })
      .subviewFrom(select => select.withConditions()
        .when(get => get(routePath) === "home", homeZone)
        .when(get => get(routePath) === "big", bigZone)
        .when(get => get(routePath) === "regular", regularZone)
      )
  })
}
