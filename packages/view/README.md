# @spheres/view

Create a browser-based user interface as a function of application state,
with fine-grained reactive updates.


## Introduction

`@spheres/view` provides a Typescript API for building views composed of HTML
or SVG elements.

Application logic is defined using state primitives provided by
`@spheres/store`. Browser events trigger handlers that produce messages
that will be dispatched automatically to the application Store. These
messages in turn trigger state updates that are automatically propagated
to update the view as necessary. And `@spheres/view` will only
update those parts of the view that depend on state that has changed.

The views created with `@spheres/view` are composed of synchronous
functions. Furthermore, all state is handled in terms of `@spheres/store`
State Tokens. There are no components, only view-generating functions.

Views may depend on state in two ways.

First, if the *structure* of some view depends on state, then a function
can be provided that defines a view based on state. Whenever the referenced
state tokens come to represent a new value, the function will be run and
the view will be patched to match the newly generated view.

Second, if the *value* of some element attribute or text node depends on
state, then a function can be provided that generates this value based on
state. In such a case, the attribute's value -- and
only the attribute's value -- will be updated whenever the referenced
state tokens come to represent a new value. The same is true for text
nodes associated with an element.

In these ways, the areas of the View that depend on state can be specified
precisely and updates will be performed in those areas only. This is what
we mean by saying that `@spheres/view` supports *fine-grained* reactive
updates.


## An Example

Consider a simple counter appliction. The application logic consists of
a single `Container` that holds the counter value. The
view shows text with the current counter value. A button is defined with
an event handler that produces a message to update the counter. As the
button is clicked, the text with the counter value is the only part of the
view that will be re-rendered.


```
import { htmlTemplate, renderToDOM } from "@spheres/view";
import { container, update } from "@spheres/store";

const clickCount = container({ initialValue: 0 })

const counter = htmlTemplate(() => root =>
  root.main(el => {
    el.children
      .p(el => {
        el.children.textNode((get) => `Clicks: ${get(clickCount)}`)
      })
      .button(el => {
        el.config.on("click", () => update(clickCount, (current) => current + 1))
        el.children.textNode("Count!")
      })
  })
)

renderToDOM(new Store(), document.getElementById("app")!, counter())
```

