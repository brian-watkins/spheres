### Next step

Proabably want to think about how to update state next.

I think all state updates should be the result of sending a
message that describes the update (rather than updating the
state explicitly through a 'write' function on the atom). This would
allow the runtime to then determine whether the update is valid
or how to store the change etc.

This would also mean that potentiall we could forget about the
difference between 'local' and 'global' state. Local state would just
be a view element function that depends on a state root that is
defined in the same module and not exported. Then we could have a
function called `setState` or something that generates the message
that describes an update to the state (and which could be dispatched
in response to user events like clicks). Then for global state
changes, it should be that any procedure that needs to update the
state does the same thing -- namely, dispatching a message to the
runtime that describes the update to be made.

Once we have constraints we will probably need to change the state so
that IF there is a constraint, the value of the state is either an
OK-value or an ERROR-value that explains why. This is because constraint
violations might occur even if we aren't updating that state explicitly.
Like if a constraint says this needs to be 2 greater than some other value
and that value changes ... we need to be able to express that the current
value is now invalid even though nothing was changing that particular
value explicitly. Or, in the case of a user interface event, if a message
is dispatched but it violates a constraint, we have to tell the view about
the problem. The easiest way perhaps is just to change the state to show
that it is now invalid.

Perhaps we could do the same thing when storage of some state is 'pending'
for some reason -- because it is waiting on an HTTP request or something
like that. However, that might blur the boundary perhaps between the description
of the state and the implementation of how it is stored.

We still have the problem, though, of how to handle async actions -- showing
that something is in progress while we are waiting and then showing that it is
complete when the wait is over.

### The runtime

We need a better way to be able to update the state of an atom. We can't just
be able to call `write` on an atom as that could be done anywhere and we need to
restrict how state updates happen so we can apply constraints and storage hints.

What we would like to do is have a message that is sent to the runtime somehow
and then that message tells how to update the state.

For the view, we can dispatch an event and then have something (but what?) add
an event listener to the document or something. But really we need some way to
have 'feeders' and 'listeners'. Is that the Display object? The Display object
knows the mount point on the dom and so can attach an event listener there for
any messages from the view.

But if we want to restrict writing to the state then we have to follow the jotai
thing where the atom you reference is just an identifier basically, and the state
is held within some module. So the Display module would have to expose `root`
and `derive` and `setState` stuff I guess ...

But even if we did this, we'd have to have a `dispatch` method or something on
the display and *that* could be called from anywhere too. What we really want is
that you can only dispatch messages in certain situations via a procedure or
by dispatching an event or something.

Like you'd have to register a procedure that just runs immediately and then can
have a part that needs to return a message or something with the new state. But for
testing we also need an easy way to set or change the state too I think.

The weird thing too is that I only want to be able to update the state of a root.
So I guess any function that creates the message needs to only take a `Root` and not
a `State`.

Maybe for testing you register a 'provider procedure' that allows you to call a function to
update some state. But the thing about procedures is that you have to provide them
all when you create the Display. So you can't just add one during a view function or
something.

Something like:

const atom = root("blah")
const [provider, provide] = createProviderProcedure(atom)
const display = new Display({
  procedures: [
    provider
  ]
})

then you could call provide("blah")

But if that's for testing, couldn't someone use that in a real app too to
do bad things? But there is a legitimate use for something like this I think,
like if you wanted to print the time every second. You could do setTimeout and
then call provide in the callback.

Really we would want to test the display using something like playwright to
trigger dom events and that's all we'd care about. BUT there could be other
ways besides the view to trigger updates -- like if we are listening for
messages on a websocket or want to listen for location updates.

Maybe we need `deriveView` which is a function that gives you both a `get`
and a `set` function and must return a `View`. And then there's a procedure
builder called `update` they gives you a `get` and a `set` function and
you have to return the value of calling `set`? And `set` always only takes
a root as it's first argument and then the value to update it with.

Could start a procedure like:

provide((dispatch) => {
  setTimeout(dispatch(update(atom, "blah")), 1000)
})

This is getting kind of much though ...

### What I'd like to do

You create a Display and that represents the view of the app, basically.
You could have multiple displays. 

What I want also is to have functions that create state atoms for the root
and the derived state. Do these atoms need to be registered with a particular
display? or could they just be free floating? Do they need to be connected
somehow?

Maybe you can create an atom on its own. But it doesn't do anything until
it's referenced within the context of a display? So when you use `root` this
just gives a description of some state, which includes an object id I guess
and it's initial state. The thinking here is kind of like reactive streams
where nothing happens until you have something that subscribes and pulls
on the thread ... So you could create derived atoms too, but these don't do
anything either until they are subscribed to by a certain kind of thing, a
consumer or whatever. So, for example, the view generator is a consumer.

So there could be a world where the consumer somehow provides a context or
something that all the atoms latch on to in order to read and write their
values.

Or, it could be the case that all the root state needs to be provided to the
runtime via the Display object. And it somehow provides a context for everything
to use to store and read data etc.

But it's kind of nice to say that state atoms should be referenced in the view
or in some process I guess and only then will then be included in the code,
naturally.

The problem is that for constraints and storage hints, it's not clear how those
get referenced necessarily. That code has to run but it's kind of meta-data ...
It could be attached to the state somehow or defined with it? Or it could be
attached to the display? Or it could just be that you have to import that module
that has all the constraints defined.

The things I'm thinking about:

1. I want it to be easy to create state wherever
2. I don't want people to be able to update that state except via a user event
or some process
3. For testing purposes I don't really want global state just hanging around, like
a WeakMap that everything uses that just gets created as part of some module.
4. I probably do want to be able to subscribe to state changes anywhere
5. All subscribers to a piece of state should get the same value when it updates

The display is pretty much a subscriber to state changes BUT it plays a role in
listening for messages dispatched on user events and it needs to either process
those itself or dispatch it to something that does, like an update function or a
run loop or something.

What if we had a `Loop` that was kind of the central runtime (instead of the Display)?
Would that help anything? I think we need something the encodes the logic for writing
to state:

1. Receive value to write
2. Check against any constraints
3. If ok then check for any storage hints
4. If ok then notify subscribers of the change.

This could be in the Root object itself though I guess. BUT does each root know about
all constraints that reference it? And if a constraint fails then we might need to update
ANOTHER root than the one being written to to say that it is now invalid.

So seems like we need something independent that manages the constraints and constraint
failures?

Maybe the root could just provide its initial value at first when something subscribes
but it's only when a message is processed to write that it gets associated with a loop
and then it will read it's value from the loop instead. And writes happen on the loop.
So the Display would need to create a loop or have one provided to it. Note that if
we have one instance of a state atom then it cannot be associated with multiple loops
I would think, unless somehow when you read the atom you were able to specify which loop ...
Maybe that is what the `get` or `use` function could potentially do but we'd need to
pass the loop down to the view generator. get cannot send a message since we need it
immediately in derived state.

The expectation though is that the state is shared since we create ONE atom and we
reference that one wherever we want to read it. But still with the current API one
could create multiple Display instances and mount them at different points in the dom.
So if each one created its own loop that would be a problem. Maybe we need to create a
loop and provide it to the view. And maybe this is just for testing (because what if
you created two loops and tried to use them in two displays with the same roots?)

Although maybe if we think of this agnostic of the browser then a loop is fine to create
and we add the view to it because we are in the browser. But we could also use this pattern
for a Node app too I imagine. In which case we might not have a view but instead have
API's coming in maybe? 

I think the loop is where you register processes.

But there's two approaches here ... you could register as a subscriber to a piece of state,
which you can do anywhere you can reference the atom. But in order to write to an atom
you need a reference to the loop. The only reason the view would need a reference to the
loop is because it needs to pass messages to it and the display knows how to listen for those
messages. So maybe the display just needs to expose a `listen` method and the loop
subscribes to it as a process? Like it's a message provider and then other processes might
subscribe to these messages via the loop?


### State is a description

I think we really need to think about `root` etc as a *description* of the state. It's
basically allowing us to describe the state graph, the relationship between elements
of the state. But it shouldn't have anything to do with how the value of the state is
stored. The exception is initial state but that's just part of the description.

It's the runtime (the loop) that actually tracks the value of the state.

The simplest thing to do is have a kind of default loop but otherwise be able to
specify a loop for each root. And then have the view simply emit messages and the loop
can subscribe to that. I guess if you really wanted multiple loops in a single application
then you'd need to define each in a module and all the roots would need to refer to it
as well as each display etc. But seems like most cases would want one loop and you could
have multiple displays that send messages to it. By default, I guess, the display would
register itself with the default loop.

Finally, read should send a message to the loop just like writing does.

Any piece of state should always have an immediate value. But as we add constraints,
the state should be something like a `Constrainable<T>` which would either be a value or
Invalid. And as we add storage, the state would something like a value or a Pending --
not sure what the general term for that should be -- `Storeable<T>` maybe? And the
idea would be that when you define a constraint or a storage hint, it's an api
similar to a derived state but the `get` function takes a `Root<Constrainable<T>>` or a
`Root<Storable<T>>` respectively. I think you can only define constraints or storage
hints on root state.


### State Change Messages

Right now we just have `setState` which overwrites the state with a new value. There's
probably (at least) two main types of state: a collection of records and a value. We've
really just been dealing with values. But when it comes to implementing storage hints
it will probably be valuable to understand if the change to the state is *inserting*
a new record or *deleting* an existing record or *updating* an existing record. Since
these might require different storage activities. So we might want to be able to
say that something is a `State<Collection<T>>` where these types of things can have
messages like `insert`, `update`, `delete` and then `State<T>` would just use an
`update` message maybe or even just a `setState` message to clarify the difference.

### Processing display messages

Not everything in the display would be a message that updates essential state directly.
Indeed, that would probably only be for 'local state' like form elements. Like when
we change the engagement level on a learning area, there could be 'business rules' that
determine what to do next, whereas the event is just 'Next Engagement Level' or something.

So we would probably want to send a message that says 'NextEngagementLevel' and then have
something that processes that ultimately into state change messages.

What would we want to do in this case? At the very minimum, we would have a function that
takes the message and returns some state change messages. We could attach or register
that with the Display.

But what about side effects? Most effects in a front-end app are about dealing with
storage I think in some way. Or maybe fetching some value based on something the user
did. So these could all be handled by the runtime theoretically.

But consider: When I update this input field, a HTTP request is sent with the value and
then the response is used to set the state of *another* piece of state which is then
updated on the UI. How would we handle that?

It's like the secondary value is derived from the first, BUT the derivation involves
an HTTP request. So I wonder if we could have storage hints for derived state as well ...
That would be the way to solve this on our approach I think.

All a storage hint does is run a function on the data (a function that is no doubt
async) before the data is 'committed' and subscribers are notified. So we could
definitely do that on derived state as well. But what would the derivation be?

```
derive((get) => get(someInputState))
```

Seems kind of weird. This is where it starts to seem more compelling to have async
state. But we want to resist that I think.

I think this might actually be pretty common, to take some data from input fields
and then use it to request something else based on those values. It could be that
we need to change the API for derive to something like:

```
derive([atom1, atom2], (get) => {})
```

Where atom1 and atom2 are the atoms the derivation depends on and the second
function is optional? But even so it would look kind of weird saying there's this
state that depends on these things in some unknown way ...

Or, maybe for derived state, the derivation function could be async ... But then
we start to mix a pure description of state relationships with details about
implementation. (it would seem at least) But the runtime could still easily
run that derivation and just update subscribers when it is complete. If we made
the derivation async then we could still actually have storage hints like,
do we memoize the calculation somehow, do we rate limit or debounce it, etc 

But this is all a digression from the question of how to process display messages!

So in the case we're describing, you would not actually need any special
'procedure' or 'process' -- the Display would just update the state of the
input field and the runtime would take care of everything else.

