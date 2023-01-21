# Overall Goals

This is a project that is meant to offer a simpler way to create browser-based
web applications. It could potentially offer a repeatable pattern that could be
implemented in other environments, but right now this is focused on apps that
run in the browser. It's also a project that targets the javascript ecosystem
(for better or worse).

This work is inspired by experience working with several different frontend
web frameworks: vue.js, react, angular, elm. There are a few things that I like
about each of these:

### Write HTML programatically

Construct your view programmatically -- ie rather than using templates or
markup directly. Elm and to a certain extent React take the lead here. The thought
here is that there's no need to necessarily /write/ HTML even if ultimately the
application /produces/ HTML. This is a general point: maybe by separating how
we /describe/ certain parts of the application from how those parts are implemented
at a low-level, it's possible to gain efficiency or power or even simplicity over
working at the lower-level directly. I saw React kind of falls into this category
mainly because so many people use JSX with React which mixes html-style templates
with javascript code. I'd prefer to avoid markup if possible in favor of functions
that could more easily be composed into a domain-specific language (hence elm-ui).

So, we'd like to have a framework that allows us to construct HTML programmatically.

### Declarative views

The view is a function of state and updates automatically when state changes.
Pretty much all these frameworks have some notion of a declarative view framework
that updates automatically in response to state changes. Again, this is an example
of distinguishing /what/ you want from /how/ it happens. The view function specifies
what the UI should look like at any point in time and then the runtime manages to
make that happen. This makes creating a user interface much simpler since there's
no need to write the code that makes the changes from one state to another. There's
a variety of ways to do this -- use a 'virtual dom', write some compiler that generates
all that code for you at compile time (svelte) -- and of course there's various
arguments about which is faster or whatever. The important point though is that
from the perspective of the application writer /it does not matter/. To write an
application, I need only specify what my view should look like given some state and
the runtime takes care of the rest. This is very good for improving the simplicity
of applications.

So, we'd like to have a framework that allows us to declare the view and then the
runtime takes care of making the DOM actually look like what we described.

### Components and Functions

React and vue and other frameworks ask you to think of an application as composed of
components. In the strongest sense, these components are independent and can be composed
together to make the application without them know much of anything about the other
elements they are composed with. While this might sound good, there are some drawbacks:

1. Thinking about an application in this way encourages devs to put everything related to
a component inside that component. Indeed, react's `useEffect` hook supports this idea,
allowing for HTTP requests to fetch data when a component is rendered. Without any
discipline this leads to a system that is very difficult to understand. Not to mention that
the component starts to be a little program itself, knowing how to render html, how to make
http requests, the shape of the data that is returned etc. There are of course better and
worse ways to handle this but the point here is that it puts an incredible amount of
weight on the developer to have the discipline to choose the right path.

2. While some parts of an application may fit the bill of an independent re-usable component,
many times an application is built up of just domain-specific scaffolding that will not
itself be re-used in other circumstances or even in the same application. So even if some
parts of an application can be thought of as components in the strong sense, other parts
of an app -- arguably the most important parts -- do not fit this idea. Thus there are many
'components' that depend on each other in a deep way in order to render the application
under development.

Elm takes a different approach and asks the developer to think of the user interface in terms
of *functions*. The top-level view function will be a mapping from the global state to some
HTML (or some higher-level description of the user interface that could be translated into
HTML by the runtime). Other parts of the view can be broken into functions that are called
by this main function, with the appropriate pieces of state. If one needs to have a part of the
view that is repeated in several places (a 'component') then this just becomes a function
that is called in multiple places with the right set of data. Here, the re-usable element cannot
have its own state, but it can represent a segment of the view that can be repeated in multiple
areas. It's somewhat annoying to not have elements of the view that can track their own
state -- and there are ways to get around this with some extra boilerplate -- but overall
the view itself becomes much simpler to reason about.

We'd like to think of the view as composed of functions, not components. In other words,
state should be maintained outside the portion of the app that describes the view.

### Global and local state

- All state in elm is 'global' in the sense that it is part of the one model that is used
in the main update and main view functions. But react and other frameworks have a notion of
'local' state -- state local to a 'component'. This does seem like a useful thing, especially
when handling forms where it's necessary to track the input state but it's not necessary to
'promote' that to be global state until the form is submitted in some way. Elm makes this
somewhat tedious to manage.
- The good thing about all state being 'global' is that the view function is itself a pure
function that depends only on this state. In react, the view function is not pure in the
functional programming sense because there could be local state. But we should acknowledge
too that the DOM itself is stateful -- HTML form elements track their state.

The one exception to the rule above is that we might want to consider having some sort of
way to specify that an element of the view depends on ephemeral state -- state that is
not necessarily considered to be 'global'.

