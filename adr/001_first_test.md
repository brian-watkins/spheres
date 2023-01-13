# First Test

Where should we start?

ESDisplay is a framework for creating HTML user interfaces. So we could
first look to see that it renders HTML?

The basic idea is that the UI emits messages in response to user interactions
and that's it. Given some data, the UI is generated as a function of that data.
We use some kind of virtual dom to update the UI wheneever the data changes.
We could use Snabdom or Million or write our own.

Then there is the part that listens for these messages and takes some action
in response. We're thinking of this in terms of Procedures. Part of what a procedure
can do is update the state. And then this triggers another re-render.

So, right now, we're thinking of esdisplay in terms of the elm architecture
basically, or the flux architecture more generally.

BUT there is a little trick here because we also implement 'local' state for through
the Context api. This kind of works like react hooks actually, except instead of
using a closure we actually store the data in the Virtual DOM itself. This maybe
limits our use of virtual dom libraries, so maybe we could switch it to actually
use a closed over variable instead. And whenever the local variable is updated
we cause the view to be updated again.

It would be cool, of course, (but maybe not necessary?) if whenever the local state
changes we update just that part of the view that is governed by the context.

Supposing that would work, then what's nice is that you know what parts of the
view are governed by particular pieces of state. It would be kind of interesting
to see if we could extend that, so that even if state were stored 'globally' then
still a given part of the view specifies what pieces of that state it needs.

The difference between global and local state would be that the view itself can
update local state based on user interactions (but only by dispatching a message).
Global state can only be updated from outside the view.

But to do this without calling the function to build the view, we'd basically need
to store a whole bunch of functions, and figure out which function to call when
some piece of data changes. And then take the vnode returned by that function and
diff it against the current -- so you'd need to be able to map each function to
a particular position in the dom or the virtual dom tree.

Maybe kind of what I'm talking about is the Context API plus useState, basically.

I think there's kind of this trap where it seems really bad to call a function
that builds up a vnode for the entire view when you know only part of that view
needs to change. But maybe it really doesn't matter all that much. Snabbdom and
others have lazy evaluation (like elm) -- via 'thunks' -- so maybe we could use
that to implement what we're talking about. But the Snabbdom docs make it clear
that this is an optimization that's really only necessary if you are trying
to render 'complicated' view that takes 'significant computational time' to
generate.

So maybe what I'm talking about is more like a feature rather than a standard
pattern. By default, the entire view function subscribes to the global state,
but you could have pockets that depend on particular parts of that global state
and which only get re-evaluated if that part of the global state changes.

And the point is less about re-rendering efficiency and more about whether it's
easier to conceptualize state if it's broken down and associated with the parts
of the view that actually want to use it. Instead of thinking about a 'store' or
a 'model' like in Elm, you think about a particular view that depends on some
particular set of state. It could be a large tree composed of different functions
and so on, but at the top level it says: Hey, I depend on this data; update me
when it changes. It's like youre subscribing to a subset of state that you care
about. This is what ends up happening anyway, but I wonder if it's possible to
have a function define its inputs rather than having them passed down into it
explicitly. Like, in building the view function, certain functions would return
a special Node that expresses an interest in certain pieces of data, and when that
data changes then it gets invoked to generate the view underneath it.

You could do that by specifying a selector to the store. But the point is to avoid
having a single store. But otherwise, how do you access this state /from the outside/
in order to update it?

The atomic state management stuff is interesting and kind of like what I'm describing.
But they (recoil, jotai) tend to store data /within/ the react world -- like in
a context object but using `useRef` somehow as Jotai does. They also follow the
pattern or `useEffect` of trying to do everything in React, so they have async atoms
that automatically plug in to the Suspense model, showing some html while the
promise is resolving (I think).

For me, I want the async stuff to happen /outside/ the view. But I want the view to
update when that data changes. So, I wouldn't need async support /within/ the view;
only getters, and the view updates when promises are settled only.

So local state has getter and setter, but the setter is kind of weird in that you don't
just set the value directly, you call a function with a new value that then produces
a /message/ that will update the local state.

And for 'global' state, I want a similar API but there's just no setter. In order to
update that value, you end up dispatching a message from the view layer and some
procedure will be triggered that ends up updating the state outside the view. When the
state is updated, then any parts of the view that subscribe to it will get updated.