But surely there are situations in which we would want to run some 'business
logic' that's not appropriate or would complicate the view function? One
question is whether the message should contain all data necessary or whether
the function that gets called should be able to get data from any atom.
We know the view would have access to the data the view depends upon. But
it could be that an update function needs access to other data to figure
out what state to change? Not sure.

### On calculated derived state

Note that we must provide a default value for state since whenever someone
subscribes we need to provide some value immediately. But in the case of
state that is dependent on other state but the value is calculated by means
of an HTTP request, we still need to specify that initial value. So, I think,
what we can do is keep the same API for derived state, but just know that the
function we provide will generate the initial value. And then we provide a
storage hint to specify that the value is generated by an HTTP request. The
idea would be that the function still specifyes what atoms we depend upon
to generate the state.

BUT note that in order to generate the default state it's probably true that
we wouldn't even need to reference existing atoms. For example, if we're
talking about a list of notes -- this is the result of a request and it's
dependent upon the userId that we get once someone has logged in. But the
specification of this derived state would just be:

```
derive((get) => [])
```

There's no need to mention the userId at all, right? So we still need some way
to specify that this depends on the userId atom. And it's still the case that
the value will not come from any function we apply, but only by sending a
request to fetch the value.

The most straightforward thing to do is to have the get function actually return
a promise and actually do whatever request is necessary to fetch the value. A
storage hint might debounce the request? or store the value in local storage?
That's probably what we need to do. BUT we would also need to provide a default
value in the meantime? Or maybe it would just return a `Pending` value ...

What this really is, though, is kind of like a Select statement. So we could add
another kind of derived state called a `Select` like:

```
select<Array<SomeObject>>([atom1, atom2])
```

AND another problem is that, for instance, if the list of Notes is the kind of thing
that you need to fetch from the server based on, say, the learning area and the
user id, then the list of notes would itself be a `State<Array<Note>>` -- in other
words, it would NOT be a `Root` and so would not be writable ... But when we create
a note we DO want to write to/insert into the collection of notes.

So maybe we could define a `Collection<Note>` somehow, which would be kind of like
a root state. And it's default value would just be `[]`. But then we could define a
`selection` on notes where we pass in some other atoms that are like the selection
criteria. And if we wanted to create a new note, we could do an `insert` into this
collection; same with delete or update. But with the select we are really just
declaring a relationship between some atoms and the collection.

So we would define a new (derived) state like so:

```
const notes = select(noteCollection,
  { userId, learningAreaId },
  { offset: currentPage, count: itemsPerPage }
)
```

Where this means that the notes are a selection from the noteCollection based
on the userId and the learningAreaId, both of which are other atoms. And then
elsewhere we have to define what a select actually means for the note collection.
We would probably also want to be able to specify pagination stuff here
like offset and count or something as well.

Then notes would have a type like: `Selection<Note>` or something
where a Selection could be Pending or Failed or Success.

Feels a little weird though. Maybe when defining the `Collection<Note>`
one would need to specify the atoms that /could/ be used to select
from it? Like:

```
collection<Note>([ userId, learningAreaId ], [])
```

What we've done is specify the collection and the /indices/ for it basically.
Then when we do the select function maybe the type could be:

```
select(noteCollection, <something that says I can only select some from the
set of indices>, { offset, pageSize })
```

And if you wanted to do more stuff like all items where some field is
greater than 7 then maybe you need to do that with a `derive`? unless you
index on that field somehow. We want to try to avoid making our `select`
function have all sorts of predicates I think just to keep things simple?

Not sure how I would do this unless a Collection had a type for the value it
contains and a type for the values that could be used to index it. That's what the
other atoms are too -- they are indices. And when they have a particular value
that just means that they identify a particular record.

It would be great if we could somehow specify the where clause. That's kind of what
we're doing by giving the list of atoms -- just saying where the values of these
atoms match records. But what if we wanted something like `where someNumber > 4`?
That could be passed to the remote service in any number of ways. I guess we would
just need some way to declare this so that the storage implementation could actually
deal with it ... (if we wanted to allow this). Otherwise you'd just say that it
also depends on `someNumber` and then the storage hint would handle it. But that
would seem to obscure some of the relationships among the atoms? Could do something
like:

```
select(someCollection, {
  field1: equalTo((get) => get(atom1)),
  field2: equalTo((get) => get(atom2)),
  field3: greaterThan((get) => get(atom3))
}, {
  offset: (get) => get(atom4),
  pageSize: (get) => get(atom5)
})
```

where field1 etc are fields on the record that makes up the collection. But really
that `equalTo` or `greaterThan` should just kind of tag the value from the
`get` function I guess. In other words, we shouldn't need to write those things
it should be that someone can specify a new one as necessary ... then you could even
do things like:

```
field3: where("in", (get) => [ get(atom1), get(atom2) ])
```

The question is: do I really need two parallel types of state: root and derive for
Values and collection and select for Collections? Note that a collection need not
be from a remote source. It could all be in memory and we just want to represent
it that way or local storage or whatever. Both are key-value ... it's just that one
is a single value and one is a series of values.

Maybe there's still just `root` to get started, but you could somehow specify that
you are creating a root collection or a root value. And select would only work against
`Root<Collection<T>>`. Like:

```
root(collection([{name: "default"}]))
```

to create a collection with some default values.

Now, once we have syntax for `select` we can do `update` or `delete` as methods on
the collection except these would generate messages that the runtime would process.

```
collection.update(record)
```

We could try to do cross-record updates but in practice I don't know that it's really
used all that much. We're mostly updating a single record at a time I would think or
deleting a single record or set of records. Maybe there's something like:

```
collection.updateMany({ field1: "some-value" }, {
  field3: where("greaterThan", 7)
})
```

and similar with delete -- delete and deleteMany? where update and delete would just
find the record that matches the id in the passed in record.

The other thing I think we'll need to do is mark some items as somehow taking time to
fetch or write or whatever. So that the UI knows to provide for that case. I'm not
sure the best thing to call that though ... Delayable? Pendable? If some actions
related to storage deal with a remote service, then the states would be something
like: Pending (in-progress), Failed, Ok. Maybe this is like `Processed<T>` or maybe
`Managed<T>`. I think Managed is actually pretty good ... And then instead of
'storage hints' maybe we register a Manager for this type of collection/value? and
the Manager listens for messages about selecting, updating, deleting, setting,
inserting, whatever.

I think maybe all Collections would need to be Managed? But we could provide an
`InMemoryCollectionManager` that is like a default implementation maybe if no
manager is set for a collection. And for the in memory version it would just
probably never be in the Pending or Failed states?

Indeed, a Collection is probably just a type alias for a `Managed<Array<T>>`
with some helper functions that we provide since it's a common use case.

Because, ultimately, we want to be able to manage values -- that's why we went down
this path. Consider the use case where some value is calculated via a call to
a remote web server based on some input on the UI. That value could be a
`Managed<number>` for example. And to create it, we'd want to do something like:

```
manage(atom, (get) => ({ userId: get(userId), inputVal: get(inputVal) }))
```

which would allow us to specify an atom for the value and a function that returns
(somehow) the values that we would pass to the manager when fetching this thing.
So this captures the dependency between this (managed) value and other
pieces of state. Not sure about the exact specifics of the api yet but that
would be the idea. And the `select` function would just be syntactic sugar
around this function.

I'm not sure here if we need to separate out the atom here or what. For a Collection
we do want to treat that as a Root so that we could write to it. But for the case
we're considering now, it would be a managed *derived* value which we would NOT want
to be able to write to ... Seems like for the collection it would be great to define
it in general and then you could have a variety of selections from it ...

Then for Constraints the states would be something like: Invalid, Valid. These
are `Constrained<T>` values 

But the weird thing about this is that sometimes we want a Managed value to be
writable and sometimes we don't. And here we are only talking about Managed values
that are dependent on or derived from in some way other values -- so these are not
strictly speaking 'roots' and yet right now a Root is the only kind of writable
state. And note that some collections would be writable but not all -- in learn, do,
share the learning areas would be a collection but not writable whereas notes
would be readable and writable.

Maybe both root and derive could also take a managed value definition. So if you give
root a value -- then that's the initial value. Otherwise, you tell it how to
formulate the data that will be used to fetch the value -- that's a managed description.

But then root is probably not a great name ... it's more like readWrite and read.

We could do something like:

```
writable(value(17))
writable(collectionSelectedBy((get) => ({ userId: where("equals", get(userIdAtom)) })))
writable(managedBy((get) => get(stuffAtom)))
readable(value("hello"))
```

Or we could call some things 'values' if they cannot be updated and 'state' if they
can? What about a `fact` for a thing that doesn't change? But it DOES change ha it's
just not writable.

```
derive((get) => get(someAtom) + 12) => Value<number>, Derived<number>
value((get) => get(blah) + 12)
state(withInitialValue(17)) => State<number>
state(withCollection())
state()
```

What about `input` and `view` as the two types of state? One problem is that we already
use `view` in the display -- although that could be called `DisplayElement`. Recoil uses
the term `selection` for computer properties, with a `selector` being the function
that derives the value. But Selection or Derive or whatever shows the /origin/ of the
data. What we want to show is whether it's something that someone might write to
directly, rather than it being something that updates in response to other things changing.
View is nice in that way, I think. `store` could also be another name for writable
state. or `repository`. or `container`.

```
container(value(18))
container(collection(...))
view(collection(...))
container(managedValue(...))
```

Container and View seems to capture nicely what we're talking about. A view is read only
and a container is something you can put stuff into. We just need to use DisplayElement
in place of View elsewhere ...

