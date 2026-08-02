# Working with DOM Elements

Sometimes it's helpful to get able to identify a particular DOM
element -- to mutate the DOM by calling methods on the element
(say, to open a popup or focus an element) or to query the DOM by
calling methods (like getting the element's bounding rect).

Most of the time (probably all the time) it's possible to identify and
get a reference to a DOM element by leveraging `document.querySelector`.
But sometimes this isn't the easiest path. For example, if you have a
view-producing function (for example, from a component library) and
that view needs to operate on a DOM element that it renders somehow,
it can be annoying to have to come up with some sort of unique
identifier to pass into the element so that it can be used to query
that element.

React has a way of solving this kind of problem via `refs`. Spheres
will solve it by introducing the idea of an `ElementIdentifier`.

The `ElementIdentifier` allows for creating a kind of state token
that carries type information about the exact DOM element it will
reference (eg, `HTMLInputElement`). An `ElementIdentifier` differs
from other state tokens because its value is not accessible at the
layer of application logic. We should think of it more as a handle
to an item managed by the *storage system*, which in this case is the
DOM. We can associate that handle with an element defined by a
view and we can pass that handle to a command, but that's about all
we can do with the handle at the layer of view/application logic.

Because the DOM is a *storage system*, we interact with it in Spheres
primarily through commands (and the associated command manager). So,
if we want to do anything with a DOM element, we have to do a few things:

1. Create an `ElementIdentifier` with the correct type and associate
it with an element defined by a view.
2. Send a command whose message contains any relevant `ElementIdentifiers`
3. In the associated command manager, resolve the `ElementIdentifier`
to a DOM element and then take whatever action is necessary, potentially
including dispatching messages back to the store or supplying state
that application/view logic can respond to.

Operating at the level of command managers is good. It separates DOM
concerns from application/view logic. And it allows us to do async
operations if necessary (which is not possible in application/view logic).
For example, a library like floating-ui has core functions that return
Promises, which we could not use from typical view/application logic
state update mechanisms like an event handler or `run` message.

One other decision we've made is to throw an error if an `ElementIdentifier`
is resolved to an element that does not exist.
The alternative would be to allow an `ElementIdentifier` to resolve to
`undefined` or `null`. But this means that every access of an `ElementIdentifier`
would need to resolve that conditional. But since we cannot subscribe to
`ElementIdentifier` at the application layer, we should just treat it as
something that has been declared to be associated with an element in a view
and so should only be used once that view has been rendered. It's not meant
to be a way for the application layer to track whether particular view elements
have been connected to the DOM.

In general, we're trying to follow a pattern here where the application only
depends on application state and not any details about element rendering.
Another way to think of this is just that rendering is itself *always* a function
of application state and for that reason we should not attempt to write
application logic that depends on when an element is rendered or connected
to the DOM ... it should just depend on whatever application state would cause
that rendering to happen.

### Caveat

We are trying our best *not* to add things like an `onMount` or `onConnect`
or `onCleanup` or `onUnmount` -- rendering effects that fire when an element
is connected to or removed from the DOM. Rendering is a detail of the framework;
Application logic determines when views are displayed.

If we need to run some javascript when an element is removed from (or even added to)
it is possible to build a CommandManager with DOM actions that tracks elements and
determines when they have been removed from the DOM (through a MutationObserver) and
performs effects or supplies state to the application layer; this works fine.
We can reference rendering details at the storage system layer if we need to since
the DOM just is a kind of *storage system*, we just want to avoid this at the
application layer. We can use commands to interact with the storage system in these
cases if we need to.

It could be the case that there are use cases that will push us to revise this
decision, but the existence of frameworks like Elm, which do not have rendering
effects as far as I can tell, seems to suggest that it is very possible to write
whatever application one might need without adding these kinds of things to the
framework.