No idea how to implement this, but maybe if we have an idea of the API we want we
could try to make it happen. Basically, you'd probably need to define the pieces of
state in a module and import that either from the view function or the procedure.
But somehow when you do it in the view function you should only be able to use the
getter.

And then no idea how to structure the view so that only parts of it are re-evaluated;
maybe with a thunk? But even with a thunk, if part of the state updates then the
whole view structure is re-evaluated except for possibly one part of it. Whereas
we want the other way around, where one part of the view is re-evaluated without
the whole structure being re-evaluated I think.

Basically, we want /only/ the part of the view that is governed by the piece of data
that updates to be re-evaluated. What we're thinking of here is trying to understand
the view as /based on data/ and so think of the data as primary to understanding the
view and it's shape -- the layout on the page is secondary ...

So what kind of tests would we write for this?

One approach is just to observe that the dom updates as expected ... but that would
leave the implementation wide open. Is there any test we could write that would
kind of require us to implement things such that only part of the dom is re-evaluated?
I guess it would have to be a more low-level tests where we test what parts of a
tree of virtual nodes are diffed with the real dom or something.

So two things:
- Try to think of data in terms of 'atoms'
- But there are no asynchronous atoms
- atoms can only be read from, not updated within the view
- think of the view as a function of atoms from the beginning so that
when an atom updates, only the part(s) of the view governed by it need
to be re-evaluated

It looks like Snabbdom's patch method just works on /any/ vnode -- it doesn't
need to be the very top level one. So seems like we could still use Snabbdom,
just need to be more specific about how we call the patch method I think? But I'm
not sure about that ...

Maybe there's a hook that registers the vnode somehow with some map when it's created.
We would need a way to go from 'some atom changed' to 'here is the current vnode governed
by that atom' and 'here is the next version of that vnode to patch against'

I think what we'd want is to have our view function that generates the new vnode be
smart enough to only run those functions that would change given the changed
data. But still you diff that whole tree against the full dom tree.

Another approach is to take declarative views and turn them into imperative code. There's
a language called Imba that does this. I bet this is what Svelte does as well.
I wonder if it would be possible to do this without a compile step ... could you
do this at runtime?

You'd have to have one pass where you render the full dom. And then after that, you'd
have to know how to update that piece of dom given changed data. The updates could be
of several kinds: update an attribute, update a text node, update children (like add or
remove).) But I think to do this you'd need to know whether a function (like Html.value
that sets the value attribute) with a constant value or a variable. And you'd need to
know where there are conditionals and things like that which could potentially
change the structure at a larger level (by deleting a node, for example).

Seems like this would be quite difficult to implement. Especially without being able
to generate an AST. I think though that this is basically what million.js does ...
so maybe we could just try using that as the core html generation library? But I think
what Million.js does is ask you to add flags to nodes to specify whether they are
static or can change. and then it does some optimizations based on that. But I guess function
on top of million.js might be able to determine some of this -- like whether there are
children or whatever. So not sure how helpful this is ... There is a vite plugin that
does something but hard to tell exactly what it's doing ...

But something like recast is a javascript parser that could take the code and create
an ast ...

Maybe when I really want is just not one big object that holds all the state. Instead,
I'd like to be able to specify and observe pieces of state and respond to them.

This kind of lends itself to the idea of relations in the sense that you should be
able to divide application state up into something like lists of records -- and the
model in Elm kind of becomes something like that just glommed together into one thing.

So suppose you had a 'table' of notes, and any time it changed you could update the
part of the UI that displays notes (or the part of the UI that displays the count
of notes -- the count being some derived data). And it doesn't matter to you as the
program author what order that happens in -- it could happen concurrently with other
changes maybe.

Some thoughts from the tar pit paper:

- You should describe/structure your data independently of everything else, and anything
that is derivable from that data should be recomputed rather than stored.
- You should have pure functions that can operate on the data and help you generate
derived data -- this is the 'business logic'
- parts of the program that need to interact with the outside world will either observe
changes in the data (relations) and do something in response or update the data.
- describing the data relationally makes it easier to access and understand I guess and
still keeps it all in one place, independent of any constraints or functions on it (in
contrast with OOP)
- declaring /what/ you want to happen and letting the runtime figure out /how/ to do it
is way better than anything else