So a `container` can hold a value or a managed value. And a `view` can hold a managed value,
a value (although that's not really very valuable?) and a derived value:

```
view(derivedValue((get) => get(count) + 78))
```

And a collection is just a `Managed<Array<T>>`. Or maybe it's just it's own type, but
it's a thing that you can insert, update, delete, and select from? The Collection object
would have functions for generating messages like Insert, Delete, Update I guess. And
so maybe we need to have `Managed<Collection<T>>`? We can figure that out later I guess.

So, for the case of the value that gets calculated remotely whenever some input changes,
we would have:

```
const inputData = container(value(""))
const calculation = view(managedValue((get) => get(inputData)))
const display = view(viewGenerator((get) => h1([], [`Value: ${get(calculation)}`])))
```

And then whenever the inputData changes due to a write message from the display, then
the runtime generates the updated data used to manage the value and the runtime calls
the manager which uses that data to request the new value and then it updates that
and the display, which depends on that then updates.


### Next test

We can rename root to container. Right now, a container just takes an initial value.
But we want to have it take a managed value. So that when you update the value, there's
some async function that runs first before the value is set.

But I guess the question is whether it's sufficient to just run some one function. Don't
we need to kind of know /how/ the item has been updated? That's why we talked about the
collection. I guess we can start with just setting the value and see how it goes.

Note that we really need a collection just when we are writing ... when we are reading
it doesn't really matter I think, you just get some value and update anything that
has subscribed to it.


### Managed and Derived Values

We've basically got it now so that there's no way to read state except by subscribing
to it from the outside, which is what we want I think. But Managed values (which are
really like async state) and Derived values are very similar in structure. Is there a
common abstraction we could use here?

We have StateManager which should just be a delegate that has a way to inject new
values for a State object. I don't want StateManager to actually hold the state because
then you'd be able to ask it for the current state which we don't want.

A derived value depends on other values. To create the derived value you need to
get the current state of the dependening values to calculate the initial state. Then,
when they change, it needs to recalculate and publish a new value.

A managed value /can/ depend on other values as its "key". When they change, the key
needs to be recalculated and then provided to the StateManager. The StateManager will
use the key to generate a new value and then publish it. A managed value is also slightly
different because it will publish special messages that contain the value and the key
used to fetch it, along with a field that explains the current state of the fetching
process.

There's one kind of abstraction we could have which is something that depends on
some other values. To create the derived abstraction you need to get the initial values
of the depending states, and pass that to the abstraction. Then when any of the
depending states change, you pass the new values to the abstraction again.

But what is that abstraction? It's something that can get messages like "here's the
initial derived value, go do something". And then later, "here's the updated
derived value, go do something"

But that looks like a container basically, since it can take an initial value and then
does something when updated like alert its downstream subscribers of a change in its
value.

Note that for Managed state, you could think of it as a derived state where it's like:

```
managedWithKey((get) => ({ type: "loading", key: { id: get(profileId) } }))
```

Is the StateManager like a special container? It's almost like there's a dependency
here: {atoms the make up the key} -> {state manager container} -> {the managed value}.
It's just that we have to insert the state manager later, since we don't know
what it is necessarily when we create the managed value, but we /do/ know what the
key derivation is.

What if we had 'internal' atoms? So when we create a managed value with a key, we
create an atom for the key (a derived value), and we create the managed value itself.
And then when the state manager comes along, we would have to somehow get the
key state, and subscribe the manager to it so that it refreshes when that state changes
and then subscribe the managed value to the manager so it publishes when the manager
changes. (This is basically what we did a while ago) The question is just how does
the manager identify the key state for the managed value? Right now we store the key
/value/ in the managed state. I guess we could store the key atom along with the state
and when we create the container, the `get` function we pass it can just provide the
value not the key state atom. This could potentially help us get rid of the managers
map.

And ultimately maybe we need to talk about StateReader and StateWriter rather than a
StateManager ... for more flexibility I guess.

Note that for registering a StateWriter you could just wrap or replace the existing
connection function I think ... But it's tricky though because we use that to
publish state updates. And there's a difference between the state updates that a
StateWriter might do (periodically refreshing state from the server for instance)
and the writes we would want the StateWriter to intercept like 'insert this into
the collection' ...

But if you think about it, really the StateReader is kind of like a wrapper around
that connection function? Yeah, and in fact, if there is no manager, but the depending
keys change then we would want to update with a new `{type:"loading",key:blah}` value
I think. So maybe we simply create a state value that is dependent on the key (if there
is one). And then when we register the state manager, we /replace/ the connection
function with the state manager's `refresh` function. And we take the current connection
function and pass it to the manager's `onChange` function. That way, when the key
updates, refresh will be called on the manager and then it's the manager's responsibility
to call any onChange subscribers, which will publish the update to downstream
subscribers.


### Intercepting writes to state

We want to be able to intercept a write to a container so that we can do something that
we can store the value in some way. This storage activity could be potentially
async. For example, when we write to a piece of state, we might want to send a HTTP
request to some backend service and based on the response /then/ set the value (maybe
including an Id we get back from the server or whatever).

This is a little weird, since the pattern we usually follow is to create a different
kind of object -- a NoteDetails or something -- and send that to the backend and then
update the list of notes with a response. It might be weird to write the NoteDetails
to the list of notes directly.

So far we've handled the case where data is fetched from the backend based on some
parameters that are provided on the UI (potentially). This pattern could support all
sorts of cases:
- initial fetch of data based on a user id
- periodic refresh of data based on parameters
- update of a value that is fetched from some place else based on input from the UI

One thing we haven't handled yet is error cases. What if the activity of fetching the
data actually fails? To handle this, though, I think all we need to do is add another
case for the `Managed<T>` type so it's Loading, Loaded, Failed or something.

But what is the use case where we have a single value and we want to intercept
the write to that and make some HTTP request? What about a 'dark mode' toggle? That's
something you might want to store in local storage and also maybe on the server
so if the person logs into another session then its the same there? Plus its a
single value basically, so not a collection of records or anything.

Note that working with local storage involves synchronous calls. But HTTP would obviously
be async. And note too it seems like we might have different states here than
we do so far with the `Managed<T>` ... here it would be something like `Pending`
and `Stored` and `Failed`.

And ultimately it should be the state manager's job to send out these messages, not
the runtime (as we do not with the sending out the loading message I think). Since
some state manager might be sync and not need to sending a Loading or a Pending
message ...

And what if you need some existing state to do the write? For the toggle, you might
need a userId AND the value. So do we allow some things to be derived state AND
writable state? Or any kind of Storeable value can also have a derived key? But it
would not update if the key changes? It's like you would only expect to update the
value if you send it a message, not if other things change. In this case, you could
have the view also depend on the userId and include that value in the message sent
to update the value? And then the storage manager needs to get that value and
send it out. But seems like we would be leaking some implementation details in that
case.

The case I'm considering here is like a 'user preference' -- supposing we want to
store that on the server. You'd need the preference value and probably some other
stuff like a userId or whatever. And in that case, if the userId changes then you
would want the preference to be refetched and if you write the preference then it
should have the id available. But fetching is different from writing. So in that case
the userId would be a derived key for reading the value. And then when we write
to the state we have access to the current key, just like how the key is included
in the union cases for the Managed value type. But it's still weird. Would you
send an update state message with a `{type: "loaded", value: blah, key: blah}`?
Seems like instead you would send an update state message with a particular value?

I wonder if in this case you might have a `Procedure` or `Process` that gets the
value from the UI via some message dispatched by an event and then fetches the
userId and then dispatches to the loop a message to update some state. But still
if that state is a `Managed<T>` seems like you'd need to give it something like
a loading message or something? Or maybe you send it a `Store` message and only
a StorageManager would actually pick that up and do something and if successfully
stored it would send out another message to update the value, and if there is
no storage manager then the message would be ignored. But then we'd somehow
need to know to send a loaded message in some cases but just the value in others.

And we can't really ONLY do readable state because we need to update things from the
UI. Note that I'm thinking about /intercepting/ writes to state. What if instead
we trigger a listener whenever some state is written to? But definitely we have a
use case where I want to save a new note. And I need to know that the save is in
progress and then is completed successfully. But that usually happens via some
kind of procedure. And then we would update the collection of notes. But in our
world, that collection of notes is managed because fetched from the server.

We could change the names of the Managed cases to just Pending, Stable, Failed
or something -- and it would be agnostic to whether it was a read or write. or
even Reading, Writing, Stable, Failed.

Note that one thing we can do for updates is that `updateRequest` should just take
a `T`, even for `Managed<T>` values.

Also, to simplify things, maybe we go back to the `StateManager` approach so we
don't have to think about chaining a Reader and Writer somehow. Still though
we probably need to change the connection function so it takes a message of some
sort? But it's weird because right now if you send a message to the connection
then it thinks you are updating the key and so it needs to refresh. Maybe
`managedContainer` would need to be a derived value that produces a RefreshRequest
instead of just passing the Loading message. Then the StateManager could send
out its own Loading message when it receives that request. Then the UpdateRequest
could just be sent directly to the connection. If there is a state manager, then
it should intercept it. And if not then the base behavior will just be to update
the storage and notify subscribers.

### What kind of container?

Currently Container is pretty simple in that it manages some type T. But this leads
to problems since a `Container<Managed<T>>` needs a `Managed<T>` message when you
attempt to update it. But that doesn't really make sense because a `Managed<T>` is
just giving you some metadata about the state of the value. We just want to provide
the new value, namely T. But if we create a new type called `ManagedContainer<T>`
then it doesn't fit with all the existing stuff ... We would want there to be a
method like `updateRequest` that just takes a T but this seems hard to do. And in
the future we'd like there to be a Collection type that has methods for Insert,
Update, Delete, etc. (maybe)

Maybe the type of Container defined how it is updated? In other words you would
provide something the specifies how to update the container -- the possible modes
of updating it. A `Container<Value<T>>` would just have `updateRequest<T>` and
a `Container<Managed<T>>` would have `updateRequest<T>` but `Container<Collection<T>>`
could have more? Maybe the API would be:

```
container.update((writer) => writer.updateRequest("blah"))
```

where target was a `Value<T>` or something, a kind of 'writer'. And then update would
need to return some kind of message that would be passed to the runtime. Or the
writer could be created independently so you could just do:

```
const writer = new ManagedValueWriter(container)
writer.updateRequest("blah")
```

and that would generate a message that could be sent to the runtime. And the type
of the message would be based on the type of the container somehow? So in this case
Container doesn't have methods on it to generate update messages. Container remains
just an identifier (and a source of type information). You use an appropriate Writer
to generate messages to update that container. Or maybe the Container could have a
method called `writer` that gives you a reference to the writer which has the
appropriate methods on it.

I actually don't think we can have a method on the container ... because it would
have to just return a general Writer type ... so maybe it's better to create a writer
with the container as its constructor argument. Then we could connect the type with the
value stored but have whatever methods we need. Indeed, we could even wrap the container
in this function and have it return another thing that extends Container ... that
way it would be easier to work with in the display.

Maybe I could have `state` be the basic way of creating a piece of state and it would
be read only and just have an initial value. And then you could wrap it with `local`
or `managed` to make it writable?

### Need to revise

We were able to get the test to pass but at the expense of breaking everything else.
Right now this is starting to seem a little more complicated than it should be maybe.

If we're going to send messages through the connection function then we need to always
do that. But what are the messages?

- refresh -- used when a derived value needs to update (only used by the state manager)
- write -- used when we are replacing the value
- publish -- to update subscribers with a new value

to a certain extent these should be definable by the state manager? But note that there
are cases when we /don't/ have a state manager. So what should we do then?

But what's the point of these? We do need to distinguish (right now) between
refreshing and writing -- since we need to know when we are dealing with a key change
that requires the state manager to do something. And the write message which tells
the state manager to do something else. Refresh is more like a 'Read' command or
'ReadWith'. 

We have a few different possible paths:

1. Local Container

intial state --> write(new state) --> publish(new state)

2. Derived View

(state1, state2, ...) --> initial read --> read(state1, state2, ...)
  --> write(new value) --> publish(new value)

3. Managed View

(state1, state2, ...) --> initial read --> readAction(state1, state2, ...)
  --> write(new value) --> publish

4. Managed Container

(state1, state2, ...) --> initial read --> readAction(state1, state2, ...)
  --> write(new value) --> publish
initial state --> writeAction(new state) --> write(new value) --> publish(new value)

The managed view/container are the only ones that have to do a read action (which is
handled by the state manager). Actually though you can think of the derived view
as doing a read, where it just runs the derivation function on the state values. Or you
could think of the read function in the basic case as just the identity function.

So consider a managed container:

1. create with initial value
2. new value needs to be written so send a Write message with the value
3. state manager get the Write message and does something
4. When it's done it passes the write message on with the value
5. The root container updates the storage and notifies subscribers

Consider a managed view:

1. Create with a derived key
2. The initial value is Loading with that key
3. So send a Read message with the key
4. state manager gets the Read message and does something
5. When it's done it passes the Read message on with the new value
6. The root container updates the storage and notifies subscribers

1. When dependent state changes
2. Send a new Read message with the new key
3. state manager gets the Read message and does something
4. When it's done it passes the Read message on with the new value
5. The root container updates the storage and notifies subscribers

Consider a local container:

1. Create with initial value
2. new values needs to be written so send a Write message with the value
3. The root container updates the storage and notifies subscribers

Consider a derived view:

1. Create with derivation
2. The initial value is calculated
3. Send a Read message with that derived value
4. The root container updates the storage and notifies subscribers

It's interesting that no matter what the root container updates storage
and notifies subscribers.

And I guess what I want is for state to kind of work but not do anything if
state is Managed but a Manager has not been provided. If no manager has been
provided for a managed view, then it should just remain in the Loading state.
If no manager has been provided for a managed container then it will just update
like a normal container.

This could be straightforward I think if we didn't need to distinguish between
a write to a managed view that should trigger a read/refresh and a write to
a managed container that should just do the write directly.

BUT we know that the derived key /should/ be a Loading message with that key.
So is that sufficient to distinguish from a write? if it's NOT a Loading message
then we do something different? Maybe `Managed<T>` should have a Writing state?
But the annoying thing is that some Managed state is not writable so a Writing
state would not make sense.

I'd love to do:

```
const c = managed(container("thing"))
const cc = managed(collection([...]))
const v = managed(view((get) => blah))
const cv = managed(container("thing"), (get) => key)
```

Then the managed function adds a writeMessage method. The problem we had before was that
when you call the manageState method on the loop and have it c it looks for c in the storage
but doesn't find it; it needs to look for the container instead. We could expose the root
container as a property I guess but that seems not that great. or the managed function could
just register a connection to the container so it's like a passthrough? Or maybe:

```
const c = container(managedBy(manager)) --> Container<Managed<T, void>>
const v = view(managedBy(manager, { withKey: (get) => blah) }) --> View<Managed<T, K>>
```

And then we just have functions like `write(c, "blah")` Not sure if we'll be able
to have the write functions be methods on the state object.

And do we have to have a separate function called somewhere with the manager? Seems
unnecessary since we already have to indicate that the values are of `Managed<T, K>`

### Decoupling fetching from using data

One thing to consider -- Rest deals with resources, which kind of map to state in
the world of es-loop. But what we want to enable is the ability to decouple the
fetching and storage of data from the data and how we use it in the app (to derive
other data etc).

Right now we have a StateManager that is attached to a single piece of state. And it
can read data for that state and write to that state as well. A few things to consider:

1. When we write data and the state manager intercepts it, we may want to have access
to the existing data in order to selectively update it. Right now the state manager
just overwrites any data. But if we want to enable something like an insert, then the
ultimate write would be a new list with the inserted value at the top. But we need the
existing list to do that.

2. We might make one request and fetch a bunch of data that we represent as distinct
pieces of state. But right now a state manager is associated with a particular piece
of state. Is there a way to decouple that a little further? So that a state manager
can set multiple pieces of state? Maybe the onChange function needs to have a piece
of state associated with it? So the manager could actually update individual pieces
of state? But how could it know which piece of state needed which piece of data?

One thing we could do is that instead of onChange, the state manager would get a set
function which it could call to set state directly on any container. So then the
state manager would need to know about the pieces of state in the app, which is maybe
ok.

But that's kind of a different way of thinking about how the state manager works.
It could still be derived from some set of state. But then instead of hooking into
the connection for a particular piece of state, it could just have a `set` function
that would allow it to update other pieces of state whenever. That could work for
readers. But for writers, we'd still want to intercept tha value I think. Although,
we could consider a message like `{ type: "writing", value: 28 }` a value that
gets written to the state in memory and then that triggers a state manager to actually
do the work (because it has subscribed to that state) and then it can write to the
state when it's finished.

But certainly a StateManager would need to have its own implementation? But we would
probably need to have a method on the Loop that provides a `get` and `set` function
to the state manager? I guess a StateManger could have methods to set certain functions
like an `update` function. That's pretty much all it would need I guess, if the update
function takes a `get` and `set` function and provides the derived key.

You'd probably want an `init` function and an `update` function. Or the `update` function
could have one message called `init` maybe. And it would be better if the StateManager
could decide what messages actually get stored in the state, maybe.

What we have now -- a kind of state manager that hooks into the connection function
could be a good model for constraints, potentially. But the version of a StateManager
we're talking about now would be much more decoupled from an individual piece of
state. It could have a derived key that would trigger a read message but it could also
just subscribe to the messages of other pieces of state and respond accordingly.

The goal here would be able to do something like make one request to the backend for
data and then provide that to multiple containers, so that the representation of the
data graph could make sense for the application and the state manager would worry
about however this is to be fetched/stored. Right now what we'd have to do is have
one container that has all the data and then create derived state that just picks off
relevant pieces of it. That's fine but it seems like we shouldn't have to model our
data in the app based on how it's fetched (or stored).

Actually, I don't know if you'd really even have to add anything to the loop. We can
already subscribe to state, and we can dispatch a write message to the loop for any
container ... So seems like this is already possible. BUT the only trick is that
the values you get when you subscribe are the values of state -- not the loop messages
with metadata about the state change (read/write/etc). So that could be a problem.
Although you would know that if you subscribed to a derived key and it changed that
you needed to do one thing and that if you subscribed to another container and it
changed that you needed to do something else. And if we define our own messages then
you could have things like Writing or Pending as part of the value of the state like
we do now.

I guess though that I kind of wanted the state manager to handle some of those
messages with metadata about the value. So, like, if a write message comes through then
it's the state manager that decides whether to send out a Writing/Pending message
and then the state manager that sends out a new value for the state when the write is
complete. But to do this, we would have to do more than just subscribe to updates;
we'd have to intercept the updates and then decide whether to pass them on.

The difference between a constraint and a state manager is that the constraint
immediately passes on its value, whereas the state manager has to decide what to do
next when it receives a message. And if a piece of state participates in a constraint
and is also managed, then the constraints are calculated first and then the
value is passed to the manager.

So far it seems like we think a StateManager needs a derived key (potentially) and then
the ability to set state on any container, and we need to specify one or more containers
to intercept writes to. Could you intercept derived state updates? I don't think so but
maybe you would? A derived key is state that's useful only for the state manager; it's
like a (refresh) trigger. So I guess a StateManager is just something that implements an
interface with an update function that takes a loop message (read, write, etc) and has
a `set` function at least -- maybe a `get` function too, not sure. The `get` function
would be useful for cases where maybe a single note is written, but we need to get
the list of notes to add it to them ...

But note that weird things could happen: one state could have multiple managers ...
is that ok? That could lead to weird async things happening I suppose.

Really what we need to do is provide something like a dispatch function so that the
loop can dispatch write messages whenever it needs to. And this could be messages to
any piece of state. I guess though the thing is that this would then send a message
to any state manager associated with that state. So we really want to send anything
directly to the state.

Maybe we should separate reading and writing state managers. These would be interfaces.
But they would be the same basically -- an update function that provides a message and
a dispatch function. Or we could have a `refresh` function and a `write` function. And
each of these would take `get` and `set` functions? But do we want to be able to set
literally any container? (even any state at all) or just the ones that this manager
is associated with?

Maybe our API is basically ok so far. We just need to change the `onChange` interface
function so that the manager will get the a piece of state and a get and set function
for it ... BUT how would the manager actually know what state it is? And if we just
provide a generic set method, although we could restrict the type to containers it
would still be very powerful.

So the state manager has to specify what pieces of state it's concerned with.

Note that in a way, the case of writes is identical to the case of reads with a derived
key. In both cases there is some state that we identified (one is a container, the other
is a derived view) that we intercept and rewrite with some new value fetched
asynchronously.

But what's the best API to indicate that a state manager will govern multiple
containers? We could use a `set` function along with a `get` function

```
const userId = container({ type: "loaded", value: "blah" })
const profile = container({ type: "loading" })
manageState((get, set) => {
  fetch(`/profiles/${get(userId)}`)
    .then(json())
    .then((data) => set(profile, data))
})
```

With the expectation that this would be reactive on the userId state. And we'd have to
fix it so that if somehow get was called async then it would start tracking it.

To support this we'd need to change how we implemented managers, I think. `get` would
work fine with just direct access to the storage. But set would be a little trickier.
We'd want it to have direct access to the storage for containers and alert subscribers.
In other words, we'd need it to ignore any other state management and any constraints?

The above is fine for the case of 'reading' data, basically deriving data that involves
an async fetch. But when it comes to writing data, we want to intercept a potential
write before it actually goes through to storage. That means we couldn't just use `get`
which is looking in the storage for the current (published) value.

But there really are two cases, I think.

1. Updating state asynchronously based on some conditions.
2. Storing a change to state before it is published to subscribers.

Now these do seem kind of similar. But (1) can operate without intercepting
writes at all. It could be done totally outside the loop via subscribing to
a derived state and dispatching write messages for other containers. (2) actually
needs us to intercept writes, I think. For (2) there are actually two cases:

1. Completely replace a value but store it on the server first.
2. Insert a new object into a collection.

(and there are variations on this for update and delete). (1) would have the
clearest API ... you would say write the new value and you would expect a Pending
message and then eventually an Ok message or an Error message. But (2) is a little
weird. You might have a container that is a collection. And you would send an
insert message with some data, maybe partial data. And you'd expect a Pending
message and then eventually Ok with the updated collection or an Error message.

In both cases, there is a message that gets sent through immediately. So,
theoretically, you could send a Pending message as a kind of trigger for any
state manager that is listening:

```
manageState((get, set) => {
  const current = get(nameState)
  if (nameState.type === "Pending") {
    // write the value
    // then dispatch an Ok message with the new name
  } else {
    // do nothing since this will get called again
    // when we dispatch a new value
  }
})
```

But that puts a lot of pressure on there being a pending message. In some cases where
the storage might be sync (like with local storage) there doesn't need to be a pending
message but you'd still want to be able to intercept, right? because the write could
fail (due to security or storage being full).

And in any case, we need to intercept writes in order to apply constraints. So maybe
there are two API's, one for doing reads and one for doing writes. The question is
whether when you do a write you need to intercept more than one state or you need
to write to more than one state ...

```
manageWrite((intercept, set) => {
  const value = intercept(nameState)
  set({ type: "pending" })
  await // do async storage
  set({ type: "ok", value })
})
```

or, since there is only one container we're interested in ...

```
manageWrite(nameState, (value, set) => {
  set({ type: "pending" })
  await // do async storage
  set({ type: "ok", value })
})
```

and then manageRead could be like above with a function that takes `get` and `set`.

Do these functions return anything? A StateManager instance? but what functions or
properties would it have?

And what about the case where we have a view that is managed ... in other words,
I don't want it to be writable, so it shouldn't be a container, but I do need
it to update via some async process whenever certain other values change. In that case,
it would be like:

```
manageDerivation(derivedState, (get, set) => {
  const user = get(userId)
  const updatedValue = // fetch value
  set(updatedValue) // set can only update the derived state
})
```

maybe this would return a state manager and you could pass it to the view upon
initialization? This is somewhat annoying because then potentially you lose the
ability to see the relationship between this view and other pieces of state, because
it's captured in the state manager definition, which could be someplace else.

It would be nice to say:

```
const derived = state(derivedFrom([userId]))
```

and that's basically an indicator that the state (somehow) depends on the userId.

Or we could do something like:

```
const calculateValue = (value) => async (set) => {
  const updated = await ...
  set(updated)
}
const derived = state((get, use) => {
  const user = get(userId)
  use(calculateValue(user))
})
```

But then we're starting to blur the lines between describing the relationship and
the procedure that's used to do the calculation. Because you could just inline the
fetch there.

So it could be:

```
const derived = state((get, calculateWith) => {
  const user = get(userId)
  calculateWith(user)
})
const calculateManager = manageWrite(derived, (value, set) => {
  ...
})
```

where useManager basically just makes this available to some manager, which you then
have to register separately. And here basically you have another case of
managing a write, it's just that the write is 'internal' in the sense that it's
triggered by a derivation.

The other thing is just that I need this to work without a manager being specified.
But in the case of a derivation that's not really possible, because you wouldn't know
what to provide? With writes it could just do the write. And a read just wouldn't
happen.

But is the derived state /really/ dependent on those values? or is it that the
implementation is dependent on them? it's definitely reactive on them but should it
be part of the state graph? or is it just an implementation detail? Could do something
like:

```
const derived = calculation([ userId ])
```

and then there's a manager that handles the calculation. But that really sucks because
then how does the manager know which state is which (supposing there are two
`State<string>`). So:

```
const derived = state(calculatedBy(manager))
const manager = (get, set) => {
  ...
}
```

where the manager takes a get and set function.

Maybe the simplest thing to do is just say that a view can be managed by a particular
state manager. But we just don't worry about defining the derived key there and then.

```
const derived = state(managedBy(pvManager))
const pvManager = manageState((get, set) => {
  const userId = get(userId)
  const someValue = get(someValue)
  fetch(`/pv/${userId}?value=${someValue}`)
    .then(json())
    .then(data => set(derived, data.stuff))
})
```

Here set just allows you to set state on those state objects that are managed by this
manager. So if there were another state object managed by `pvManager` then it could
write to it also. This way you can at least click through to the thing doing the
managing if you look at the state. But note that if these were in different files there
would be a dependency cycle since they refer to each other.

Should I really try to separate these things? I could just have:

```
const derived = state(withReader((get, set) => {
  const userId = get(userId)
  const someValue = get(someValue)
  fetch(`/pv/${userId}?value=${someValue}`)
    .then(json())
    .then(data => set(data.stuff))
}))
```

And for a container on writing:

```
const something = container(withWriter((msg, current, set) => {

}))
```

But I do like the case where multiple containers could be handled by a single manager.
So for a container we need to be able to provide a reader and a writer.

One option is just to keep such a manager outside the loop. Have it subscribe to the
state it's interested in and just dispatch messages. But we're worried that the messages
are just write messages, so this would trigger any write manager on the container. But
what if we allowed sending read messages? But then it kind of doesn't make sense. Since
you're providing it with the value. We just want some way to go straight to the storage
for the state.


### Data Flow

Maybe one way to think about this is that we have a certain flow of data:

At bottom, data for a state is 'refreshed' -- this means that it is replaced with
some new value. When state is refreshed, all subscribers will be notified of the
change. This will trigger any constraints that depend on this value to update (?)

Refreshing of state can also occur whenever state that derived value depend on
are updated. Or if some state manager provides a value.

User events can trigger a 'write' -- This means that /some/ value will be provided
in a message. That value could be used to refresh the existing state value. Or, if
a manager is registered, it will be provided to the manager which /then/ has the
responsibility of refreshing the existing state.

If a constraint is defined on a piece of state, then it will be applied after a write
event is received but before the value is passes to the state manager (if there
is one associated with the state). That way, the state manager will decide what to
do if the value is Invalid. Constraints are a bit tricky though ... we need to
think more about how they cascade or if they get re-evaluated or what. Like if
some constraint depends on the value of another state and that state updates, should
be recalculate the constraint on the current value? And if it's invalid? And if
there is a write manager?

So we can think of it like refreshing occurs in a privileged way, "inside" the world
of state. But since a write comes from outside that world it will be validated
with any constraints first and transformed by any write manager before being
considered to be privileged.


### Managers

So maybe for managers, each piece of state is just defined without reference to any
manager. We just provide an initial value.

And we can define 'providers' that update data, either triggered by changes in some
other state, or because they fetch the data, perhaps even periodically. A provider
can trigger the refresh of any container.

Providers receive an init message (somehow). But then may depend on state so that
they are triggered at times. Or they could have their own internal mechanism for
refreshing periodically. In short, a provider is not associated with any state in
particular when it is defined. (Although it can certain simply refresh just one
state)

And we can define 'writers' that are triggered by a write message and then have the
responsibility to store a value somehow and then trigger a refresh of one
particular container.

Each writer is associated with a particular /container/ when it is defined. It
cannot be associated with a derived state.

Benefits
- This gives us more flexibility in providing data. So, we could fetch a bunch
of data with one request and then refresh several pieces of state. It decouples
fetching data from representing and using data in the app.

Cons
- Just by looking at state, it's not clear always how it gets its value or which
if any providers or writers are associated with it. Although you could use 'find
usages' to determine this since we use the object itself to represent state and
reference that everywhere ...
- Multiple providers could target the same state, potentially making things
confusing. But potentially we could throw an exception if this happens?
- Depending on the API, it could be unclear that each container can have up
to 1 writer only. Otherwise, the order in which writers are applied becomes
important which would make things more complicated. But potentially we
can throw an exception if this were to happen?

So what is the API like?

```
useProvider((get, set) => {
  // get will return any state, and the provider will update when that value
  //   changes in the future
  // set will refresh state on any container
})
```

Note that the above is interesting because we aren't naming this thing ... so
there's less indication of purpose or explanation.

```
useWriter(someState, (valueToWrite, get, set) => {
  // get will return current state for this container only
  // set will refresh state on the indicated container only
})
```

Note that we don't want to pass in the current value of the state to the
function -- the writer could be async and potentially the current value has changed
by the time the async process finishes. So we use get to find the current
value when we need it.

### Initial State for containers that are provided for

I was wondering about whether we could avoid initial state for the state that is
managed by a provider, but I don't think we can because of any derived state that
depends on it. That state will attempt to generate an initial value and it can't
really know that this is not possible until it tries. We'd have to change `get`
somehow to throw or something when the value hasn't been provided yet. That might
be possible. I could do it without throwing too if I just have a flag that the
get function closes over and if that flag is set then we don't use an initial
value.

But I think for now it's best to just work with an explicit initial state for the
moment.

This would allow us to be explicit at least that a container /needs/ to be provided
for somehow ...

If you could specify the provider when you create the state then it could kick off
the provider immediately ... but even so, you'd have no way to know that the provider
sets a value immediately. It might just wait until it gets something back.

But certainly when we create state we will know it's type. And the type for state that
has its value provided asynchronously probably will have several states -- although
it really need not. I guess jotai solves this by hooking into react suspense.

Note that React suspense maybe seems to work by catching a thrown promise and when that
resolves it knows that it's done or something. Very weird.

But for us, if we ultimately had state that had no defined value then we'd get to the
view and parts of it would simply not render -- assuming we just do nothing for all
dependents ... or we would have to build in some kind of suspense type function.

And if we built in a suspense type function then we'd have to use that for all loading
stuff. But I think what we want to do is have loading be part of the state. It would
be possible to build one's own suspense function really easily too -- but it would
be a function that gets applied in generating derived state for a view.

So maybe actually it's not a good idea to have 'empty' or 'deferred' state initially.
We just need to be explicit about what value state should begin with. In fact, maybe it
should be the state definition that actually defines the type that it will accept and
so a provider would reference the state instance and then also the type definition --
instead of thinking of the provider as defining those types (in which case there might
be a dependency cycle). So:

In `state.ts` we would define a discriminated union specifying the loading states. And
we would define the container itself. Then in `provider.ts` we would create a provider
and it would reference things defined in `state.ts`.


### How do we prevent updating dependents when our value has not changed?

Probably have to use dequal or something to compare with current when trying to set
a value


### Do we need procedures?

Ultimately, too, we should consider: do we really need something called a 'procedure'
or a 'process'? Wouldn't user interactions just result in some sort of transformation
of data/state and then couldn't we model that using derived state of some sort?


### What should contraints be like?

A constraint is similar on first glance to what we might use a procedure for. A constraint
seems like a derived state that updates when some other state changes. It can draw
in other state to make the derivation. We had been thinking that a constraint needs to
occur prior to a write and that might be a little weird with our current setup. On the
current approach, any derived state update is not considered a write. It directly refreshes
the state value and notifies any subscribers.

If we think of constraints as a fast form of feedback on form entry (ie basically
in the sense of validations), then it seems fine to treat it like derived state. The view
state would be derived from the validated state. And the validated state would depend
on some local container that represents the values of the form fields (which are
updated via write request messages dispatched from the view/display). That would work
but may be a little verbose or cumbersome.

An alternative might be to have the local state, and somehow add a constraint to it, which
is a function with get and set, similar to the write function. Then one would write a value
to the container, the function would be applied, and subscribers would be notified
of the change, which would be an `Valid<T>` or `Invalid<T>`. Of course it's a bit weird
because we would want to /write/ values of `T` but subscribers would receive values of
`Valid<T>` or `Invalid<T>` ... so the type of the container would be weird. Perhaps
the easier thing would be to just provide a helper method that 'chains' the container to
the derived state. so that the implementation is what we described above but it's easier
to write the code.

But if we chain one container to another derived state, then we still lose the ability
to handle writes to that derived container -- since all derived state performs a
refresh, not a write ... Should we collapse the difference between refresh and write?

Why do we have both refreshes and writes? I think we were concerned that some container
might be provided with a value from the server, but if that triggered a write, then the
value could be written back to the server, which would be bad. I think I was thinking
about collections being something that is fetched and written to. But maybe there's a
better way to consider that?

But consider something like a container that stores its value in local storage. On startup
a provider would pull the value from local storage and set it. But then we wouldn't want
it to cause a write that would reset the local storage with the same value. So it makes
sense to separate those I think.

For a constraint, you'd think that it would be triggered by an attempt to write to
some container. But it might also depend on other values. Should it be re-triggered
if any of those values change? I guess you'd think so. Then a constraint is like a
derivation but it triggers a write instead of a refresh.

But really -- maybe I don't need to implement something new to handle constraints.
Most *validations* we would handle either via HTML5 form attributes or with javascript
but /prior to/ submitting a form and thus trying to write to a container that would
store anything permanently. So for validations:

1. When an input occurs, write to a container for that input
2. Some derived state is triggered that does the validation and results in a
`Valid<T>` or `Invalid<T>` value
3. The form view itself depends on this derived state to then style the form input
or provide any error feedback to the user -- and to enable or disable the submit
button.
4. When everything is valid, the submit button triggers a write to some other
container with all the relevant data.

And in this case the validations would be re-triggered if any other state they
depend on changes.

But note that there are some use cases for async validations ... like if you
had to check the server to see if a username is available. What then?

1. When an input occurs, write to a container for that input
2. A provider is triggered by the change and sends a request to the server
3. The request returns and the provider sets a `Valid<T>` or `Invalid<T>` on
some other container
4. The form view depends on this derived state to update the view.

Note that there are TS validation libraries like Zod and Yup that support all kinds
of fancy things so we'd want to make it possible to use them I guess.

But also, how would we know programmatically if a form was valid or not? One way
would be to have some derived state that subscribed to all of the form elements
and if any is invalid, then its state is invalid. Otherwise it has valid state.
and then that would be the state we write to some container in order to store
something on the server.

Ok but what if we use maxlength or something -- an HTML5 validation attribute.
I think here, when it is invalid it emits an Invalid event? But note this is only
fired when the form is submitted. Actually -- it seems like the best thing to do
is to not disable a submit button if any fields are invalid, but to allow people
to still click it. In this case of the invalid value, we could either wrap the
element and get the isValid parameter or style it based on the `:invalid` tag
or something. But I think unless you are using `<form>` in general then you
probably wouldn't use these html5 validation attributes; you could just use
Zod or something.

### Manipulating DOM elements

But is there a way to call `setCustomValidity` on the element? Is that something
we'd want to do? We could probably create an attribute and then use a hook to call
the function on the element during the patch process. So we could add it as a
part of the view api ... but maybe there's a more generic way to allow that. Like
an attribute that allows calling a function on the actual dom element. Although
that could definitely get away from the declarative nature of things. There's two
cases too ... setting values and fetching values.

Indeed, there are some cases in which one might want to call a function on an 
element -- like to focus some field or scroll something into view. React encourages
you to do that during an event handler using a ref. But we kind of are pretty
strict about not wanting to run JS in an event handler. So how would we handle
cases like that -- say for scrolling something into view?

Note that Elm exposes some functions that generate commands that could be called
from the update function.

Maybe one wild thing we could consider ... could a provider be used here? Like if
the view state changes, then somehow we could examine the dom in a provider and
set some values we would need? That would just be for reading from the DOM though
at most. But maybe a Writer could call a function on the DOM element? That is a way
of 'storing' information of some sort. I think for this, we'd probably want to
somehow subscribe to messages and in some cases that would mean running some
javascript when a particular message is received. Maybe for the display, not /all/
messages get dispatched to the Loop, just *write* messages. But there could be
other messages like *commands* that we subscribe to somehow, which could also
dispatch mesages to the display. That's where we get back into the need for
'processes' or 'procedures'. If we think about the display as having some implementation
details too then maybe this is ok.

But NB: processes or procedures or commands -- these aren't for manipulating state.
That we can do via derived state or whatever. These are for interacting with the
low-level / implementation of the display -- like interacting with the DOM elements
themselves.

But someone might say that's just annoying -- why not allow interacting with the DOM
at the level of the event handler? Why do you need to create a message and then
register /another/ function some place else that does what you want to do?

We could also have different eventHandlers too ... or provide some representation
of the element like with its bounding rect or something always to the message generating
function. Or we could just provide the element too ... maybe it's not so bad? We
really just want to avoid providing anything that enables async side effects in the view.

Providing the element would allow for /synchronous/ side effects on the DOM ...

In any case: This is one question -- what do we do when we need to interact with the
DOM directly.

Would a custom element help here? We could have an element emit an event that contained
information about it. And another element could catch that event and do something.
But again that doesn't really help with calling functions on DOM elements if we
need to.

The other attributes case is interesting too -- a focused attribute could call `focus`
on the element. A `customValidity` attribute could call set custom validity ...

But we don't really want to get into this world though where our API has to
define every possible thing you could call on an element. Maybe we have an attribute
that provides access to the dom node and lets you call a function on it. Could
be interesting ...

That actually makes writing (calling a function on an element) more reasonable. But
now what about reading a property of a DOM element? You want this information when an
event handler is called. We could do something where you can set values on some internal
data and then that gets passed to the event handler function? But that seems just like
extra work I guess.

But maybe as long as the `onClick` or `onInput` function must immediately return a
message, it's probably fine to have the dom element as one of the arguments. Then you
could get whatever info from it you need. And if you call a function on it then maybe
that's not too bad. But it would be possible to do crazy stuff like mutate the DOM
etc. There's just so many functions one might want to call (like selecting part of the
range of an input or something). We don't want to get into the situation with Elm
where you have to do some convoluted stuff ...