### One state or many?

One thing that elm requires is for the application state to be defined in terms of one
'model' that contains all data. Any computations on that data for the sake of the view will
need to be done within the view itself or stored as cached computations within the global
state object.

React and other frameworks often take this same approach, with one 'store' that contains
all the application's state. But usually those frameworks also have other ways to track
state too -- local state within a component, fetching state directly via HTTP requests
from a component, accessing state within the document location or cookies, accessing
state within local storage etc.

In addition, there are some 'atomic' state management libraries like jotai and recoil
that take the approach to the other extreme -- state is broken down into small pieces
that can be individually referenced as necessary.

I think it's worth exploring the 'atomic' approach. There's still really one global set
of state but they are referenced individually. This can allow for further optimizations.
For example, it's trivial to know *which* part of the global state has been read or updated,
and so it's possible to do different things for different pieces of state based on that
fact. With one global object, one might need to diff the object or something in order to
understand what changed. It's also nice to treat computed state in a similar way to how
we treat other pieces of state. So, with the atomic approach it's possible to define a
computed or derived piece of state and then have something subscribe to that and be updated
whenever that derived piece of state changes.

In a world where our view is a function of state it's also nice to be able to specify
exactly what state that part of the view depends on. This makes it possible to do things like:
only update the parts of the view that depend on data that has changed.

### Event Handling

For browser-based applications, much of the mechanism occurs through user interaction with
the web page -- clicking on things, inputing values, etc. These frameworks handle this somewhat
differently. For React, it's common to define even handlers within the component itself. These
could pass off values to a store or update local state or even make HTTP requests -- the
behavior is totally up to the developer. Elm again takes a slightly different approach. All
events dispatch messages which eventually trigger a single update function. These messages
are all defined (ultimately) in one list in the app. They have a name and can have data
associated with them as well. The update function has a list of handlers (basically) that
are triggered by individual messages. These handler functions can then update the global
state and/or send a command to the runtime to perform some effect. If the global state is changed,
the view is updated based on the new data (via a virtual dom implementation).

What's nice about elm's approach is that code for the view is solely responsible for describing
what the view should be and any messages that should be sent off to the update function.
This greatly simplifies the view logic and enforces a strict separation of concerns within
the app -- constructing the view is completely separate from updating state and triggering
effects.

So, we'd like our framework to distinguish the view from the mechanism updating the state.
We'd like our view functions to dispatch messages that are processed elsewhere in the app,
rather than doing any processing of those messages within the part of the app that
describes the view.

### How to structure an application

Those are the main things that are kind of common across these frameworks. From here,
elm really starts to take the lead in terms of simplicity since it specifies /one/
way to build an application. One of the main problems with frameworks like React or
Vue.js is that they do not specify a clear way to build a full application. In part,
that's because these frameworks were (I take it) made specifically for rendering
HTML and dealing with events. But since browser-based applications need more than that
it soon became necessary to combine the core libraries with other things to manage
state or whatever. So React has several internal ways to manage state but then there
are different approaches beyond that -- for example, redux offers an elm-like
experience but is not super-well integrated into React (although I guess that's better
now with hooks). But redux is not the only way to manage an application -- there's
mobx, there's 'atomic' state mangement like jotai and recoil, there's alternatives to
redux like zustand, etc. The same is true with vue.js although the integration with
vuex for an elm-like experience has been very easy since the beginning. But it's not
just about having a choice of libraries for state management -- with corresponding
application patterns. It's that even if you chose one of these libraries there's still
a bunch of ways to structure an application.

What is so good about elm? People focus on the so-called 'elm architecture' which is
an application flow where some message is processed by a single update function, which
results in either a new message (via a command) and/or an update to the single application
state, which then results in an update to the view (itself represented ulimately as a
single function of application state). This is what redux, vuex and other libraries try to
represent -- a single 'model' or 'store' holding all the application state, and a flow
where that model is updated and things that depend on it (like the view) are then
updated accordingly.

The elm architecture does make things very straightforward when creating an elm application.
But I think it's not the elm architecture that is so great ... the great thing about elm is
that: **there is only one possible way of structuring an application.** Now that's not exactly
true. There are discussions about various patterns that people can implement to structure
a large elm application. But overall the need to choose how to do things is severly
restricted. This is good for two reasons. (1) It's easier to learn and figure out how to
go forward and (2) It allows the runtime to take care of things for you, since it can
understand more about what your application is trying to do.

