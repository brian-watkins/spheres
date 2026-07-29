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

Because the DOM is a *storage system* we interact with it in Spheres
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
is resolved to an element that does not exist ... is this a good idea?
The alternative would be to allow an `ElementIdentifier` to resolve to
`undefined` or `null`. But this means that every access of an `ElementIdentifier`
would need to resolve that conditional. I'd rather think of this case
as an error (that throws) because each `ElementIdentifier` really needs
to be associated with some element from a view if it is to be meaningful
at all. This is because we can't really subscribe to the `ElementIdentifier`
and be notified if its value changes. So we just have to treat it
as a real identifier of a real element.

The one thing that might mess this up is if we were to write a command
manager that tracked when DOM elements were disconnected from the DOM.
In that case, we'd have to send a command with an `ElementIdentifier`.
And each time the DOM mutates, we would run through the list of elements
and check if they are still connected. If not, then we would run a
handler passed in with the original command or otherwise supply some
state that indicates this fact. But then you've got an `ElementIdentifier`
that is still resolving to a DOM element ... it's just not connected
to the DOM.

In that case we could allow some mechanism to 'clear' the `ElementIdentifier`
so that it does not hold a reference to an element we no longer care about
and leak memory. If the application/view logic were to associate the
identifier with a different element, this would happen naturally. Or if
the `ElementIdentifier` goes out of scope, this would happen as well (since
an `ElementIdentifier` is just supplied state under the hood). But otherwise
if we allowed 'clearing' a reference then it would be the case that any
attempt to resolve that reference would result in an error.

But note that if we have a list item that defined its own `ElementIdentifier`
and then used a command to register a teardown hook for it. The identifier
would go out of scope, the supplied state it contains would go out of scope
and the publisher and the value (the element) it holds. We might not have
time to check the connected state of the element and call a handler before
the element is garbage collected? And the mutation records might not even
reference the element, only its parent/ancestor? (Although maybe that would
be sufficient). 

Maybe we should try to write a DOMConnectionManager or something to see
if this would actually work ...
- that would allow us to tell a story about how we could do per-element
cleanup if necessary ... which claude keeps pushing us to do ...
- Actually I think it would work because the DomConnectionManager would
need to hold a strong reference to the supplied state token. So it would
not go out of scope until that is removed ... and then we could just
stop tracking that supplied state if the element is no longer connected
and it would be up to the view layer as to whether that element identifier
is still in scope.


Someone might try to use the very same identifier for different elements
in multiple matching subviews. This would work, I think, since only one
of those subviews can be rendered at a time, and the element identifier would
be associated with the correct DOM element during the rendering process.




The one thing claude keeps pushing on is some kind of way to do
teardown of resources when an element is removed from the dom. We
don't do that really yet. But I think we could -- we would want to
do a MutationObserver and then when anything changes go through 
given identifiers and see if the connected state has changed. If so,
run a handler. 