Maybe the event handler could return either a Message or a DOMAction or something?
Where DOMAction would just be a (domElement) => void -- still dangerous but gives
maximum flexibility I think.

Another approach might be to lean into functions ... take a function that returns a
`View` and wrap it in a function that sets custom validity or something. It could be
a function on the dom element. Or a function that wraps a View and adds something
to the event handlers from the dom element. So you then add event handlers to the
wrapper element and these event handlers have some extra information. But in this way
you are declaring that the information will be available. You're basically decorating
the view node in a way.

Is that better in some way? Well, one thing is that you are declaring what should happen
and not doing it as it happens imperatively.

Maybe we're overthinking this. Snabbdom is good because we can get access to the dom
via hooks. And you can do whatever you need to there; if you need to do something. So
we could just add an attribute that takes a function you can call on the dom node.
But for reading attributes of the dom ... how do we get information out? I think we
need some notion of a context. And this context can have a type. And the context
should be accessible somehow to all event handler functions. This would mean though
that we'd need a different function signature for event handlers where there was a
context.

Note that Vue does a thing where it provides a `this` with stuff on it when you
call the function. So theoretically we could do something like that?

Or if it were state somehow? ... 

It seems though that if we were to write some state somehow in a hook that would
trigger the view state function to be called again

I'd love to think of it more like the DOM is something that the kind of thing that
we use Providers and Writers to deal with. Like if there were a special container
called DOM and you wrote commands to it somehow. And there were a writer that
carried out those commands.

