# Overall Goals

This is a project that is meant to offer a simpler way to create browser-based
web applications. It could potentially offer a repeatable pattern that could be
implemented in other environments, but right now this is focused on apps that
run in the browser. It's also a project that targets the javascript ecosystem
(for better or worse).

This work is inspired by experience working with several different frontend
web frameworks: vue.js, react, angular, elm. There are a few things that I like
about each of these:

- Construct your view programmatically -- ie rather than using templates or
markup directly. Elm and to a certain extent React take the lead here. The thought
here is that there's no need to necessarily /write/ HTML even if ultimately the
application /produces/ HTML. This is a general point: maybe by separating how
we /describe/ certain parts of the application from how those parts are implemented
at a low-level, it's possible to gain efficiency or power or even simplicity over
working at the lower-level directly. I saw React kind of falls into this category
mainly because so many people use JSX with React which mixes html-style templates
with javascript code. I'd prefer to avoid markup if possible in favor of functions
that could more easily be composed into a domain-specific language (hence elm-ui).

- The view is a function of state and updates automatically when state changes.
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

