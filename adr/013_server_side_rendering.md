# Server-Side Rendering

So far we've been treating esdisplay as basically a framework that
generates html based on state updates *on the client side*. But there
are many situations in which it's helpful to generate html based on
state *on the server side* and then deliver it to the client. 

There's a few things that happen to fully render an HTML page with
esdisplay on the client. First, the HTML loads. This HTML has a link
to the JS bundle. Then the JS bundle loads, and is evaluated. In many
cases this will then kick off a subsequent request to fetch some data
from the server. Once that comes back then the view can render. There
are some optimizations that could occur (showing a waiting indicator
while the data loads for instance), but basically that's the idea.

So, if we can do some or all of this work on the server-side, then
the client would need to so less work and the page would presumably
render more quickly. There's always a tradeoff though, as work done on
the server may make the server-processing time longer, offseting any
gains.

Given this, there are a few use cases one could consider.

#### 1. Generate any data on the server and include it in the HTML

The simplest approach would be to keep all rendering on the client, but
have the server fetch any data needed to render the page and include that
(within a script tag) in the HTML that is provided to the client. That
way, the client still needs to load the JS bundle (but this would be
cached and wouldn't change each time), but it doesn't need to make any
request to fetch the data. Within the world of esdisplay, we would just
use a `Provider` to take the data from the script tag and set it on the
appropriate containers. The original HTML page could have a static loading
indicator as a placeholder while the JS loads and is evaluated.

The downside of this approach is that you may be sending across some JS that
is not necessary. For example, if some data is necessary to render the page
but will not actually ever be updated on the client. Also, there's still a
gap in rendering while the javascript is processed and the dom is created
programmatically.

#### 2. Generate HTML on the server; rehydrate the view on the client

One could also generate HTML on the server side, determined by some data that
is loaded on the server. For this, esdisplay would need to translate virtual
dom elements to HTML strings. We can do this easily by using the
`snabbdom-to-html` library.

This works great for content that might be personalized but itself has no
dynamic content -- just normal links or whatever. But if we need to have
some or all of the page be interactive, then more will need to be done.

The simplest approach here is just to 'rehydrate' the HTML. This means basically
that one would generate the dom *again* on the client side using esdisplay and
patch over the HTML that had been generated on the server. This can be
totally fine and not noticeable, since the patched dom should look identical
to the server-rendered dom. To achieve that it's often necessary to render on
the server but also pass any data/state as part of the rendered html page so
that when the HTML is hydrated it can use that same data that was used on the
server originally.

People worry here about the time that it takes before rehydration is complete.
During that time, the interface *looks* like it's interactive but it's actually
not. I suppose that on a slow connection, this gap could be noticeable, but
probably still only on a first-time load, since presumably the JS would be
cached.

Nevertheless, it's still true that the browser page will render much faster
now since nothing will need to be fetched by the client to achieve that -- just
the HTML.

The downside is that, again, one might seem to be requesting more data than is
absolutely necessary to render the page and have it function. This is because
some of the page might be based on data that will not change or otherwise be
used on the client side. Think about a site that has content that is pulled
from a database, but that content is read-only on the client.

#### 3. Generate HTML on the server, hydrate islands of interactivity

In this case, the full HTML page is rendered on the server based on
whatever data is necessary. Certain areas of the HTML are marked out
as 'islands of interactivity' within the otherwise static document. Then
esdisplay rehydrates *only* these islands of interactivity.

In this case, we get the fully rendered HTML page to begin with. But then
it need only include any data that is necessary to rehydrate the islands
of interactivity. So presumably only the data and JS that's absolutely necessary
will be shipped to the client.

Here's a [description](https://www.patterns.dev/posts/islands-architecture)
of the islands architecture.

### SSR with esdisplay

We want to enable all three use cases with esdisplay.

In order to achieve this we need two main things: (1) the ability to
render `Views` to HTML strings and (2) the ability to rehydrate one or
more particular areas of the dom.

#### Rendering Views to HTML

To accomplish this we simply need a function that can take Snabbdom
`VNode` objects and generate HTML strings. The `snabbdom-to-html` library
does this for us (it's very simple but probably still better to use that
than to maintain our own).

There are a few ways one could set this up. Vite provides some
[instructions](https://vitejs.dev/guide/ssr.html#server-side-rendering)
for doing this. Basically the idea is to create some file that fetches
any data and initializes any `Providers` and then pulls in the `View`
as a whole and passes it to a `render` function that generates HTML. 

One thing to be careful of though is the reference to the loop. Since the
loop is a global variable, if any bundling occurs then it will bundle
the loop with it. Let's say that we have an application that bundles the
view code and then this bundle is loaded by some server that then calls
`render` on it. If the `render` function itself makes any reference to the
loop then it could potentially be *another loop* besides the one referenced
in the bundled code. This is weird, but we've tried to avoid this
situation by keeping all code that references the loop inside the implementation
of the `View` element. So the `render` function doesn't create any
derived state itself -- it just asks each `View` to do anything it needs to
do to generate the virtual dom tree, and then it renders it to an HTML
string.

This is a problem that comes with having a global loop variable that stores
state -- bundling can make this a little more weird.

In order to facilitate this, we added a `render` hook to the view-fragment
element that does the work of generating the vnode tree for this element.
That hook needs to be asynchronous since it's necessary to subscribe to
the view state to get the actual state. And we can't count on this process
being synchronous, since we might want to treat subscription callbacks as
microtasks at some point. Thus this means that the `render` function itself
needs to be async as well.

#### Rehydrating an island

To be able to rehydrate an island, we need some way to identify those
areas of the DOM that need to be patched (ie rehydrated). And then we
just need to patch each one.

One approach is to say that islands are those views that are imported
dynamically. Thus, the function to generate an island could take an
import like so:

```
View.island(() => import("./path/to/generator"))
```

Or something like that. This function would need to be async. And that
would make the entire view tree of which it's a part async as well.

This complicates things a bit since now the server and the client need
to somehow share the same dynamic import -- and the paths will no doubt
be different on the server than they are on the client. We could use
import maps on the client side to address this, but at that point things
are getting too complicated. The nice thing about this approach is that the
import path itself can be used as an identifier for the element in the dom,
so there's no need to come up with an additional id. Nevertheless,
this approach still feels too complicated.

Indeed, to achieve the benefits of the island architecture, it's not
necessary to dynamically import island elements. Even if all the elements
are bundled together, it's still the case that we're only loading the
JS that's absolutely necessary for the page to be interactive.

With this in mind, there is a much simpler approach.

We can use the `View.withState` function to generate a stateful element
and render it to html. So long as there is some way to identify that element
in the dom, we can then load the code for that stateful element in the
client and simply mount it at the given point in the dom.

This is a pretty nice approach. The insight here is that the 'mount' process
via the `Display` object is not really any different whether you are
mounting one view for the entire page on some empty element defined in some html
file, or whether you are mounting a view to rehydrate the entire page, or
whether you are mounting several views to rehydrate parts of the page.

And if one needs to do a dynamic import of each island element, that's
certainly possible like so:

```
const display = new Display()
import ("./path/to/element.ts").then((module) => {
  display.mount(document.getElementById("my-id")!, module.default)
})
```

### Decision

So, given the above approach, we should be able to support the three
use cases outlined at the start of this document.

What we learned is this: We don't really need to do much at all to
support server-side rendering and even things like island architecture.
All we need to do is be able to render html from a tree of virtual
`View` elements on the server, and then identify a particular area to
patch with the view on the client side, as necessary.