(2) is interesting. Elm is a functional programming language with 'managed effects'. That
means basically that the runtime tries to handle anything that interacts with the outside world.
In practice this isn't a whole lot different from working with high-level libraries for doing
things like making HTTP requests. And with elm it can be frustrating since the elm programming
language doesn't really allow access to writing code that would manage effects. If you use elm
you're kind of stuck with the managed effects that are provided already. The one example where
the runtime does some interesting work for you is with what's called 'subscriptions'. In elm,
subscriptions are declarative -- so, based on that model, the runtime will do the work of
subscribing to or unsubscribing from certain subscriptions. This is nice, and another example
of declarative programming making things easier. What's interesting about Elm's managed
effects is that they don't really make things all that simpler -- you still have to construct
an HTTP request and all that, you just use a different library to do so. In a lot of cases
what we have is a description of how things should be done instead of simply describing what
should be the case. Maybe HTTP is a bad example but I think it fits since it's describing
details about the transport mechanism and all that. You could imagine a world in which we simply
say 'save this data' and the runtime figures out whether to use HTTP or something else ...

So, to me, while Elm does have a runtime that keeps the app going -- by calling update and calling
view and managing subscriptions -- it also starts to leak in some less-than-fully-declarative
components too when it comes to dealing with commands. And that's when programming in Elm starts
to get kind of annoying. Once you create a command to issue an HTTP request, you now need a message
to handle the response -- and deal with whether it is an error or not. This starts to make the
update function larger and also separates the code that initiates a request from the code that
handles a response to that request -- a separation that sometimes feels unnecessary and like
it's dividing things that maybe should be together.

So, we'd like our framework to specify one way to organize an application (as much as possible)
and we'd like our framework to have a robust runtime that takes care of as much of
the low-level details of the application as possible -- or at least separates them from the
application logic.

### A Hypothesis about Application Structure

So how should we structure our application? What should the runtime be able to do for us?

Taking a cue from the "Out of the Tar Pit" paper, here's a hypothesis. We divide the
application into four-ish parts:

1. Atomic state (and derived state)
2. View functions and event handlers that send messages
3. Procedures that are triggered by messages (or potentially other means) and update state
4. Constraints that define whether state updates are valid
5. Storage hints that define how particular pieces of state are stored and fetched

Hopefully this has some benefits. We first describe our core application state, independently
of how that state is stored or fetched. And we define any derived state that depends on the
core state. The view is purely declarative and described using functions that map state (or
derived state) to HTML or some higher-level representation. Event Handlers send messages back
into the system. Procedures listen for these messages and make updates to one or more
pieces of state. Constraints can be defined independently to do validation on state. If a
write to a piece of state fails one of these constraints then an error result is provided.
Finally, we define separately how to fetch or write the data that is the state. Sometimes
this could be cached in memory (probably the default). Other times we might send an HTTP
request to save the data to the backend or we might store in local storage or do both. We might
also combine pieces of state into one message that gets sent to the backend. The
hypothesis here is that details about how we fetch and store data should be defined independently
of the shape of the data itself. (Think SWR style fetching that would be supported by the runtime)

One element of this that seems extreme is the claim in (3) that procedures are triggered
by messages and update state. Is that sufficient? or are there cases where it might be
necessary to do something else -- like make a one off HTTP request or read the document location
or something like that? Elm handles some of this stuff with `subscriptions` and some with `commands`
that query the dom or the browser. It's unclear right now whether we need to allow
procedures to do side effects or whether they could just be descriptions of how the
data should be transformed. Procedures should be able to handle the case, however, when
a write to state fails, either due to a constraint violation or some storage process error.

Note that the view functions and the procedures are really just 'listeners' and 'feeders'.
That is to say, the view functions are just an example of a part of the application that listens
for updates to the state and does something in response. And a feeder is just something that
updates state depending on certain conditions. There could be other listeners and feeders
potentially. For example, something that listens for navigation changes and updates the state
accordingly. Or something that sends a message on a websocket when some state changes or
something that changes state when a websocket message is received. In short, procedures should
have various ways of being triggered. And we should allow arbitrary functions to subscribe
to state changes.

It might seem that constraints could just be part of procedures. However, in that case, it's
necessary to remember (and test) that the constraint holds for any procedure that modifies a
given piece of state. By specifying constraints independently of procedures we allow the
runtime to ensure that whenever that state is updated, no matter how, the constraint must
hold.

Why do I think this will actually reduce complexity and making it simpler to develop
software?

First of all, by separating out details of storage we make it easier to concentrate on the
details of the problem at hand (hopefully). The work of defining the state, defining the
derived state, and defining the constraints is really the work of 'domain modeling'. Then,
by separating out the view into parts that depend on particular pieces of state, we try to
make it easy to generate parts of the view without having to have a huge nested hierarchy
of stuff. Finally, by making the view declarative this simplifies things obviously, and
by moving any logic into procedures and /out of/ the view, hopefully that simplifies things
as well -- with the hope being that each part of the app does just what it needs to do.