import * as View from "@src/display/index.js"

export default function(): View.View {
  return View.div([], [
    View.h1([], []),
    View.article([], []),
    View.p([], []),
    View.ul([], [
      View.li([], [ View.text("hello") ])
    ]),
    View.button([], [ View.text("Click it!") ]),
    View.element("some-custom-element", [], []),
    View.textarea([], []),
  ])
}