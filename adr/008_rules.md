# Rules

Often changes to application state must occur according to what's called 'business
logic'. We want to be able to represent business logic as we are modeling
application state, independently of storage mechanisms or display mechanisms.

To do this, we'll introduce the notion of a `Rule`.

In general, a rule is a function from current application state to a new value
that will be written to some container. 

So, a rule results in a write to some container, but it is not itself triggered by
a write -- we'll add a distinct message so that we can be more explicit about
what's happening. This message will be sent in response to user action (ie rules
are not reactive). That message could contain some data (probably from user input
of some kind) that also gets passed to the rule function.

The main reason to introduce rules is to allow us to distinguish between
application state dependencies that are necessary for rendering part of the display
and application state dependencies that are necessary for writing to a particular
container. Often we see that some part of the display (a `State<View>`) will need
to reactively depend on a certain piece of state just because it is used to
craft that value that will be written to a container upon some user action. But
that means if that value changes then the view will be re-rendered even though
the actual shape of that view doesn't depend on that value.

Instead, we could fetch the current value of that dependency when the user action
occurs by triggering a rule that would do that fetching for us. That way, the view
itself is no longer dependent on that value -- it just invokes the rule rather than
doing all the logic to generate the value to be written. This should simplify
the state that a particular `State<View>` needs to (reactively) depend upon.

### Implementation Options

There are several ways we could implement rules:

#### 1. Use a dispatch function

A rule could be a function that takes a `get` function and a `dispatch` function,
where the `dispatch` function sends any message to the loop. This would allow
rules to get access to any state and write to any container or trigger another rule,
and it could do so asynchronously.

This approach would seem to make rules too powerful. We want to keep the application
state representation synchronous if possible. This is better for testing but also
better for reasoning about what's going on. Most asynchronous activies have to do with
storing state or fetching state from other systems -- and these should be described
with Writers or Providers.

The one use case for asynchronous modeling of state could be for periodic updates or
deferred updates of state. While this kind of rule could accomodate that, it would
be difficult to restrict the use of rules to /only/ these kinds of cases. Perhaps
a better way to model deferred or periodic updates of data is with some kind of
Scheduler or Clock abstraction that could be accessed by sending messages to the Loop
in some way.

Because we don't want the rule function to admit of asynchronous behaviors, we won't
pass in a callback function that would allow it to (asynchronously) signal when it
is complete.

#### 2. Return a loop message

If we say that a rule must /return/ the value that is to be written, it still could
be the case that we return a LoopMessage, which would allow a rule to write to
any container, or trigger another rule.

This is really syntactic sugar for:

```
loop.dispatch(trigger(someRule, anythingElse)) -->

loop.dispatch(someRule.apply(get, anythingElse)))
```

It's difficult to think of examples where this kind of flexibility would be useful.
And allowing this kind of flexibility just makes writing a rule more verbose, since
you need to call the function to produce a writeMessage on a particular container:

```
const someRule = rule((get) => {
  return writeMessage(someContainer, someValue)
})
```


#### 3. Return a value for a container of a particular type

We could associate a rule, when we define it, with a particular container, and then
the rule could return the kind of value that container takes as part of write
messages sent to it. So a rule would be associated with a particular /type/ of
container.

This is really syntactic sugar for:

```
loop.dispatch(trigger(someRule, anythingElse)) -->

loop.dispatch(writeMessage(numberContainer, someRule.apply(get, anythingElse))))
```

In this way, someRule could be relatively re-usable supposing we wanted to
write some validation logic or something that would apply to containers of the
same type. You could do the same thing on (2) but
you'd need to create a function to generate the rule (since the state to which
the rule would write would be explicitly identified in the body of the rule itself).

But really the benefit of (3) over (2) is just the ease of use of writing the rule
function. Like so:

```
const someRule = rule(someContainer, (get) => someValue)
```

This perceived benefit is based on the assumption that when we write a rule it's because
we want to apply some logic for writing a value to /some/ container in particular (ie
not many containers or one out of some set of containers).


#### 4. A Rule is an Opaque Reference

Even if we make a rule associated with a type of container -- so it just returns a
value for that type of container. We can still consider whether the Rule object itself
should provide access to the rule.

Just as a `State` value does not itself provide access to the data it holds, we could
make a `Rule` be a *reference* that only the Loop can associate with some function (and
container).

The benefit of this is that the rule cannot be used outside the context of the loop
for anything. This is more about enforcing a certain practice though than needing
to do this for some reason. It also creates a little more complexity within the loop
because it would need to store these values somehow and look them up whenever a trigger
message was received.

Note that if we wanted to compose rules, we'd need to create separate references for the
rule functions and reference them in another rule definition:

```
const anotherRule = rule(someContainer, (get, context) => {
  aThirdFunction(get, anotherFunction(get, context))
})
```

#### 5. A Rule is an object with accessible properties

We could also make a `Rule` just be an object that conforms to an interface. That
interface would have two readonly properties: the container the rule is associated
with and the rule function itself.

This is a nicer approach from (4) for two reasons.

First, no modification of the loop
is necessary except for the code that handles the trigger message -- we wouldn't
need to store rules inside the loop.

Second, composition of rules does not require creating separate references to the
rule functions; it would be possible to reference the rules themselves:

```
const anotherRule = rule(someContainer, (get, context) => {
  return aThirdRule.apply(get, someRule.apply(get, context))
})
```

We could maybe write a `compose` function that would make it easier to compose two
rules. But I'm not sure how useful this would be in practice.


### Decision

A Rule will be associated with a particular container and defined by a function
that produces a value that will be written to any container of that type. The Rule
itself will be an object that conforms to an interface which exposes the container
it is associated with and the rule function itself.


### Caveats

Rules should be pure functions. So Rules do not allow us to represent any asynchronous
relationships among application state. For that, we probably want some kind of Scheduler
or Clock abstraction.

Right now we are assuming that the intention of a rule is to represent the business
logic associate with writing to a particular container of a certain type. So a rule
cannot represent logic around conditional writes to containers -- in other words a
rule cannot represent writing to one container under certain conditions or another
container under different conditions. We could perhaps achieve this by having those
containers be derived from some application state plus another container that a rule
does write to. But, again, we're not sure what a practical example of this would look
like.
