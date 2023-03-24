import * as View from "@src/display/index.js"

export default function(): View.View {
  return View.div([], [
    View.h1([], []),
    View.h2([], []),
    View.h3([], []),
    View.h4([], []),
    View.h5([], []),
    View.h6([], []),
    View.hr([], []),
    View.article([], []),
    View.p([], []),
    View.ul([], [
      View.li([], [ View.text("hello") ])
    ]),
    View.input([], []),
    View.button([], [ View.text("Click it!") ]),
    View.element("some-custom-element", [], []),
    View.textarea([], []),
    View.a([View.href("http://blah.blah")], [View.text("Click me!")])
  ])
}