What about procedures though? These need to do things like translate some input into a change
to the state. They need to manage side effects basically -- that's the only place where there
are side effects in the code.

The difference between 'local' state and 'global' state as I've been thinking about it is
really just a difference in how it's persisted -- global state is persisted in a way that
makes it available to everyone (in memory), local state is persisted in the dom. The other
difference is that 'local' state is just keeping track of user input without updating the
essential state of the app. It's state that belongs to the UI only. As such, it triggers
a UI refresh independently of changes to the essential state (the store). But it would be
great of course if it only refreshed the part of the UI that cared about it.

Right now, I subscribe to /one/ giant piece of state and any time anything in it changes,
the entire UI is refreshed. This works but it's kind of unwieldy, since the state object
will grow over time.

What would be cool is to be able to observe some piece of state and govern some area of the
view with it. And just assume that when that state changes, that particular part of the view
is refreshed. In that sense, the view itself is a derived piece of data (derived from the
essential state).

What if we think of it like that ... as in, pieces of UI are derived data, and then the UI
system can observe that and apply them whenever they change. The arrangement of these elements
is itself some state that will not change.

The tricky part seems to be that these things/elements could be nested and something like
the bottom level could change but not the top. But is that really necessary?

I guess maybe for any UI element that has a conglomerate of data, you would create a derived
record that is observed by it. And then for lds, the front page is just displaying a list of
records. And the second page has a list of notes, a list of engagement types, details about
the learning area. The things that could change on the page I guess one would subscribe to.

So it's like in writing the program, we identify the areas that depend on state. And then the
fact that these UI elements are arranged in a hierarchical order is really just a function
of the HTML. The derived data could be something like virtual dom info. And the UI system
just has to know how to diff it and resolve it with the correct area of the interface
(ie the html/dom page)

In addition, we need some kind of conditions on changes to the state I think. Or rather, the
system needs to handle persistence in the sense of sending the data to the backend for storage.
Somehow, when you make an update to the state, any persistence must complete successfully
before you notify any observers of a change, I think. But that is, kind of, a subsidiary concern
that the system should take care of, giving certain hints about how to store this data.
For LDS, it's just a matter of sending a specific type of request to the backend and getting
a successful response.

I think as long as we had that, we would be pretty good. But what about requesting new data
on a page in response to some user event -- what if we need to reach out to another web
service or something?
- In other words, what if the message received as input doesn't just result in a change to
the UI but also triggers some request to fetch other data -- like if you input something
in a field it triggers a request to some service to perform a calculation and then presents
the result of that calculation when it completes? I guess one way to do it would be to have
another observer of that state. And when that state changes it fires off a request for the
calculation and when it comes back it updates the state. So the UI is not the only observer
of state.
- But didn't they say it's bad to have an observer that is also a feeder? Yes because that's
just creating more complexity and really hiding the fact that some state is derived. BUT
they say something like the real problem is that feeders/observers should not feed back in
the same data that they observe, as if they were just enforcing a constraint or something.
- And also, it's clear that the calculation is itself derived state. It's just that for
performance reasons, the calculation runs on a remote system. So, I guess another way to
think of this is that we can provide a performance hint to the system to say that the
calculation should be carried out on a remote system accessed via HTTP.

But the other way to think of it is just that the state definition (the set of relations)
does not say anything about how it is stored or accessed -- it's just a representation.
So if something needed some state, the system could fetch it from another system and
then cache it in memory. But this is a concern of the infrastructure, not of the data
representation.

But that does kind of raise on interesting point: We kind of talk about inputing data,
and then derived data, and when that data changes certain observers update things like the
UI. But what about when we need to do a query? For example, someone navigates to a page
that shows a list of notes. How does the system know to fetch those notes? Of course, in
an ideal world, the data is just present already, and we could still think of it like
that. But it feels more like something might update which causes some data to need to
be pulled rather than observed. That's kind of starting to think about control logic
though, which is one of the things we want to avoid.

But maybe this gets to 'accidental state and control' -- the kind of performance hint.
Maybe it says certain state should not be available until it's necessary by some other
event happening. Like, if a 'page location' gets set, then the system will load certain
information, and when it's available it will compute any derived data and the view
will be updated.

So the system would need some way to specify when certain pieces of state need to be
available and how to fetch them.