Or I mean the real thing is, again, to have messages that are not dispatched to the
loop but instead just handled by the display. 

Just consider this:

```
Let's say you want to turn some text into an input on double click, then select
all the text and attach an event to the document so if you click outside the
containing box you cancel the edit.
```

How would we do that?

1. We could add an event handler to the text node.
2. When it is triggered it sets some local state. This re-renders the component
so that now there's an input field with the same text.
3. [somehow select all the text]
4. [somehow add an event listener to the document; such that we can remove it later]

For (4) We could have a Provider that is triggered on the local state and it
updates the document and adds the event listener and stores the function in some
container. When the local state changes again, maybe due to the event listener,
then the Provider will remove the listener from the document. And the event listener
could actually close over the set function I think, which would allow it to update
the local state when it needs to. This kind of makes sense because you do need to
store some state -- namely the event listener so that you can remove it later from the
document.

I think for (3) we would really need some kind of hook attribute that lets us call
a function on the element once it's been inserted into the dom. OR, we actually have
some local state that we write a reference to the dom element into once the view is
mounted ... and then that could have a writer that does whatever ... I think you'd
need something like an event that's like `onMount` or something and then you could
write the dom element to some container ... but you wouldn't want a strong reference
here ... there is such a thing as a `WeakRef`. Or really the `onMount` is just a function
from the dom element to a Message. So you would just select what you want to store
and do that.

