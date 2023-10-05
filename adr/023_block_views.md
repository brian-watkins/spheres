# Block Views

One reason that we've seen some good performance results is that when
a 'stateful view' is created, the system automatically 'memoizes' that
view. In other words, elements that contain that view, treat that view
as an opaque element and do not attempt to render it, after it's been
first created. By 'opaque' here, I mean that parent elements do not see
beyond this element to it's children; child elements are managed completely
by the stateful element itself. The only exception is that stateful
elements can have a `key` by which parent elements can reorder those stateful
elements efficiently.

In ordinary cases (ie when not dealing with a list of stateful elements), what
happens is that the parent element is (usually) static and never needs to
be re-rendered. The stateful element, once it is created, can manage its own
structure completely independently of its parent. This automatic memoization
kind of draws a nice boundary around parts of the display that need to change
based on state, and those parts of the display that are rendered only once
because they are static.

This technique is similar to what is known as 'block dom.' In that case, I think,
the approach says that we think of the user interface as composed of 'blocks'
instead of individual dom elements. These blocks are higher-level combinarions
of individual dom elements that tend to get rendered together. In certain cases,
this can lead to large gains in rendering speed and efficiency, especially when
simply reordering blocks, since the renderer need only deal with the high-level
combination, and doesn't need to concern itself with rendering or patching
anything inside each block.

We get 'blocks' for free when dealing with a stateful view. But now that the
system can patch text or attributes specifically, it can be useful to extend
the 'automatic memoization' to /every/ view.

### Decision

Any time that a programmer uses the `andThen` function to add a child 'view' via
some function they write -- whether this function produces a stateful view in
the general sense, or a view that has stateful attributes or text, or even no
state at all -- the system will treat the generated view as a 'block' for the
purposes of rendering. This doesn't introduce much overhead at all, and in cases
where it matters, the rendering will automaticlly be more performant and efficient.

What's happening is that the renderer is able to achieve good performance by
combining several different approaches:

1. The renderer assumes that when the programmer creates a separate function to
produce a view, the view should be treated as a 'block' for rendering purposes.
2. The renderer uses a virtual dom to patch a block when
the /structure/ of that block depends on state. This is quite efficient since
the patching algorithm is applied only to that block (and not the entire display).
3. In cases where only attribute values or text content depends on state (and not
dom structure), the renderer can apply surgical updates just to those attributes
or text nodes as state changes, without needing to patch the block containing the
affected nodes.