The key idea here seems to be that the program should be as clearly as possible a
description of /what/ should be the case and not /how/ it should happen. We should
describe what the data is, not how to fetch it. We should describe any transformations
in terms of pure functions. And things should just react to changes in the data. The
system should be smart enough to handle any details about how the data is fetched,
cached, stored, etc.

But what about messages from the UI ... like when I click a button to save a note.
What is it that intercepts that message? Clearly we need something to INSERT the
note into the NOTES relation. If the UI does that, then it still needs a way to
receive messages and respond to them in order. And the view does need to update usually
to say that it is in the process of persisting something. I guess the idea is that
/all/ that the feeder would need to do is update the state, and the system takes
care of everything else. But aren't the messages themselves part of the state of the
system since they are due to user input?

I guess that some data can be 'persisted' immediately and some need not be, based on the
hints. So, for saving a note. Perhaps there's a relation saying that there is a note being
saved which gets committed immediately and there's also an insert to the notes table which
happens once a successful request to the backend has occurred. But then you also have
to 'reset' the state that says the note is being persisted when the note is actually
saved.

And if something fails then a relation should be inserted into some corresponding table
I guess.

I guess it's more like we should say: 

```
do => INSERT(note_state, "SAVING")
andThen => INSERT(notes, <the note>)
andThen => DELETE(note_state)  
onError => UPDATE(note_state, "ERROR")
```

Seems like this 'procedure' has to be somewhere ... and this is basically what we have in the
procedure except we explicitly make an HTTP request instead of saying we're inserting the note.
The difference here is the system would know how to persist the note via HTTP.
- This is control logic. It seems like they suggest not having any control logic at all,
but this seems important. The `await` dictates order and the conditional dictates a path. or
what they say is that control is purely accidental.

The handling of failures is necessary too in case of constraint violations. Like if you have
a form and there is some invalid input given, when you try to update the form values you
would get a violation and some kind of error in return. What would you do then to be able to
update the UI? I guess you'd have to /then/ insert some data that describes the error ...
But this is control logic. Maybe that's what they mean by accidental control?
- They just talk about changes being rejected at the feeder level but don't explain how
to deal with that.

Basically what I want to build is a low-code framework that's non-graphical. Ie you still
have all the expressiveness of a text-based programming lanaguage, but you have a runtime
that handles a bunch of the details for you. For example, maybe you write the code that
persists some data via a webservice, but you don't write the code that calls this code?

It's interesting because if the code you write says, INSERT this note in the list of notes
then the first version of that could just store it in memory. And then it's a separate
story to specify that this should be persisted via a webservice (stored and fetched when
necessary). But then you're just enabling something in the runtime, rather than changing
the logic of the program.

Note that Jotai is actually based on the idea of having 'dumb' state and derived state
or what we might call essential state and derived state. So it actually fits pretty
well with what we're maybe trying to do.

So it's really jotai for state management plus snabbdom for rendering parts of the view
as they update. And then an API for updating state that applies constraints and
handles details of storage on a per-piece-of-state basis. The API for updating state
gets called in various ways ... like in an event handler for the 'CustomDisplayEvents'
that are dispatched by the UI. Or in some setInterval or whatever. This is basically
the 'procedure' idea from lds/display but maybe the /only/ thing you can do in a
procedure is call the API to update state (or call another step in the procedure). The
runtime handles all fetching of data from the outside world and any caching.

The problem with jotai, though, is that it's made for react ... I don't know if there's
a way to use it independently of react ... (doesn't seem like it from a google search).
So I guess we could implement the basics of jotai ... 

### Our own state management

We did implement a very simple 'state graph' -- where there are root nodes and then these
can have subscribers that get updated whenever the root state changes. A subscriber just
gets notified when the state changes and then you can read the state to get the value.

It's a state graph because we can derive state from one or more other pieces of state which
will be updated whenever any of those pieces of state themselves are updated.

Ultimately we want to have a view that accepts certain pieces of state, namely,
`State<View>` which will basically be pieces of virtual dom that update whenever some
state they depend on changes. And then we need to assemble these into a single view
that will make up the dom.

The trick is how do we assemble these ... We could have a template or do something else?

It might all just work so long as nothing is nested -- even if the surrounding virtual
dom nodes get messed up and don't have references to the correct dom elements, it
wouldn't matter since the surrounding dom won't change, only the small `State<View>`
components ... but we'd need to try it out to see ...