But if you were to do that, then you'd have most code on the view function, but then
you'd have this provider too that did some other stuff based on the local state. Is that
just making things weird? It could be in the same file I guess.

### Collections

Do we really need Collections? Suppose we want to insert an item:

1. Create one state that holds a list of the items
2. Create a Provider that updates this list from the server
3. Create a container that takes an item to insert
4. Add a Writer for that container which saves to the server and then
writes the value as `Saved<T>` or whatever
5. Create another Provider that depends on the 'insert container' and
then gets the current value of the 'list state' and inserts the new
Saved item.

Maybe a collection just automates the creation of all this stuff. We could
repeat the process for deleting and updating.


### Complex State

Basically with validations/constraints and collections, we are getting into
situations where we need to choreograph state/containers, providers, and writers.
So maybe the thing to do is to think about how to make this easy or what
this would look like in practice ...


### Testing

It would be really great to somehow load the TestApp in the browser and be
able to send messages to it. That way we could use Playwright to control
the browser which I would have more confidence in than myself.

If you made the app setup a separate file, then the TestApp in the browser could
load it somehow -- like import it async.

esbuild could transpile the code, but it wouldn't bundle in dependencies I don't think.

Putting the test setup in a separate file is not great though since we have
to switch back and forth. I wish we could export a function or something that
takes the test context -- just like the `fact` function.

We do have some tests that we want to treat like apps -- where we only interact
with it through browser events. And we only make expectations about what's in the
DOM. These are like Display tests (where the other could be called Loop tests).

We did it.

### Handling procedures

Ok so maybe procedures are necessary after all -- we could get by without them but
then you'd have lots of business logic in the view functions, trying to come up with
the right content for the messages to dispatch.

So a procedure seems like a function with a `get` and `set` that is triggered by
some message from the UI. I think it should be part of the model that we are building
since it will no doubt reference business rules etc. It's really a rule for
how to update state. (So maybe these should be called rules).

(Or is this what a constraint really is?)

But it's different from a constraint. A rule doesn't necessarily have some value
associated with it. A constraint though seems like it would be testing some incoming
value to determine whether it is valid?

For example, suppose we have a weird kind of counter that loops after three presses.
To get it to loop, you just press it again. But there's no value to pass here. So how
would you model that with a container? Feels like the container should have the
current value in it. And then a procedure would say 'increment' and determine the
next value and write it to the container.

Vue calls these kinds of things Actions. And they can be async and you would expect
to do things like send HTTP requests etc.

What I want is for everything to just work even if a writer is not installed.

It would be great to say:

```
const proc = useProcedure((get, set) => {
  const nextTotal = (get(currentTotal) + 1) % 3
  set(currentTotal, nextTotal)
})
```

Then in the UI:

```
Html.div([], [
  Html.button([ Html.onClick(trigger(proc)) ], []),
  Html.p([], [ Html.text(`Current total ${get(currentTotal)}`) ])
])
```

So is there a better way to handle states than using some discriminated union?

We could allow the writer to write to /another/ container that things listen
to in order to tell if something is in flight?

Is there a way to somehow have some other notifications /about/ this container?
So that anyone who cares could /also/ listen for changes about the state, not
just changes /of/ the state? And if the name of the state could be well-known,
then it might be easier to insert meta-data about a piece of state while allowing
everything to continue without that meta-data. Maybe it would look like:

```
get(meta(myState))
```

which would have to return some well-known values like: `Ok`, `Error<X>`, `Pending<T>`.

How do we do this? Maybe the `meta` function somehow looks up the meta state for this
piece of state via the loop. How does this change the writers and providers?

A Writer should update the meta state primarily. So maybe it should be something like:

```
useWriter(myState, (value, get, ok, pending, error) => {
  pending(value)
  // do something
  ok(newValue)
})
```

And when you update with Ok then it refreshes the state and publishes the new value to
subscribers. Should we do the same with providers? Maybe these -- Writers and Providers --
only operate at a meta-level. I guess `get` would allow you to either get the current
state value or the current meta value using `get(meta(myState))`. And then a provider
would be triggered whenever the meta state changes ...

What would this allow us to do? Basically, containers would just work even if a writer
was not involved. The value would update on a write message. IF a writer is registered
then the update would be handled by the writer, whenever it sends an ok signal. This also
simplifies types as we don't need to make up some kind of `Writable` type or whatever.

So sounds like two things we need to implement:

1. Meta Signals
2. Rules/Procedures that can be triggered from a message dispatched to the Loop

Still though, it's difficult to deal with collections. What we want is to be able to
insert, update, or delete from a collection -- a single item. What we've thought about
doing is to have three separate containers for this and then a provider that monitors
these and updates the collection. `writeMessage` take a `Container` so maybe
there could be insert, update, and delete messages that take a `Collection`. But let's
say you're in a procedure. Then you have access to a set function I guess? Or maybe
a procedure just has a `dispatch` function which allows you to send more messages back
to the loop. And this would work because the type would be `Collection<T>` and these
messages would take a `T` value?

So sounds like we also need:

3. Support for collections. This means you could do:

```
const coll: Container<Collection<string>> = container(withInitialValue(emptyCollection()))
```

And then:

```
insertMessage<T>(collection: Container<Collection<T>>, value: T)
```


Should a Collection only be able to contain objects that have an Id attribute?
That way, we could say a new (unsaved) record would have an Id of null or undefined
and when we write it to the collection, by default this gets a uuid generated for it.
If it is set (like by a writer) then it just gets added to the end of
the array. This is how we solve the problem of local first development when the
ID is typically generated on the server: we generate *some* id ... and if the server
wants to generate a different one then that's fine.

So a collection contains Entities, not Value objects.

Would we specify that an id is always a string? or a number? probably a string.

We would need this if we wanted to implement delete anyway, I think, because you'd need
some way to identify which item to delete -- either by ID or by providing some kind
of equals function.

Or maybe we just do nothing about this and we set the UUID before attempting to
write the object.

But what about deleting an item? Better than requiring an id, it would be better
maybe to require an equals function for the records in the collection ... that's more
flexible. But potentially hard to write? Or we could just use deep equal ...

Part of the reason we want the server to create an id is for security, otherwise
someone could post a new item with an existing uuid or something. But for the purposes
of local-first development it's probably find to have this as a way to move
forward.

### Is Collection a red herring?

The great thing about Collections is that we managed to open up the loop to plugins,
basically, by which I mean new data structures that can update in various specific
ways based on messages. This is very similar to jotai's 'atom with reducer'. Basically,
when you create a container, you can provide an update function that takes incoming
values (whatever they may be) and then stores a new value and notifies subscribers.

Building a Collection type that could serve lots of purposes is possible, probably.
But building one that could solve /all/ purposes seems difficult and probably isn't
advisable, without asking people to adopt a very particular way of working with this
kind of data.

But what /could/ be good is just making it clear that people can supply their own
update function when they create a container. And this would allow them to create
their own domain-specific messages that the container could receive. And those messages
wouldn't have to be crazy generics or anything because it would be specific to this
container and this domain.

So consider an engagement level container from learn-do-share:

