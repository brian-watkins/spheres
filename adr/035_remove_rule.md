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

### Decision

To improve the ease of working with view event handlers, we will allow
event handlers to return a `StoreMessage<any>` or a `Stateful<StoreMessage<any>>`.
This means that when we need to get some existing state to determine what
StoreMessage to create, we can do something like this:

```
el.config.on("click", () => get => get(token) + 1)
```

This feels easier to work with. It also means that we can return `undefined` from
an event handler to do nothing, if we need to, instead of having programmers
remember that `batch([])` will do nothing.

But once we made this change, it became clear that we no longer need the concept
of a rule, since a 'rule' is just a `Stateful<StoreMessage<any>>`. We can still
abstract these into functions as it makes sense.

We also will remove the `use` message for running rules. Instead, we will add a
new function on the store called `dispatchWith(message: Stateful<StoreMessage<any>>)`
which allows us to dispatch a Stateful StoreMessage explicitly if we need to.

We don't want to continue to have a `use` message since that would mean that
there would be two ways to do the same thing from an event handler. And we want
there to only be one way to do things, as much as possible.