See more examples [here](https://github.com/brian-watkins/spheres/tree/main/examples).

## API

`@spheres/view` provides a Typescript API to build views composed
of HTML or SVG elements.

### Building Views

In `@spheres/view`, views are *functions*. Think of these functions
as *templates* that are used to generate HTML as necessary when a view is
rendered -- either to the DOM in a web browser or to a string when rendered
on the server.

In general, views are created by calling functions on an `HTMLBuilder` or
`SVGBuilder` to build up a view. 

```
type HTMLView = (root: HTMLBuilder) => void
type SVGView = (root: SVGBuilder) => void
```

Both `HTMLBuilder` and `SVGBuilder` expose functions named for HTML or SVG
elements, respectively. Each element function takes a configuration function
that has one argument, `ConfigurableElement`. A `ConfigurableElement` exposes
two properties `config` and `children` which allow for setting the attributes
of the element and its child elements. Chain attributes to add more. To build
child elements, chain calls to the appropriate element function and follow
the same procedure for each, passing in to the element function a configuration
function.

View functions can be used in two ways to build a template. Let's consider an
example to show how this works. Suppose we'd like to build a view that displays
a list of items. 

First let's build a view template to display an item. We will use
`htmlTemplate` to generate a function that can be called to produce
the item view. We'll specify that this template function should take
one argument, which is the `Item` itself.

```
const itemView = htmlTemplate((withArgs: WithArgs<Item>) => {
  return (root: HTMLBuilder) => {
    root.div(el => {
      el.config
        .class("bg-red-500")
      el.children
        .textNode(withArgs(item => item.name))
    })
  }
})
```

Note that the argument passed to `htmlTemplate` is a function that has
an optional argument of type `WithArgs<T>` where `T` is some type that
characterizes the arguments required to build the view. The `withArgs`
value is itself a function that wraps reactive queries passed to stateful
attributes or text nodes. This allows you to use the arguments when defining
the queries that produce the values for attributes or text nodes.
 
The value of `itemView` is a function that we can call with the expected
arguments, to produce an `HTMLTemplateView` (or `SVGTemplateView`), which
can be rendered via the `zone` function.

Now let's create the view for the list of items. Note that, in this case,
the *structure* of the view depends on state, namely, the list of items to
display. We cannot use an `htmlTemplate` in this case because that produces
views that have a static structure with attribute values or text that depend
on state. Here, we'll write a function that generates an `HTMLView` based
on state:

```
const myItems = container<Array<Item>>({ initialValue: [] })

function listView(get: GetState): HTMLView {
  const items = get(myItems)

  return (root: HTMLBuilder) => {
    root.ul(el => {
      for (const item of items) {
        el.children.li(el => {
          el.children
            .zone(itemView(item))
        })
      }
    })
  }
}
```

Each time the `myItems` state token comes to reference a new value, this
function will be executed to generate a view and the existing view will be
patched accordingly. Note that we are calling our `itemView` template function
with each item and adding the result to our list view via the `zone` function.

Now we have a view that will automatically re-render as the list of items
referenced by the `myItems` state token changes. We render this in a browser
like so:

```
const root = document.getElementById("my-app")
renderToDom(new Store(), root, listView)
```

Notice that we provided a reference to a store to the `renderToDOM` function.
This `Store` holds the values referenced by state tokens used within the
view to be rendered. When events occur, any messages that are dispatched will
be processed by this particular `Store`. It's possible to have multiple
`Stores` associated with different views within the same application, if it
makes sense to do so.


### Special Element Functions

Builder functions (either `HTMLBuilder`, `SVGBuilder`, or the
`children` property of some ConfigurableElement), expose functions for
creating elements of a specific type (like `a`, `p`, `div`, etc). In addition,
there are a few special functions to note.

#### element

Use the `element` function to create an element with an arbitrary tag name,
useful for working with custom elements.

```
(root: HTMLBuilder) =>
  root.element("my-cool-element", ({ config, children }) => {
    ...
  })
```

#### textNode

To add text call the `textNode` function

```
(root: HTMLBuilder) =>
  root.p(el => {
    el.children.textNode("My paragraph!")
  })
```

A textNode may take a string value or a `Stateful<string>`, which is a function
based on state that produces a string: `(get: GetState) => string | undefined`.
For example:

```
const content = container({ initialValue: "hello!" })

(root: HTMLBuilder) =>
  root.p(({ config, children }) => {
    children.textNode((get) => get(content))
  })
```

Here, the `p` element's text content -- and only the text content -- will
update whenever the `content` state token comes to represent a new value.

#### zone

Use the `zone` function to compose View-generating functions into more
complicated structures. For rendering purposes, a Zone is an autonomous
area that is treated like an opaque block. Any patching based on state
updates occurs inside the Zone; from the perspective of the parent element,
a zone is just a block of HTML that can be added, deleted, or rearranged
with respect to other content. If the parent element needs to reorder
zone elements, a key must be provided when defining the zones -- otherwise
the renderer will not be able to distinguish these elements.

`zone` can take a function that produces a view based on state:
```
(get: GetState) => HTMLView
(get: GetState) => SVGView
```
where `GetState` is a function of the type `(state: State<T, M>) => T`
that provides a way to get values from `@spheres/store` State Tokens.

Alternatively, `zone` takes the result of calling a template function
generated via `htmlTemplate` or `svgTemplate`.

In either case, whenever the referenced state tokens come to represent
a new value, the view will update and the DOM will be patched accordingly.

The `zone` function circumscribes an area of the DOM needed for patching
based on state updates, so that only those parts of the view that should
be updated will be updated.


### Stateful Attributes

All attribute functions may take either a value `T` (usually a string)
or a `Stateful<T>` value:

```
type Stateful<T> = (get: GetState) => T | undefined
```

which is just a function based on state that produces a value. For example,
to change the class of an element based on some state:

```
(root: HTMLBuilder) =>
  root.div({ config } => {
    config
      .class((get) => get(isError) ? "error-class" : "ok-class")
  })
```

Once this View is rendered, the class attribute -- and only the class
attribute -- will be updated whenever the `isError` state token comes to
represent a new value.


### Special Attribute Functions

When configuring an element, the `config` property contains functions
for defining all the possible attributes that belong to that element. In
addition, there are a few more functions available through the `config`
property to note.

#### attribute

Create an arbitrary attribute by providing a name and string or `Stateful<string>`
value to the `attribute` function.

```
(root: HTMLBuilder) =>
  root.div({ config } => {
    config
      .attribute("my-attr", "my-value")
  })

// Generates
//
// <div my-attr="my-value">
```

#### dataAttribute

Provide a data attribute with the `dataAttribute` function. The value may be
a `Stateful<string>`.

```
(root: HTMLBuilder) =>
  root.div({ config } => {
    config
      .dataAttribute("sports", "bowling")
  })

// Generates
//
// <div data-sports="bowling"></div>
```

#### innerHTML

Provide an HTML string or `Stateful<string>` to be set as the content of this
element. Any children set on the element will be ignored.

#### aria

Provide an aria attribute and value or `Stateful<string>` via the `aria` function.

```
(root: HTMLBuilder) =>
  root.div(({ config }) => {
    config
      .aria("hidden", "true")
  })

// Generates
//
// <div aria-hidden="true"></div>
```

#### on

To add an event handler to an element, use the `on` function and provide
the appropriate event type. The event handler function must return a `StoreMessage`
that will be automatically dispatched to the Store associated with this view (as
set when invoking `renderToDOM` or `renderToString`).

```
(root: HTMLBuilder) =>
  root.button(({ config }) => {
    config
      .on("click", () => write(myContainer, "some text"))
  })
```

### Rendering Views

To render a view in a web browser, use `renderToDOM`. Specify the
`Store` that will manage state token values and process any messages dispatched
as a result of events. Then specify an element in the DOM to replace with
the rendered view. Finally, specify a view function or template view. `renderToDOM`
returns a `RenderResult` that provides a reference to the root node and a function
to call to unmount the view.

```
interface RenderResult {
  root: Node
  unmount: () => void
}

function renderToDOM(store: Store, element: Element, view: HTMLDisplay): RenderResult
```

To render a view to a string, call `renderToString`. Specify a `Store` to
use and a view to render. The function will return an HTML string.

```
function renderToString(store: Store, view: HTMLDisplay): string
```