```
const levels = container(withInitialValue([]), (current, message) => {
  switch (message.type) {
    case "insert":
      return [ ...current, message.value ]
    case "clear":
      return []
  }
})
const increaseEngagementLevel = rule(levels, (get) => {
  // code that either returns an insert message
  // with the next level or a clear message.
})
const nextTitle = state((get) => {
  const levels = get(levels)
  // return the next title
})
```

And then in the display, for the click handler one just does:

```
Html.button([
  Html.onClick(trigger(increaseEngagementLevel))
], [
  Html.text(get(nextTitle))
])
```

So the question is -- should we have `Collection` at all? Is it worth it to try
to build some kind of general, list-focused data structure? Or is it better not to?

### For manipulating the DOM

Maybe we need some notion of a dynamic container or something.

Think of the DOM or even each element as *state*. And sometimes we want to read
that state (like if we want to get the size or position of an element) and
sometimes we want to write to that state (like if we want to blur or focus or
scroll an element or whatever). 

For reading, could we do something like:

```
get(element("#my-element")) // returns an HTMLElement
```

And for writing, could we do:

```
write(element("#my-element), (el) => el.focus())
```

The writing part would be fine I think. It's the reading that
might be difficult, since we might not know when that element
changes. We could look into a MutationObserver. Or have some kind
of hook in Snabbdom that re-evaluates these anytime the dom changes.
Yeah we could definitely use MutationObserver for this ... although
I'm not sure what would happen if the element is not in the DOM yet ...
I guess it would just return null or undefined in that case.

But MutationObserver really only talks about structural changes to the
DOM -- adding/removing children and attributes -- ie not positional
changes etc. There are some other types of observers, though. The
fact is though that we don't really know the use case here.

Nevertheless, the best policy I think would be to somehow treat
this (info about the DOM) as *state*. One way we could do this is to
add an attribute to View elements with a name. Then when the element is
inserted into the DOM, we create a container with that name that holds
a reference to the element. We could call `get` on it to get certain
values -- and maybe there we would only return an interface with certain
properties on it. And if we write to this container, we could call
methods on it like `focus` or `blur` or whatever. That way, we don't
have to (1) create a container for every element or (2) have a dynamic
container of some sort that searches for the element.

The only downside to this is the semantics. If we created derived state
with this, when would it update? We could do something like have a provider
that subscribes to the scroll event listener and sends updates to some
container. But how do we know about changes to an element? Again, it
probably depends on the use case. We could just say that elements do
not update their state automatically. Unless maybe we have some
provider we can trigger that would do so.

Here's one use case: Suppose you have a list of feeds and you close a
feed item. If the top of the item is higher than the current viewport,
then scroll the view port so you see the top of the item when it is
closed. How would we do that?

1. Click handler triggers a rule
2. The rule gets the proper element and its current position
3. (Somehow) the rule gets the scroll position of the browser
4. The rule does a calculation and if it needs to scroll it
returns a Write message that updates the scroll position of the browser.

Alternatively, you could do it the dirty way:

1. Click hander triggers a rule
2. The rule calls DOM functions to get the element, its position, the
scroll position, and then updates the scroll position directly and
maybe doesn't even return a message ...

What's the benefit of doing this in a side-effect free way via state
manipulations?

One thing: you woldn't have to use `querySelector` as the container
would have a direct reference to the element you wanted. BUT that seems
pretty minor.

Another thing: it's presumably more testable because you could have
Providers or Writers that simulate the DOM during a test. BUT I would
probably want to test this using a real browser anyway.

Another thing: maybe the runtime could somehow be smart about when it
runs this update to the scroll position? BUT that's speculative.

IF we could trigger updates of derived state on DOM changes then maybe
it would be worth it for certain use cases. But there's probably other
ways to achieve that in those particular cases.

Another thing: By using state we are caching these values. That seems ok
but also it's another thing that we would need to keep up to date
when actual changes occur -- and how would we know when changes occur?
I guess we'd need to somehow be notified whenever the virtual dom changes
via snabbdom. And then we could recalculate the state. But again, it
kind of depends on what properties one needs from the element.

The other option would be to pass in a function to the element that can
dispatch a message when the element is inserted or updated -- like an
event handler basically. And then that would get a reference to the
element and could store whatever. But again, if we want position on the
page, this could be affected by *other* things changing ... so how would
we know that?

In some ways this is kind of a deficiency of the push model of data flow
that we are using. If we had a pull model then whenever we wanted to
get whatever value we wanted then we could get it then, presumably. Maybe
some state needs to be pull-based? Or should all state be pull-based?
But then we still want to notify subscribers when state changes. It's just
that they would get notified and then have to request the updated value
basically.

Maybe what we're talking about here is a `Reader` (in addition to a `Provider`)
which would just be a function that gets called on any read and sends
meta signals. So instead of just returning the value you call the reader
and it gets you the value maybe. But in the case of the DOM I'm just not
sure what that gets you. And if we just stored a reference to the DOM Element
then this would happen automatically because whenever we called a function
on it we would just get the latest value.

I think we want to preserve access to the DOM, though ... Definitely don't
want to create a wrapper around it or whatever. So we could just do something
where in a Rule we can return a message with a thunk that runs some
DOM interactions. And then the runtime could decide when to execute that --
either before or after any other state changes I guess.

### What about microtasks?

Basically we might want to use microtasks as some kind of batching mechanism
I think. So instead of running state updates immediately upon an event, I guess
you could use a microtask to wait until events has been processed and then
update the state. Maybe. Apparently Vue used microtasks at some point to
batch up effects, I think. (https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob)

It would probably be good to somehow batch all display patches at once if
we could but not sure if it matters.

### What about state initial values?

Suppose we want to use a provider to give state to something on startup
And we know this will basically happen immediately. Why should we have to
provide an initial value that's basically a dummy? Could we do something
like:

```
const s = state(withPendingValue())
```

And it sends a meta signal that the value is pending and it does not provide
the initial value to subscribers on subscribe. Maybe `pending` isn't the correct
thing here since as of now a pending message has some value associated with it
(namely, the message that we are trying to write). So maybe it's `loading` or
`deferred` or something.

But if you try to use that in a derivation, what would the `get` function
return in this case? It would have to notice that one or more of the dependents
is in a deferred state and mark itself as deferred, ie not have an initial
value.

This problem is an artifact of the push mechanism I think. If we had a pull
mechanism, we could say -- yes a value should be available, and then when we
subscribers request it, we just wait to provide it. I think the same problem
would arise though -- derivations would need to be smarter about whether to
return a value

Deferred would just mean that the value of the container is currently undefined.
I don't think we should add a Meta signal because this should just be a one
time initial state for the container, not something we can go back into later.

So `withDeferredValue` basically means that there must be some provider that
runs to give this thing a value. Is that bad if we want to be 'local first'?
Ie if we want the application to run no matter if providers or writers are
registered?

We could also just make the value potentially undefined ... and then we'd need
to handle that in all cases, which is what we're trying to avoid I guess.

It's more like we want to say the initialization of this is 'lazy' or 'late' or
something -- we will initialize it just not immediately. Lazy means we
initialize it on first access, which is not exactly what we want. Late is
more like it -- it will be provided later.

Maybe this is actually nice though -- for values that need to be fetched on
initialization, it's the provider that will say that they are being loaded
or whatever. In that case, then, why not just start with a pendingValue instead
of an initial value ... but that pending value is something particular.

Note that Elm avoids this because it has an init function. We don't really have
an init function because all the atoms are exported from some module like normal
JS types. so we don't really have an opportunity to call an init function on them.

Note that Jotai handles this with the Provider component ... so because it's
part of react, you can wrap part of the tree with a provider component and use
that to initialize values. or something like that. We *could* do something
similar via the Display ... pass in some kind of init function to a Display and
it would function like the provider to set state before any of the display stuff
happens. But I'd rather not entangle state management with the display.

Also Jotai kind of gets around this problem by allowing async state -- or in
other words defining an atom's initial state with an async function.

Maybe for us, it's the Loop that could have an init function. And all that would
be is a Provider. So we could just call `useProvider` in whatever configuration
file the app uses. But still we need to indicate that certain state will have
it's value provided for it later ...

Or what if we forget about initial values? State is `inert` until an initial value
is provided. So an inert state will do nothing except collect subscribers and
dependents. Once inert state receives a value, it will publish that value to
all dependents and subscribers. Any state that has an inert dependency is also
inert.

We want to think about our app in this way: One level describes the state and
its interrelations. Another level describes the storage. We should be able to
swap out the storage for testing purposes. Any initial state provided by wherever
is really part of the storage, unless it is just like a default state value.

Maybe inert is a special meta signal. It's like Pending but with no message or
a special message. Because we need some way to determine if a particular
container is inert. But maybe even meta signals should just do nothing until
the container has some value. Otherwise we're going to end up creating a
bunch of meta containers just to check if something is inert or not.

Back to 'forgetting about' initial state. Maybe the idea is more that we
assume that all containers are inert. And if we use the `withInitialValue`
initializer then we dispatch a write message to the loop directly upon
initialization.

But the question is -- should we really distinguish a Pending state from
an Inert state? Recoil allows you to not set a default value and in that
case it says the atom is in a Pending state and React Suspense is triggered.

For us the more typical case probably is that you load everything and then
a request needs to be made to fetch some data from the server. So what would
we do in that case?

1. Create the state with no value
2. A provider sends a Pending meta value and starts the fetch
3. When done the provider sets the Ok meta value with the data

Alternatively

1. Create the state with a Pending Meta value but no actual value (somehow)
2. The provider does its thing

In both cases we still have no actual value and so any dependents will need
to be inert and wait. It's just a question of whether the default Meta value
should be pending or if it too should be inert. But what would the message of the
Pending value be? If it did not have a message then we could do this easily.
But is it helpful for the Pending value to contain the message that's being
written?

Or, I have a Meta signal called `Inert` that takes no message. The thing is --
I'm not sure that I would want to do anything when an atom is inert -- that
basically just tells me that it hasn't been fully initialized yet.

I think what we really need is an `init` function of some sort so that the loop
does not 'start' until init is called. And that allows us to pass in some
initial state for particular containers. It could be that we have to dispatch
a special message to the loop or something. But in any case, the init function
should take a Provider -- or really just a function that takes a `set` function
as its argument, since we shouldn't need to get anything from existing state
yet.

If so, then maybe no container or state should have an initial value, and
*all* initial values should be set when the loop is started. Probably, the
way we would do this is to create an initializer function anyway that takes
some initial state and then populates the containers. This could then be
used in tests or for development or for production. But seems like withInitialValue
would still be useful for local state or state created on the fly once the
application is initialized.

In short, we need a `configure` function.

So, two things:

1. When creating state or a container, we need not provide initial state. If
no initial state is provided, the state is inert. It can accept
subscribers or dependents but it will not publish a value until it has one.
Any derived state that depends on inert state will itself be inert. And
the meta state for an inert state is also inert.
3. We need a `configure` function. This will reset the loop and run a function
that can set state using a `set` function.

Note that this could be helpful for something like 'logout' functionality, where
you need to drop all state for a session. BUT we can't reset the loop if there
are any containers that *did* set an initial state -- they would be wiped out.
UNLESS by 'reset' we really mean setting things back to their *initial* state.

this is such a big change though ... it is so much better if we can just provide
some initial state, even if it will be overwritten immediately.

I'm most worried about initial state for objects ... but maybe I'm thinking weird
maybe we just need to make up some data and then override it with a provider
immediately. It's going to be weird anyway to have some state that has no value
and then you have to remember that when you go to configure things. If there
were some way to make it super clear /what/ needs to be configured that would
be better.

Maybe the things that need to be configured could be derived state ... And maybe
there could be just one /root/ state or /config/ state that these depend on.
And you would have to create a Config state and give it a type I guess so that
when you reference it we know what it is. Or maybe the Loop itself needs to have
a Config type ...

But still we would have a bunch of state that would be inert until the config is
set. But at least that's just one special container. So if anything references
that then we would know to defer until it's set.

