# View Templates

There is a view that VirtualDom is not the best approach for
programmatically rendering updates to HTML. In spheres we use
virtual dom sparingly, mainly in 'stateful zones' that can change
the HTML structure depending on the state. For other parts of the
HTML view we use virtual dom only on the first render -- any
subsequent updates based on state changes occur through effects that
'surgically' update particular attributes, properties, or text.
Nevertheless, this means that we are generating a virtual node and
using DOM methods to programmatically generate all the HTML elements
required to render that node.

There is an alternative approach to rendering the DOM. Generally, there
are two parts to this alternative technique:
1. Use a template literal to write HTML (that is to be rendered) and
put any parts that depend on state into functions called as part of the
template literal.
2. Once you've rendered the HTML in the template into DOM elements once,
subsequent renders of the same template are done 'all at once' via `cloneNode`
of this original DOM element tree.

We will not use template literals ... it's just not an acceptable developer
experience to write HTML strings. But why does this approach use template
literals? It turns out that JS template literals have an important property:
Each time a template is generated, if the *text* of the template is the same
then the array of strings that is passed to the template literal function
will be *the very same object*. This makes it very easy to identify an existng
DOM structure that should be associated with the template -- just use a map
from the array of strings to the DOM structure and, if it exists, clone it
to get the nodes to insert.

Generating the DOM nodes this way also requires one more step. If there are
any event handlers or, in our case, stateful attributes or properties or
text nodes, then these must be 'attached' one by one to the newly cloned
nodes. In other words, `cloneNode` merely clones the elements and it does not
clone any event handlers that were added programmatically to the nodes.

So to generalize this approach, there are three steps:
1. Identify the element tree to be rendered (template literals allow you to
use the array of strings from the template, but there could be other ways)
2. If there is a DOM element tree associated then clone the nodes, otherwise
build the DOM element tree programmatically and store it for later use.
3. Attach any event handlers and stateful attributes, properties, or text nodes.

Finally, you can insert that new DOM element tree into the document.

After some exploration it turns out that we can use a variation of this
approach. And it really does perform better, expecially (only?) in those
cases where a DOM element tree is being repeatedly added to the view -- for
example when a list of items is displayed.

### The Implementation

We've decided that we will not use JS template literals to describe the
HTML elements to insert into the view, due to what seems to be a bad
developer experience. Instead, we want to keep our JS based API that
uses configuration functions and particular JS statements to characterize
the element to be displayed.

If all state is represented by state tokens, then it's trivial to just
generate some virtual node, convert that to DOM elements, and clone that any time
we want to render it. However, what often happens is that when rendering
repeated elements, it's necessary to provide some state that indicates
something distinctive about *this* element that distinguishes it from other
instances. In displaying a list, one might have an array of objects with some
data that should be passed to each element instance. This causes a problem
for our approach. Any data that needs to be incorporated into an element will
need to be referenced by one of the configuration functions. But then that
means that we need to run these functions to capture the data each time we
want to render the element. This ends up destroying the performance benefits
since we are literally recreating the virtual node for each template instance
and then having to extract the functions the describe stateful aspects and
apply them to the cloned DOM nodes. Furthermore, if we just allow raw data
to be passed to our element configuration functions, there's nothing that
stops the developer from writing code that alters the structure of the DOM.
But if that happens, then we cannot simply clone nodes that were previously
associated with this function. And we cannot *know* that the structure of the
DOM has been altered unless we compare the generated virtual node with the
old one. We don't have recourse in this case to the magic of template literals
which solve this problem by generating the *very same object* for the array
of strings.

So, what we need is to be able to construct the full virtual node only once
and reuse it with different data whenever it needs to be rendered. AND we must
be certain that no further data could actually result in a virtual node that
would be *structurally* different from the one originally generated -- so that
`cloneNode` can be used with confidence.

To accomplish this, we had to shift our API so that we think of what we're doing
as defining *templates* rather than elements. What this means in practice
is that when a template requires data, we will wrap any functions that use
that data (say, a function defining a stateful attribute or text node) in
a function we pass in that identifies this function as one that can use
data. This function that we pass in has a signature that allows it to only
be used in the places -- like stateful attributes, properties, text nodes, and
event handlers -- where updates can occur without altering the structure of the
DOM element tree.

So, now, defining a view looks something like this:

```
export default htmlTemplate((withProps: WithProps<MyState>) => root => {
  root.div(div => {
    div.children
      .h1(h1 => h1.children.textNode(withProps(props => props.label)))
  })
})
```

And this `htmlTemplate` function itself produces a function that takes
`MyState` as its argument. So we generate instances of the template like so:

```
root.div(el => {
  el.children
    .zone(myTemplate(myState))
})
```

This seems like an acceptable API. Views can be exported from a module where they
are defined and have any local state etc. And then we just use those views like
functions, passing in any state as needed.

This approach results in substantial performance gains when rendering the same
template many times. For creating 10k rows in the js-framework-benchmark the
time went from ~479ms to ~416ms.

### Simplifying the API

We still need the capability to generate views that depend on state for their
structure. So we still have the notion of a 'stateful zone' and this is just a
function that takes a `GetState` function and returns an html or svg view.

But then we have two other types of views that have a static structure but
potentially stateful attributes, properties, and text: those that are clearly templates,
which are used in multiple places and take data to distinguish one instance
from the others, and those that do not take any data, either because they are
just one-off views, separated into a function for readability, or views that
are repeated without any change in properties.

We did not want to create two ways to produce these two kinds of views. If we
did, then we forced the user to decide when to use a template and when to
use just a 'static' view. It felt better to simplify the API.

So, we decided to have all non-stateful views be templates. It's just that some
of those templates do not accept data and so do not need the `WithProps` function
in their definition. Each view created in this way is still a function that
is called -- with or without data -- when inserting this view into a larger view.

In general, we have stateful views and templates, and those are the possibilties
when it comes to defining some reusable part of a view.

### Caveats

`WithProps` is maybe not the best name for the function that allows access to
data but we wanted a way to distinguish this from state tokens. It's also
not so great in general I guess that there are two notions of 'state' -- state
tokens which are accessed via the `GetState` function and are reactive (in
most cases) and 'props' which are just static data passed into a template function
and available to use for configuring a template instance.

We haven't noticed any performance or memory problems from treating all views
(except those that are stateful) as templates. But potentially we could try
to optimize this to only create a template when a view is used more than once
or something.

The API also still feels a bit verbose but maybe it's ok.

