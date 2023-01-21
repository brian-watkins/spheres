# Declarative View Functions

One great thing that all these frontend frameworks agree on is declarative views.
This means that views are basically described as a function of state and then
the runtime takes care of ensuring that as the state changes, the actual UI
shows what the view function says it should. This is generally done by some
kind of virtual dom implementation, although there are other approaches (like
with Svelte).

We will follow this pattern. Where we hope to improve is by building a view
layer that acknowledges the fact that it depends on application state in a deep
way. In particular, we will think of the view as composed of elements that
are themselves treated as *derived state*, dependent on other derived or
essential state and updating as that state changes. The main view function should
stitch these views together. In short, unlike with some approaches like Elm, we
aren't generating a single hierarchy for the view. We have indepedent elements
and then a view function that shows how they are laid out together on the page.

In some ways this is similar to the idea of 'components' that react and vue
utilize. However, a component suggests something with a lifecycle and
usually internal state. We would rather think of these view elements as derived state,
defined by independent functions that show how to compute a piece of virtual dom
from other application state. In addition, there are some parts of the view that
are *not* dependent on application state and so are always static. We think of
this part of the view as the 'wrapper' or the 'layout' for the elements of the
view that do change with application state.

### Implementation

We will use a virtual dom to make changes to the view. In particular, we will use
[Snabbdom](https://github.com/snabbdom/snabbdom) as our core virtual dom
implementation. Snabbdom seems to be under active development and is known to
be a very good virtual dom implementation with a lot of history.

For particular view elements -- the parts of the view that are derived state -- we
will set up things so that they are able to patch themselves using Snabbdom's
virtual dom diffing algorithm. In short, rather than having one view that is calculated
on any state changing and one patch process that reconciles the dom, each view
element will be in charge of patching itself on changes to state that it depends
upon.

It's not clear that this is a recommended way to use Snabbdom, but we've been able
to make it work. The key is to wrap each view element in a custom element (call it
`<view-element />`) and when Snabbdom decides to insert this element into the view,
it will use it as the root node for the patch process and use a provided function
to calculate the virtual dom that should be patched in at this point. The result is
that the `<view-element />` tag will be removed from the actual dom and replaced
with the computed virtual dom. However, the `<view-element />` will *remain* in the
virtual dom from Snabbdom's perspective. Since this element won't have any tags
or attributes and doesn't share the fact that it has children, in subsequent patches
involving this node, Snabbdom will think it hasn't changed and so just leave it
alone. This is what we want, since that part of the virtual dom 'owned' by this
element is able to patch itself. In this way, we can nest `<view-element />` with
no problem and they will each update only when the state they depend upon changes.

### Caveats

This does seem to work so far although we have not run any tests to understand
whether it improves performance. It seems intuitively good that the view will only
update those parts that need to change. However, it may be inefficient if many
elements of the view depend on the same piece of state. In that case, many distinct
patches will run instead of one patch. But again, the performance implications of
this are not yet well known.