So all /containers/ would need initial state. But /derived/ state could depend
on the config? But think about a list of notes or something -- that could be
modelled as a container but it might depend on data passed from the server and
so need to be configured. But that could be handled by a provider that depends
on the config.

So no derived state would run and no providers would run until configured. But
what about meta state ... it could just throw if you try to access this before
the loop is configured? Or really, we need to not do anything until the loop is
configured. So somehow, everything would need to get queued up until
configuration occurs. Is that possible?

The `configure` function would just need to return the value for the `Config`
state. So it would not need to reference any other state. So conceivably,
it could be called in whatever `index.js` is used to start and configure the
app. And so we could have the app crash if you try to create a container or
anything before `configure` is called. Seems a little sketchy but that could
work. But there would still probably be imports that would occur that would
end up referencing state downstream somehow.

The other thing to do is reconceive the way we're referencing state ... maybe
state should be a property on the loop? but the experience is so nice just
referencing identifiers the way we have been I think.


### More complicated updates

If a state has no subscribers, should it really update itself? We have a situation
where if you create view state dynamically, when the state changes and a new
state is created, the old one does get unsubscribed from but it will still continue
to calculate its new state ... unless it gets garbage collected somehow I guess.
This is maybe more reason for a pull-based model ... that way state is only
calculated when/if some downstream subscriber needs the value ...

Also, we probably need to deal with view state updates that trigger remove? or
is delete /always/ triggered?

We need to kind of get the version of state so that we can set the key properly
on the snabbdom view generator element. Otherwise, list updates will not work
right. And if we reorder a list but don't actually change the elements, we want
it to not destroy those items ...

The problem we're dealing with now is really about /reordering/ so our test
should just not worry about the dynamic creation of view state now and just deal
with a list of view states ... I think -- yes.

Once we have a key and just reorder view state elements then it's clear it
really is just reordering them and not destroying them and recreating.

It looks like it doesn't really matter if the LI has a key on it. So long as
the view generator has a key that maps to its state there's no
destroying of elements during updates.


### Server side rendering??

It seems like it would be cool for the display to be able to accept a different
'renderer' so it could output HTML instead of DOM updates. This would allow
us to use the same code to generate HTML on the server side. But is it worth it?

Right now, we could have the server just generate data on the server side and
have the app render via JS with that data as soon as it loads. No need to make
a request to fetch the data and no need to worry about all the complexity of
server-side rendering.

Note that apparently LDS loads fine from the perspective of Google, even though
all the HTML is rendered via JS.

I don't know if this is worth worrying about.


### Routing

How would we handle page routing? Presumably, the document location would be
a state object and then some view could depend on that to render the right
stuff. I guess we would want a provider that would examine the document
location on startup to set the initial route in some container that holds the
current route.

We would also need a way to update the location -- by calling `history.pushState`.
For this, we could just write directly to the container and have a writer
that updates the document location accordingly.

So seems like it would be very easy to implement this.

If we were to provide built-in support for this, we'd probably want to have the
programmer supply some function that takes a given path and outputs some
route description object that would be in the state. We'd want support for
path variables of some sort. And maybe that's it. And we'd want a nice way
to update the route. Seems easy enough to implement.


### DOM manipulation

I think we need to provide the event object in an event handler. There's just
too much information one could want from that event -- even with the click
event, you might want to know the position of the click or if buttons are
being held down, etc.

I'd really like to think of the DOM as state though. It's kind of a storage
mechanism.

If you subscribe to an event, you can use a provider to write relevant
data to a container that can then be used to update the display. How would you
cancel the provider though? I guess that's another piece of state ...

Suppose you wanted to scroll some element into view when a button is clicked.
You could just do this as a side effect in the click event handler. But then
you'd need to return some message. Perhaps we could create a null message of
some sort. Or perhaps we write a message that contains a thunk with the dom
manipulation to execute. But what's the benefit of doing that? It could get
batched to run as a microtask I guess.

It could be part of a rule -- although a rule needs to return a message too
I think. So we could have another concept, call it an `Effect` and this
doesn't return anything. But again, is there any benefit to this? A rule
is nice because you don't have to depend on state that's not relevant for
rendering the view. And you can trigger a rule without needing to create a
stateful view. But does an effect have the same benefit? Why not just
run the code in the event handler directly?

React uses refs for this, but that's really if you want to reference the
actual element backing some child component inside a given component.
Otherwise seems like you could use document.querySelector inside an
event handler or something. Also refs make it faster to identify a given
element.

For us, we have a reference to the dom element under the hood. so we could
do something like refs. Most of the examples are about doing something in
a click handler on some other element in the current component (other than
the button). So it doesn't matter that the click handler has the event and
thus a reference to the event target element.

### withState

Right now we often use withState by passing in a function to it. But this
means that every time the surrounding function is called, a new derived
state will be created, even if nothing ever subscribes to that derived state.
That seems not so great.

With jotai, there's the `useAtom` hook that just gives you reactive access to
the value of the atom. With us, we actually create a new piece of derived
state that produces a View.

Basically we want to memoize this function somehow. We can do that. But then
the cache we use will have a reference to the state somehow so it might never
be garbage collected in the real loop registry.

But the deeper problem here I think is the ergonomics of how we create
stateful views. And if we want these to be 'islands' in some sense, we're going
to have to somehow designate them and their dependencies better -- like in
a separate file or something. BUT we are also encouraging having very tiny
stateful views, which wouldn't really amount to a separate file maybe.

With React, a component is just a function, and you get access to state via
a hook. Could we somehow have the notion of a hook in a view-generating function?

If we could know when a vnode was NOT patched then we could somehow maybe
remove the derived state from the loop.

But I think that every time I call the withState function from a particular
position it's always the same value ... since it's just really an opaque
vnode essentially. The key is really the only distinguishing thing about it.
So maybe we could try to give it a key all the time based on a hash of the
function or something? But every time the function is called it would generate
a new key, unless the key is based on something. And note that you could
have two withState calls with the very same function in it -- that's what
happens with the list of notes in LDS. It's just that each one has a different
key.

If we gave the withState component a name, then it could cache the view
with that name. But then it would never go away. The thing is though that
the view-fragment has no properties except a key. So we don't need to
even use the generator to create state until the element is created. The
only reason we do this now is so that we can get the key from the top
level element.

I think we need to try going back to how things were before -- except
now in `withState` we pass in a GetState function. But we don't do anything
except return a vnode. And in the init hook we create the derived state
from the generator and subscribe. Then we can set the key on the vnode maybe
and then we need to do something where if there's an element then it patches it?

### What does it look like to implement a load button?

Suppose you have a form with startDate and endDate fields. And then a button to
load some data between those dates. How do we implement that?

one way would be to just to write the start and end dates when the button is
clicked to some container. And then there's a provider that depends on those values
so that when they change, the provider does its thing and writes the value to
another container, sending meta signals along the way. And then when that
container is updated further view logic is triggered or the view is re-rendered.

This is program logic via reactive data flows. Is this easier to understand? Or is
it bad?

One downside ... you can't really determine that the provider exists which is
listening to those values and updating another container. You'd want to somehow
organize these things together since they kind of form a group. But then the problem
is that you'll be mixing the state graph (the fact that the values in some container
are in some sense dependent on the start and end date values) with storage details
(ie the fact that you need to make an http request to fetch this data). We'd like to
keep those separate.

We could look into using a reducer function somehow -- like with how we implement
collections -- but there's no way to make a function that takes start and end date
to the data ... unless it just returns an empty array or something by default.
And then you specify a writer or something for the real implementation.

What we thought about in the past was a kind of 'key' -- certain containers have
a key that is a derived value. And you could indicate that the key is used by
some storage detail to figure out the real value.

Also, what if we don't want the fetch of data to happen until some button is clicked?
Like, even though we might have some default values for start and end date, we don't
want to trigger the fetch until some /other/ button is clicked on the UI ...

one way to think about this is that you're submitting a form ... does that help any?

We could think of that like triggering a rule, but one that can write to any
state. It's like a provider that is not reactive.

But note -- in a database this would be like doing a query with start and end date
as part of the where clause. And that's really the idea: a query. And how that
query is actually implemented depends on the storage details.

So a rule is like a transformation of data, a mapping of data via a pure function.
We have a writer to handle basically inserts or updates to data.
Providers can also do inserts and even periodic updates.
But maybe we need a notion of a query. Something that selects some data when
it is needed (maybe not all the time). And if writer is analogous to an insert/update
then a reader would represent the analogous storage details for a query.

But having a query kind of changes the mechanism of the data flow. It's like you
are /requesting/ a value, when typically what happens is that you are just /provided/
with an updated value

What does a 'reactive query' look like? That's so-called derived state. But we want
some way to trigger a refresh ... typically that would happen if the start or end
date changes. So are we just thinking about this weird ... like in the case we're
talking about we actually just need something like `undefined` is the initial value
and until there is a real value we don't fetch anything? The provider is just
smart about that?

We could consider having a special type of state token that refers to a 'Store' or
a 'Table' or 'Repository' or 'Relation' or something. This would have an initial
value but then everything else about it would be managed by a reader and writer.
Other state could be defined as a query on that which would get updated whenever
its dependencies changed. Theoretically you could write to this and then other
state would define queries that would get updated as this changed. Would that help
or would it complicate things?

There's at least two cases we're solving for:

1. Some values might need to be fetched from someplace based on some query
2. Some values might be calculated somewhere else based on some inputs
3. Some values need to be stored someplace else for persistence beyond this session.

Seems like we could handle all these cases with what we have now -- writers and
providers. The worry though is that some providers might start to have 'business
rules' within it and then this logic is mixed in with details about how we
store or fetch the values.

For example, if we want to fetch data between some start and end dates, then we could
have a provider trigger when those change and update some container with the results
but then we'd have to look at the provider in order to see the relationship
between all these values. and plus the provider would contain all those details
about fetching the results.

Instead, maybe we define a 'DataSource':

```
const startDate = container()
const source = dataSource(withReducer([], someReducer))
const query = state(withQuery(source, [ startDate ]))
```

But would the source itself have any value? You could send
a reducer message to it that says `{ type: "fetch", startDate: blah }` or whatever
and then it could update. But then what we're really talking about is
just a regular container that has some writer attached to it. We could do 
the same thing to handle (2) I think. Basically, send a message to the
state and have a writer that actually does the work of updating the value
based on that message. I think that may actually be sufficient here since the
'business logic' is kind of encoded in the various messages that the
container can receive. And the writer does encapsulate the details about how
to actually update the container value based on this message. So maybe
`writeMessage` is not the best way to describe things -- `dispatch` might be
better for cases where a reducer is involved.

BUT the one weird thing is that when you define a container with a reducer
you have to give it a function that will actually do stuff and return a value.

What about thinking of a container as a little program? Where you send a message to it
and it updates itself? That's kind of what we have with the containers that
use a reducer. But sometimes the value will not be synchronous ... so we need some
way to register a provider and in that case you need to send a message to the
provider rather than the container. Or we have a container with a reducer and the
the actual container is derived from it. Maybe in that case you have a class
that contains both of these containers.

But the problem with that is that you would need to create an instance with a Store
and then reference that from other places in the app that need it.

Now the reducer container is able to take a different kind of message and
then produce a value. So we do have containers that are typed to be able
to receive some set of messages. It's just that we need these to be async.

Maybe it's just a container with a reducer and some writer and the
container's reducer function just returns a dummy value for all messages
and the writer actually does the work.

I think that could work but we would likely need some extra function like:

```
const c = container(managed<MessageType>(27))
```

to be able to say what kind of messages it should accept and the initial
value. And this would do basically the same as `withReducer` except
it would simply return whatever value by default.

That way we represent the 'business logic' by way of the messages
that this container accepts. It could even be a separate function like:

```
const c = managedState<MessageType>(withInitialValue(27))
```