# Container Update Function

Back in [ADR 16](./016_query_and_selection.md) we outlined two use cases
that seemed difficult to model and which lead us to introduce 'queries'
or 'constraints' on containers and reducer functions on derived state.

In [ADR 28](./028_derived_state.md) we explained why we decided to remove
reducer functions from derived state. In this ADR, we are reconsidering
the need for 'constraints' on containers.

The original problem was something like this: Suppose that you have a
text input field (for entering notes). You want a `Container<string>` to
store the text as it's input and then when a button is clicked, we take
that content and write some object to another container that stores
the saved notes -- a `Container<Array<Note>>`. This container can have
write hooks that persist the notes in storage somehow. The behavior we want
to model is that once a new note is successfully added to the container
(ie once its storage hooks complete successfully) then we want to clear
the text input field, ie set the `Container<string>` to the empty string.

We were able to model this with constraints by specifying a reactive query
on the Meta state of the `Container<Array<Note>>`. That query would set some
wrapper object around the text content to indicate whether the note content
was being stored, failed to store, or was successfully stored. Based on these
values the container could decide to reset itself -- if it tracked that the
note was 'being saved' and then 'was saved'.

This works but feels kind of awkward. It adds some complexity to what should
be a dead simple container. And the rules it enforces would more naturally
be enforced in other ways. For example, a reactive attribute could disable
the text input field when the `Container<Array<Note>>` Meta state is `pending`.

It also turns out that it's kind of difficult to implement these kinds of
reactive container queries. And we suspect that the way we were able to do
it would cause a memory leak because the container controller would need to
have a strong reference to the container token so that it could fetch the
'top-most' version of this container (supposing that storage hooks had been
applied to it). Perhaps this could be worked around in some way, but in any
case the implementation was somewhat messy.

So for these two reasons -- awkward dev ex, awkward implementation -- we
considered whether there was another approach to solving this problem.

### Another Approach

In general, the problem comes down to wanting to dispatch a message to the
store in response to some container being updated. If we could do that, then
whenever the `Container<Array<Note>>` is updated (which only happens if the
storage hooks succeed) then we should just dispatch a `reset` message for the
`Container<string>`. This feels like a simpler and more natural way to model
the relationship between these two pieces of state.

And we can implement this by revising the `reducer` function that a container
can have. Currently, this function would simply translate some message into
a value of the type stored by the container. But, following the example of
Elm's 'update' function, we could have this reducer return both a value and
an optional message to dispatch to the store.

### Modeling Constraint behavior

But what about the general use case suggested by the idea of a *constraint*
on a container. It seems like there would be cases where we would want to
write some value to a container but have the actual value be determined in
part by other pieces of state -- eg constraining a number between two
endpoints determined by some other state.

We can model this already with the use of a `rule`. Instead of writing directly
to the container, we apply the rule to the value and it constrains that value
and then writes it to the container.

But what if the constraining values change ... we would want the value in the
container to remain constrained accordingly. To model this, we would use
derived state. So, instead of subscribing to the container directly, anything
that needed the constrained value would subscribe to the derived state that
would apply the constraint. Indeed, one could simply use derived state and not
worry about writing to the container via a rule, since the value used would always
be constrained by the derived state.

The lesson here is that we can model constraints on a value via derived state.

### Decision

We will change the `reducer` function on a container to an `update` function that
takes a message and the current value and then returns a value and optionally
a message that will be dispatched to the store, after subscribers are notified of
any change in value.

### Consequences

It seems like this change potentially opens up a powerful capability for
modelling application logic.

In a way, what we've done is enabled a simplified message-passing based
object-oriented paradigm for modeling state and application logic. It's simplified
in the sense that there's no inheritance or anything like that, just
containers that can hold state and logic and communicate with each other via
messages. We can send messages of whatever type to containers. These containers
can contain state. And based on the message we can update that state and optionally
dispatch other messages to other containers. Any stateless calculations are modelled
as derived state. And state provided from the outside world is modeled as Supplied
State.

This was much easier to implement than the reactive constraint on a container.
We need to watch to make sure there are no bad impacts on memory usage or anything
but I think it should be fine.
