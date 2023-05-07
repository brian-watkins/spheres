# Meta State

Part of the goal of the way we track state is to distinguish the graph
of state depenedencies from details about how that state is stored (or
fetched or whatever). We did that by distinguishing Providers and Writers
which define how state is stored, separately from the definition of the
state itself and any dependencies it might have. In this way, the state
graph is synchronous, but storage can often be async. So, we still need
some way to allow subscribers to know some information *about* the value
referenced by some particular state token. We will use the Meta state to
track this information.

The Meta state is another State token that can be accessed via the
`.meta` property on any State token. The Meta state always holds Meta
values, which indicate whether the value of some state toke is ok, whether
that value is pending an update, or whether some update to that value
failed. The State token continues to hold whatever value it has, while
its Meta state holds information about the process of storing an update
to that value.

Meta states are used primarily in `Providers` and `Writers` to indicate
that updates are occurring. Subscribers to meta states can show loading
indicators or error messages or whatever in response to changes in the
Meta state value.

The nice thing about the Meta state is that it provides a common way to
describe possibilities around storing state. Programmers don't need to
worry about defining these types themselves or defining extra containers
to hold them. In short, rather than building something like React suspense,
which automatically does one thing while some async process is in flight,
Meta states allow us to model this information within the state graph and
subscribers can receive updates in order to do whatever they need in response.

The Meta state is connected to its State token via the M type. So, the Meta
state must reference messages of the same type as the State token it's
associated with. Furthermore, whenever the value of the State token is
updated and published to dependents and subscribers, the value of it's
associated Meta token will change to `OK`. Otherwise, there's no connection
between the value of the State token and the value of its Meta token -- the
Meta token simply provides some extra information about the storage
process of the state token for any subscribers who might be interested.

### An Alternative Approach

State tokens have two types associated with them: a type for the value and
an optional type for reducer messages that, when fed to a reducer function,
produce a new value. One alternative approach for the Meta state would be
to store more information about the current, Ok, state of the token. But then
the Meta value might need to store either the current value, or the last
successful reducer message, or both.

Furthermore, one could set things up so that if one were to write an Ok
message to the meta state then this would signal that the value of its
associated state should change accordingly. But then, one would need to
pass a reducer message (or a value) on to the state token. This becomes
problematic when considering the initial value of the Meta state. If we
were to go this route, we might need to require all states with reducers
to have an initial reducer message rather than an initial state value, so
that the initial value of the meta state could be that initial reducer
message.

Finally, if any other updates were to occur on the state token, then the
Ok value of its Meta state would need to be updated as well.

In any case, this approach seems to be more complicated and doesn't seem
to provider much additional value over the simpler approach described
above. So, we will stick with the simpler approach.

### Caveats

One kind of weird thing is that we could potentially write an `Ok` value
to a meta state. That would have no affect on anything, but it feels kind
of bad. I guess you could conceivable want to attach a Writer to a Meta
state, like if you wanted to persist any errors somehow or something. Maybe
it's ok that it's possible to explicitly set the value to Ok, it just
seems weird.