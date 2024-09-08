# Remove Rules

In previous ADR's like [this one](./008_rules.md), we had argued for
representing business logic in terms of 'rules'. We had introduced
an interface for this purpose and a StoreMessage called `use` for
passing rules to the store to be executed. Over time, we moved a rule
from something that produces a value for some container, to something
that produces an arbitrary StoreMessage based on state. See
[this adr](./009_rule_type_args.md) for more on the original notion of
a rule, [this adr](./016_query_and_selection.md) where we briefly changed
the name to `selection` and [this adr](./019_selection.md) where we decided
to have selections/rules return an arbitrary StoreMessage.

One of the biggest (only?) uses for rules was in writing event handlers.
In `spheres/view` an event handler must return a StoreMessage. But often
one needs to get some existing state to determine what StoreMessage to
produce. To accomplish this, one would write an event handler that
returned a `use` message referencing some `rule` that would do just that,
possibly based on some args passed to the rule at runtime.

The problem with this is that in writing event handlers, it felt too
verbose and potentially awkward to use `use(rule(get => ...))` all over
the place.

### Options

We could remove the `use` message and the `rule` concept altogether and change
event handlers so that they return either a `StoreMessage<any>` or a
`Stateful<StoreMessage<any>>`. 

We tried this option and there were some downsides. (1) Maybe a *slight*
degradation in performance. (2) There are other use cases for the `use`
message besides event handlers so in order to support these we would need to
add another method to the Store that allowed dispatching `Stateful<StoreMessage<any>>`.
(3) Some of the event handler logic in the examples became more complicate to
write. (4) Without the `use` message the update function on a container becomes
a little less powerful.

So, another option would be to leave use message around and just update the
event handlers so it could return a `Stateful<StoreMessage<any>>` which would be
wrapped in a `use` message under the covers. But to allow this would mean there
are two ways to do something, and this leads to the worry of which way is better.
We want to avoid this.

We could just remove the `rule` concept and have the `use` message take a
`Stateful<StoreMessage<any>>` directly. This seems ok. The `rule` was an interface
we introduced in case one wanted to create an object that stored some state. But
really if you are interacting with the store, it's the store that should hold state.


### Decision

To improve the ease of working with view event handlers, we will remove
the concept of a rule and just have the `use` message accept a
`Stateful<StoreMessage<any>>`. This means that when we need to get some
existing state to determine what StoreMessage to create, we can do
something like this:

```
el.config.on("click", () => use(get => get(token) + 1))
```

This feels a little easier to work with. It also means that we can return
`undefined` from an event handler to do nothing, if we need to, instead
of having programmers remember that `batch([])` will do nothing.

There is some overlap between the `use` and `update` messages, in that
`update` can be accomplished simply by using a `use` message. Nevertheless,
we will keep these both around for now, since they don't do exactly the
same thing ... and using `update` is a tiny bit faster. The alternative
would be to generalize the `write` message so that it could take a function
that uses the current value to produce the next message.