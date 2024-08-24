import { container, write } from "@spheres/store";
import { HTMLBuilder } from "@src/index";


enum RoutePath {
  HOME = "/home",
  BIG = "/big",
  REGULAR = "/regular"
}

const routePath = container<RoutePath>({ initialValue: RoutePath.HOME })

// const visibilityState = container<boolean, string>({
//   initialValue: true,
//   update: (_, current) => {
//     return { value: !current }
//   }
// })

// function router(path: keyof typeof RoutePath): RoutePath {
//   console.log("Route path", RoutePath, RoutePath[path])
//   //@ts-ignore
//   return Object.entries(RoutePath).find(([key, value]) => {
//     console.log("key, path", value, path)
//     //@ts-ignore
//     return value === path
//   })![1]
// }

// function multipleRootZone(root: HTMLBuilder) {


//   root.zoneShow(get => get(route) === "/big",)
//   if (get(toggleState)) {
//     return root => root.h1(el => {
//       el.children.textNode("Big text!")
//     })
//   } else {
//     return root => root.p(el => {
//       el.children.textNode("Regular text!")
//     })
//   }
// }

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
      .zoneShow(get => get(routePath) === RoutePath.HOME, homeZone)
      .zoneShow(get => get(routePath) === RoutePath.BIG, bigZone)
      .zoneShow(get => get(routePath) === RoutePath.REGULAR, regularZone)
  })
}

// export default function (root: HTMLBuilder) {
// root.zone(statefulContainer)
// }